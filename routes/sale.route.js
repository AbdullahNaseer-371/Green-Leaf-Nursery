const express = require("express");

const saleRouter = express.Router();


const {
    createSale,
    getSales,
    getSaleById,
    updateSale,
    deleteSale,
    getSalesReport
} = require("../controller/sale.controller.js");


const {
    authenticate,
    authorize
} = require("../middleware/authmiddleware.js");



saleRouter.post(
    "/",
    authenticate,
    authorize("create"),
    createSale
);




saleRouter.get(
    "/report",
    authenticate,
    authorize("read"),
    getSalesReport
);




saleRouter.get(
    "/",
    authenticate,
    authorize("read"),
    getSales
);



saleRouter.get(
    "/:id",
    authenticate,
    authorize("read"),
    getSaleById
);



saleRouter.put(
    "/:id",
    authenticate,
    authorize("update"),
    updateSale
);




saleRouter.delete(
    "/:id",
    authenticate,
    authorize("delete"),
    deleteSale
);


module.exports = saleRouter;