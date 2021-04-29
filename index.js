const express = require("express");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000
const app = express();

require('dotenv').config();
let mongoURL = process.env.MongoDB_URL;

//Mongo Connection
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

app.use(express.json());

//Main Route
app.route("/").get((req, res) => res.json("Root"));
const scrapeRoute = require("./routes/data_scrape");
app.use("/scrapedata", scrapeRoute)

//Access Log
app.listen(PORT, () => console.log(`Server running successfully at ${PORT}`));
