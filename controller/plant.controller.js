const plantService = require("../service/plant.service.js");
const { asyncHandler, ApiResponse } = require("../utils/asyncHandler.js");


const createPlant = asyncHandler(async (req, res) => {
    const result = await plantService.createPlant(req.body);

    return res
        .status(201).json(new ApiResponse(201, result.plant, result.message));
});

const getPlants = asyncHandler(async (req, res) => {
    const { category, status, page, limit, explain } = req.query;

    const result = await plantService.getPlants({
        category,
        status,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        explain: explain === "true"
    });

    
    const payload = result.plan || {
        plants: result.plants,
        pagination: result.pagination
    };

    return res
        .status(200)
        .json(new ApiResponse(200, payload, result.message));
});

const getPlantById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await plantService.getPlantById(id);

    return res
        .status(200)
        .json(new ApiResponse(200, result.plant, result.message));
});

const updatePlant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await plantService.updatePlant(id, req.body);

    return res
        .status(200)
        .json(new ApiResponse(200, result.plant, result.message));
});

const deletePlant = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await plantService.deletePlant(id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, result.message));
});

module.exports = {
    createPlant,
    getPlants,
    getPlantById,
    updatePlant,
    deletePlant
};
