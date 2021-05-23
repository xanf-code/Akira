// const express = require("express");
// var request = require("request");
// const Screener = require("../models/screener_model");
// const router = express.Router();

// router.get("/", async (req, res) => {
//     try {
//         await Screener.collection.drop().then(() => {
//             request("https://insidershibu.herokuapp.com/screener/scrapescreener");
//             res.send({
//                 type: "DB Deleted",
//                 status: 200,
//             });
//         });
//     } catch (e) {
//         res.send({
//             type: e.message,
//             status: 500,
//         });
//     }
// });

// module.exports = router;

// //openinsiderAPI.herokuapp.com
