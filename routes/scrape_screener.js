const express = require("express");
const request = require("request-promise");
const cheerio = require("cheerio");
const Screener = require("../models/screener_model");
var mcache = require("memory-cache");

const router = express.Router();

var cache = (duration) => {
    return (req, res, next) => {
        let key = "__express__" + req.originalUrl || req.url;
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    };
};

//ScrapeData
router.get("/scrapescreener", async (req, res) => {
    try {
        for (index = 1; index <= 10; index++) {
            await request(
                `https://www.insiderscreener.com/en/explore?page=${index}&sort_by=transaction_date&sort_order=descending&transaction_type=BUY&transaction_type=SELL&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9`,
                (error, response, html) => {
                    scrapefunction(error, response, html);
                }
            );
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    } finally {
        res.send({
            type: "Data Scraped",
            status: 200,
        });
    }
});

function scrapefunction(error, response, html) {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        $(
            "#transactions > div > div > div.table-responsive-md > table > tbody > tr"
        ).each((i, el) => {
            database_transactionDate = $(el).find("td:nth-child(3)").text().trim();
            database_companyName = $(el)
                .find("td:nth-child(4) > div > a:nth-child(1)")
                .text()
                .trim();
            database_ticker = $(el)
                .find("td:nth-child(4) > div > span")
                .text()
                .trim();
            database_companyType = $(el)
                .find("td:nth-child(4) > small")
                .text()
                .trim();
            database_insiderName = $(el).find("td:nth-child(6) > p").text().trim();
            database_insiderTitle = $(el)
                .find("td:nth-child(6) > span")
                .text()
                .trim();
            database_tradeType = $(el)
                .find("td:nth-child(5) > span > span.d-none.d-sm-block")
                .text()
                .trim();
            database_tradePrice = $(el).find("td:nth-child(9)").text().trim();
            database_quantityshares = $(el)
                .find("td:nth-child(8)")
                .text()
                .trim()
                .split("\n")[0];
            database_percentage = $(el)
                .find("td:nth-child(8) > span > i > b")
                .text()
                .trim();
            database_value = $(el)
                .find(
                    "td.font-weight-bold.align-middle.text-right.d-none.d-sm-table-cell > span"
                )
                .text()
                .trim()
                .replace(/\n/g, "");
            database_countryImage = $(el).find("td:nth-child(1) > img").attr("src");
            database_companyLink = $(el)
                .find("td:nth-child(4) > div > a:nth-child(1)")
                .attr("href");
            const screener = Screener({
                TransactionDate: database_transactionDate,
                Ticker: database_ticker,
                CompanyType: database_companyType,
                CompanyName: database_companyName,
                InsiderName: database_insiderName,
                InsiderTitle: database_insiderTitle,
                TradeType: database_tradeType,
                Price: database_tradePrice,
                QuantityShares: database_quantityshares,
                Percentage: database_percentage,
                Value: database_value,
                url: {
                    CompanyLink: database_companyLink,
                    CountryImage: database_countryImage,
                },
            });
            screener.save();
        });
    }
}

//GET All insider
router.get("/api/v1/screener", cache(43200), async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const count = await Screener.countDocuments();
        const result = await Screener.find({}, "-__v")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ rank: +1 });
        res.status(200).json({
            serverTime: Date.now(),
            length: count,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            perPage: limit,
            totalPages: parseInt((count / limit).toFixed()),
            isNextPageExist: page + 1 <= count / limit ? true : false,
            isLastPageExist: page - 1 == 0 ? false : true,
            result: result,
        });
    } catch (e) {
        res.status(500).json({
            error: e,
        });
    }
});

//InsiderName Individual
router.get("/api/v1/screener/:insiderName", async (req, res) => {
    try {
        const result = await Screener.find(
            { InsiderName: req.params.insiderName },
            "-__v"
        );
        res
            .status(200)
            .json({ serverTime: Date.now(), total: result.length, result });
    } catch (err) {
        console.log(error);
        res.status(500).json({
            error: err,
        });
    }
});

module.exports = router;
