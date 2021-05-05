const express = require('express');
const request = require("request-promise")
const cheerio = require("cheerio")
const Insider = require('../models/insider_model');

const router = express.Router();

const url = 'http://openinsider.com/screener?s=&o=&pl=&ph=&ll=&lh=&fd=730&fdr=&td=0&tdr=&fdlyl=&fdlyh=&daysago=&xp=1&xs=1&vl=&vh=&ocl=&och=&sic1=-1&sicl=100&sich=9999&isceo=1&iscoo=1&iscfo=1&isvp=1&isdirector=1&istenpercent=1&grp=0&nfl=&nfh=&nil=&nih=&nol=&noh=&v2l=&v2h=&oc2l=&oc2h=&sortcol=1&cnt=500'

router.get("/", async (req, res) => {
    try {
        await request(url, (error, response, html) => {
            scrapefunction(error, response, html)
        }).then(() => {
            res.send({
                type: 'scrape',
                status: 200
            });
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
})

function scrapefunction(error, response, html) {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        $("#tablewrapper > table > tbody > tr").each((i, el) => {
            database_date = $(el).find('td:nth-child(3) > div').text();
            database_ticker = $(el).find('td:nth-child(4) > b > a').text();
            database_tickerImageUrl = `https://www.profitspi.com/stock/stock-charts.ashx?chart=${database_ticker}&v=stock-chart&vs=637553767788578012`;
            database_communityURL = `https://api.stocktwits.com/api/2/streams/symbol/${database_ticker}.json?filter=top&limit=20`;
            database_newsURL = `https://seekingalpha.com/api/v3/symbols/${database_ticker}/news?page[size]=5`,
                database_companyName = $(el).find('td:nth-child(5) > a').text();
            database_insiderName = $(el).find('td:nth-child(6) > a').text();
            database_insiderLink = $(el).find('td:nth-child(6) > a').attr('href');
            database_insiderID = $(el).find('td:nth-child(6) > a').attr('href').substring(database_insiderLink.length - 7);
            database_insiderTitle = $(el).find('td:nth-child(7)').text();
            database_tradeType = $(el).find('td:nth-child(8)').text();
            database_tradePrice = $(el).find('td:nth-child(9)').text();
            database_tradeQuantity = $(el).find('td:nth-child(10)').text();
            database_stocksOwned = $(el).find('td:nth-child(11)').text();
            database_stockPercent = $(el).find('td:nth-child(12)').text();
            database_value = $(el).find('td:nth-child(13)').text();

            const insider = Insider({
                date: database_date,
                ticker: database_ticker,
                tickerImageUrl: database_tickerImageUrl,
                communityURL: database_communityURL,
                newsURL: database_newsURL,
                companyName: database_companyName,
                insiderName: database_insiderName,
                insiderLink: database_insiderLink,
                insiderID: database_insiderID,
                insiderTitle: database_insiderTitle,
                tradeType: database_tradeType,
                tradePrice: database_tradePrice,
                tradeQuantity: database_tradeQuantity,
                stocksOwned: database_stocksOwned,
                stockPercent: database_stockPercent,
                value: database_value,
            });
            insider.save();
        });
    }
}

router.get('/getInsiderData', async (req, res) => {
    try {
        const _query = req.query;
        const result = await Insider.find({}, "-__v").limit(parseInt(_query.limit));
        res.status(200).json({ total: result.length, result });
    } catch (err) {
        console.log(error);
        res.status(500).json({
            error: err
        })
    }
})

//InsiderName Sort
router.get('/getInsiderData/:insiderName', async (req, res) => {
    try {
        const result = await Insider.find({ insiderName: req.params.insiderName }, "-__v,-_id");
        res.status(200).json({ total: result.length, result });
    }
    catch (err) {
        console.log(error);
        res.status(500).json({
            error: err
        })
    }
})

module.exports = router;