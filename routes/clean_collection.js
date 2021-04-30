const express = require('express');
const Insider = require('../models/insider_model');
var request = require("request");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await Insider.collection.drop().then(() => {
            //request("localhost:5000/scrapedata");
            request("https://insidershibu.herokuapp.com/scrapedata");
            res.send({
                type: 'delete',
                status: 200
            });
        })
    } catch (error) {
        res.send({
            type: 'error',
            status: 500
        });
    }
})

module.exports = router;