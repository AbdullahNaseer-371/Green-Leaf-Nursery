const express = require("express");

const catRouter = express.Router();


const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controller/catgeory.controller.js");


const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware.js");



catRouter.post(
    "/",
    authenticate,
    authorize("create"),
    createCategory
);



catRouter.get(
    "/",
    authenticate,
    authorize("read"),
    getCategories
);



catRouter.get(
    "/:id",
    authenticate,
    authorize("read"),
    getCategoryById
);



catRouter.put(
    "/:id",
    authenticate,
    authorize("update"),
    updateCategory
);



catRouter.delete(
    "/:id",
    authenticate,
    authorize("delete"),
    deleteCategory
);


module.exports = catRouter;