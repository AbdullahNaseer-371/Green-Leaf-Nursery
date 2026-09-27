const categoryService = require("../service/category.service.js");

const {
    asyncHandler,
    ApiResponse
} = require("../utils/asyncHandler.js");


// CREATE CATEGORY
const createCategory = asyncHandler(async (req, res) => {

    const result = await categoryService.createCategory(
        req.body
    );


    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                result.category,
                result.message
            )
        );
});


// GET ALL CATEGORIES
const getCategories = asyncHandler(async (req, res) => {

    const {
        search,
        explain
    } = req.query;


    const result = await categoryService.getCategories({
        search,
        explain: explain === "true"
    });


    // Explain query
    if (result.plan) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result.plan,
                    result.message
                )
            );
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.categories,
                result.message
            )
        );
});


// GET CATEGORY BY ID
const getCategoryById = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await categoryService.getCategoryById(id);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.category,
                result.message
            )
        );
});


// UPDATE CATEGORY
const updateCategory = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await categoryService.updateCategory(
            id,
            req.body
        );


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.category,
                result.message
            )
        );
});


// DELETE CATEGORY
const deleteCategory = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await categoryService.deleteCategory(id);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                result.message
            )
        );
});


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};