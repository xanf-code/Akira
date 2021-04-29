const express = require('express');
const Insider = require('../models/insider_model');

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await Insider.collection.drop().then(() => {
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