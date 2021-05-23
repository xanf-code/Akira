const express = require("express");
const axios = require("axios");
const Screener = require("../models/screener_model");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await Screener.collection.drop().then(() => {
            axios.get("https://insidershibu.herokuapp.com/screener/scrapescreener");
            res.send({
                type: "DB Deleted",
                status: 200,
            });
        });
    } catch (error) {
        res.send({
            type: "error",
            status: 500,
        });
    }
});

module.exports = router;

//openinsiderAPI.herokuapp.com
