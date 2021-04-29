const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Insider = Schema({
    date: {
        type: String,
    },
    ticker: {
        type: String,
    },
    companyName: {
        type: String,
    },
    insiderName: {
        type: String,
    },
    insiderLink: {
        type: String,
    },
    insiderID: {
        type: String,
    },
    insiderTitle: {
        type: String,
    },
    tradeType: {
        type: String,
    },
    tradePrice: {
        type: String,
    },
    tradeQuantity: {
        type: String,
    },
    stocksOwned: {
        type: String,
    },
    stockPercent: {
        type: String,
    },
    value: {
        type: String,
    },
});

module.exports = mongoose.model("Insider", Insider);