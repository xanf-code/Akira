const express = require("express");
const request = require("request-promise");
const cheerio = require("cheerio");
const Screener = require("../models/screener_model");
var mcache = require("memory-cache");

const router = express.Router();
const url = 'https://www.insiderscreener.com/en/explore?instrument=&company_id=&tracked=&insider=&position=&position_type=1&position_type=2&position_type=3&position_type=4&position_type=5&position_type=6&position_type=7&position_type=8&position_type=9&transaction_type=BUY&transaction_type=SELL&nb_shares=&amount=&sort_by=transaction_date&sort_order=descending'

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
router.get("/screener", async (req, res) => {
    try {
        await request({
            url: url,
            headers: {
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,kn;q=0.8',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
                'csrftoken': '9a2rWv4yjuVvl4fnzX2a2iHCZzPFONLxazEBHBvOx5Igis4Kcjto2zvGl7UFgPaq',
                'cookie': '_gid=GA1.2.655310139.1621762775; _clck=1dd4e68; __stripe_mid=d751bbc4-1385-43ea-a5df-03c78e04b4e54fe3e2; __stripe_sid=ad4099d9-c538-4e6c-99c8-52d79b544709e819f5; __cf_bm=0b3298f28b6fb32705a90702032b5273f226be23-1621780485-1800-AfwNRQQFFVgw7hsNtvJsuBT+M/E4gDEyAm5GUA7PMZif73nfBUTsTXN8h7Xagldw+Y7Vl86q+swu8ULdP4Oc6pHpXekBS2ajb5Ybm/N2Kyj7IQp5o/T0zijYCHSWq65CRA==; _gat_gtag_UA_164596270_1=1; messages=.eJyLjlaKj88qzs-Lz00tLk5MT1XSMdAxMtVRCi5NTgaKpJXm5FQqFGem56WmKGTmKSQWK2SnlmWClOdkFmdkJuopxergMiMyv1QhI7EsFaY_v7QEn_LBbWUsAHAxZz4:1lkpDv:fjTWwDpfmH_8ntvZr6CYLWNsKVYzJNKobvfrYEV_bM8; csrftoken=9KPKvGYrkwVFxdG1Jcs6Yl8BivqkoN94a9rUgMpHy7IquBvomyTkYCWFE3vkQPyX; sessionid=5k39qu7ajj6s07y8tsj9ubs9m0jvxnuq; _clsk=13cxzy1|1621780619827|4|1|eus/collect; _ga=GA1.2.489329222.1621762775; _ga_FVDXLG2EZR=GS1.1.1621777303.3.1.1621780636.0',
            }
        }, (error, response, html) => {
            scrapefunction(error, response, html)
        }).then(() => {
            res.send({
                type: 'scrape',
                status: 200
            });
        });
    } catch (error) {
        res.send({
            type: 'error',
            status: 500
        });
    }
})

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
                .trim();
            // .split("\n")[0];
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
