const express = require("express");

const { connectDB } = require("./config/db.js");
const { cors } = require("./config/cors.js");

const { rateLimiter } = require("./config/rateLimiter.js");


const { ENV } = require("./config/env.js");




const route = require("./routes/user.route.js");
const categoryRoute = require("./routes/category.route.js");
const plantRoute = require("./routes/plant.route.js");
const saleRoute = require("./routes/sale.route.js");




const host = ENV.HOST;
const port = ENV.PORT;

const app = express();





app.use(rateLimiter);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api/auth", route);


app.use("/api/categories", categoryRoute);


app.use("/api/plants", plantRoute);


app.use("/api/sales", saleRoute);




connectDB().then(() => {
    app.listen(port, host, () => {
        console.log(`HTTP server is ready on ${host}:${port}`);
    });
});