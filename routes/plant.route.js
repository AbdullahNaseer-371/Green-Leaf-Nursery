const express = require("express");
const plantRouter = express.Router();

const {
    createPlant,
    getPlants,
    getPlantById,
    updatePlant,
    deletePlant
} = require("../controller/plant.controller.js");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware.js");


plantRouter.post(
    "/",
    authenticate,
    authorize("create"),
    createPlant
);


plantRouter.get(
    "/",
    authenticate,
    authorize("read"),
    getPlants
);


plantRouter.get(
    "/:id",
    authenticate,
    authorize("read"),
    getPlantById
);


plantRouter.put(
    "/:id",
    authenticate,
    authorize("update"),
    updatePlant
);

plantRouter
plantRouter.delete(
    "/:id",
    authenticate,
    authorize("delete"),
    deletePlant
);

module.exports = plantRouter;