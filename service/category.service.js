const Category = require("../model/category.model.js");
const { API_MESSAGE } = require("../constants/apiMessage.Constant.js");
const { ApiError } = require("../utils/asyncHandler.js");

const { isValidObjectId } = require("mongoose");



const createCategory = async (categoryData) => {
    const { name, sku } = categoryData;

    if (!name || !name.trim()) {
        throw new ApiError(
            400,
            "Category name is required."
        );
    }


    // Check duplicate category name
    const existingCategory = await Category.findOne({
        name: name.trim()
    });

    if (existingCategory) {
        throw new ApiError(
            409,
            "Category with this name already exists."
        );
    }


    // Check manually provided SKU
    if (sku) {
        const existingSku = await Category.findOne({ sku });

        if (existingSku) {
            throw new ApiError(
                409,
                "Category with this SKU already exists."
            );
        }
    }


    const category = await Category.create(categoryData);

    return {
        category,
        message: API_MESSAGE.CREATED
    };
};


// GET ALL CATEGORIES
const getCategories = async ({
    search,
    explain = false
} = {}) => {

    const filter = {};


    // Optional search
    if (search) {
        filter.name = {
            $regex: search,
            $options: "i"
        };
    }


    // Query execution plan
    if (explain) {
        const plan = await Category
            .find(filter)
            .sort({ name: 1 })
            .explain("executionStats");

        return {
            plan,
            message: "Query execution plan retrieved successfully."
        };
    }


    // Get all categories
    const categories = await Category
        .find(filter)
        .sort({ name: 1 });


    return {
        categories,
        message: API_MESSAGE.FETCHED
    };
};


// GET CATEGORY BY ID
const getCategoryById = async (categoryId) => {

    if (!isValidObjectId(categoryId)) {
        throw new ApiError(
            400,
            "Invalid category ID."
        );
    }


    const category = await Category.findById(categoryId);

    if (!category) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    return {
        category,
        message: API_MESSAGE.FETCHED
    };
};


// UPDATE CATEGORY
const updateCategory = async (categoryId, updateData) => {

    if (!isValidObjectId(categoryId)) {
        throw new ApiError(
            400,
            "Invalid category ID."
        );
    }


    // SKU should not be changed
    delete updateData.sku;


    // Check duplicate category name
    if (updateData.name) {

        updateData.name = updateData.name.trim();

        const existingCategory = await Category.findOne({
            name: updateData.name,
            _id: { $ne: categoryId }
        });

        if (existingCategory) {
            throw new ApiError(
                409,
                "Category with this name already exists."
            );
        }
    }


    const category = await Category.findByIdAndUpdate(
        categoryId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );


    if (!category) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    return {
        category,
        message: API_MESSAGE.UPDATED
    };
};


// DELETE CATEGORY
const deleteCategory = async (categoryId) => {

    if (!isValidObjectId(categoryId)) {
        throw new ApiError(
            400,
            "Invalid category ID."
        );
    }


    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    return {
        message: API_MESSAGE.DELETED
    };
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};