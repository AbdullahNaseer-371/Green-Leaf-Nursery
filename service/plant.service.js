const Plant = require("../model/plant.model.js");
const { API_MESSAGE } = require("../constants/apiMessage.Constant.js");

const { ApiError } = require("../utils/asyncHandler.js");
const { isValidObjectId } = require("mongoose");
const uploadToCloudinary = require("../utils/cloudinaryUploads");
const cloudinary = require("../config/cloudinary.js");



const Category = require("../model/category.model.js");


// Create Plant
const createPlant = async (plantData, file) => {
    const { name, sku, category } = plantData;

    // Validate plant name
    if (!name || !name.trim()) {
        throw new ApiError(400, "Plant name is required.");
    }

    // Validate category ID
    if (!category || !isValidObjectId(category)) {
        throw new ApiError(400, "Valid Category ID is required.");
    }

    // Check whether category exists
    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
        throw new ApiError(404, "Category not found.");
    }

    // Check duplicate plant name
    const existingName = await Plant.findOne({
        name: name.trim()
    });

    if (existingName) {
        throw new ApiError(409, "Plant with this name already exists.");
    }

    // Check manually provided SKU
    if (sku) {
        const existingSku = await Plant.findOne({ sku });

        if (existingSku) {
            throw new ApiError(
                409,
                "Plant item with this SKU already exists."
            );
        }
    }

    let image = {
        public_id: null,
        url: null
    };

    // Upload image to Cloudinary
    if (file) {
        const uploadedImage = await uploadToCloudinary(
            file.buffer,
            "GREENLEAF/PLANTS"
        );

        image = {
            public_id: uploadedImage.publicId,
            url: uploadedImage.url
        };
    }

    try {
        const plant = await Plant.create({
            ...plantData,
            name: name.trim(),
            category,
            image
        });

        return {
            plant,
            message: API_MESSAGE.CREATED
        };

    } catch (error) {

        // Delete uploaded image if MongoDB creation fails
        if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
        }

        throw error;
    }
};




const getPlants = async ({ category, status, page = 1, limit = 10, explain = false } = {}) => {
    let filter = {};

    if (category) {
        
        if (!isValidObjectId(category)) {
            throw new ApiError(400, "Invalid Category ID filter format.");
        }
        filter.category = category;
    }
    if (status) filter.status = status;

    
    if (explain) {
        const plan = await Plant.find(filter).explain("executionStats");
        return { plan, message: "Query execution plan retrieved successfully." };
    }

    const skip = (page - 1) * limit;

    
    const [plants, total] = await Promise.all([
        Plant.find(filter)
            .sort({ stock: -1 })
            .skip(skip)
            .limit(limit),
        Plant.countDocuments(filter)
    ]);

    return {
        plants,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },
        message: API_MESSAGE.FETCHED
    };
};

const getPlantById = async (plantId) => {
    if (!isValidObjectId(plantId)) {
        throw new ApiError(400, "Invalid plant ID.");
    }

    const plant = await Plant.findById(plantId);
    if (!plant) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    return {
        plant,
        message: API_MESSAGE.FETCHED
    };
};

const updatePlant = async (plantId, updateData) => {
    if (!isValidObjectId(plantId)) {
        throw new ApiError(400, "Invalid plant ID.");
    }

    // FIX 3: Validate category if it is being modified during an update
    if (updateData.category && !isValidObjectId(updateData.category)) {
        throw new ApiError(400, "Invalid Category ID format.");
    }

    // SKU codes must remain immutable during catalog modifications
    delete updateData.sku;

    const plant = await Plant.findByIdAndUpdate(
        plantId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!plant) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    return {
        plant,
        message: API_MESSAGE.UPDATED
    };
};

const deletePlant = async (plantId) => {
    if (!isValidObjectId(plantId)) {
        throw new ApiError(400, "Invalid plant ID.");
    }

    const plant = await Plant.findByIdAndDelete(plantId);
    if (!plant) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    return {
        message: API_MESSAGE.DELETED
    };
};

module.exports = {
    createPlant,
    getPlants,
    getPlantById,
    updatePlant,
    deletePlant
};
