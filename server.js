const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000
const app = express();
var cors = require('cors')

app.set('view engine', 'ejs')
app.set('view options', {
    layout: false
})

require('dotenv').config();
let mongoURL = process.env.MongoDB_URL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MpongoDB is connected");
});

app.use(express.json(), cors());

app.route("/").get((req, res) => {
    res.render('index')
});

const scrapeRoute = require("./routes/data_scrape");
app.use("/scrapedata", scrapeRoute);
const deleteRoute = require("./routes/clean_collection");
app.use("/clean", deleteRoute);
const scrapeScreenerRoute = require("./routes/scrape_screener");
app.use("/screener", scrapeScreenerRoute);
const deleteScreenerRoute = require("./routes/clean_screener");
app.use("/screener/clean", deleteScreenerRoute);

app.listen(PORT, () => console.log(`Server running successfully at ${PORT}`));
