
const Sale = require("../model/sale.model.js");
const Plant = require("../model/plant.model.js");


const isValidObjectId  = "mongoose";

const {
    API_MESSAGE
} = require("../constants/apiMessage.Constant.js");

const {
    ApiError
} = require("../utils/asyncHandler.js");


// ======================================================
// CREATE SALE
// ======================================================

const createSale = async (saleData, userId) => {

    const { plantId, quantity } = saleData;

    if (!isValidObjectId(plantId)) {
        throw new ApiError(400, "Invalid plant ID.");
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
        throw new ApiError(
            400,
            "Quantity must be a positive integer."
        );
    }

    const plant = await Plant.findById(plantId);

    if (!plant) {
        throw new ApiError(404, "Plant not found.");
    }

    if (plant.stock < quantity) {
        throw new ApiError(
            400,
            "Insufficient plant stock."
        );
    }

    const totalPrice = plant.price * quantity;

    const sale = await Sale.create({
        plantId,
        quantity,
        totalPrice,
        soldBy: userId
    });

    plant.stock -= quantity;
    await plant.save();

    return {
        sale,
        message: API_MESSAGE.CREATED
    };
};


// ======================================================
// GET ALL SALES
// ======================================================

const getSales = async ({
    plantId,
    soldBy,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    explain = false
} = {}) => {

    const match = {};

    // Plant filter
    if (plantId) {
        if (!isValidObjectId(plantId)) {
            throw new ApiError(400, "Invalid plant ID.");
        }

        match.plantId = new mongoose.Types.ObjectId(plantId);
    }

    // Seller filter
    if (soldBy) {
        if (!isValidObjectId(soldBy)) {
            throw new ApiError(400, "Invalid seller ID.");
        }

        match.soldBy = new mongoose.Types.ObjectId(soldBy);
    }

    // Date filter
    if (startDate || endDate) {

        match.createdAt = {};

        if (startDate) {
            const start = new Date(startDate);

            if (Number.isNaN(start.getTime())) {
                throw new ApiError(400, "Invalid start date.");
            }

            match.createdAt.$gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);

            if (Number.isNaN(end.getTime())) {
                throw new ApiError(400, "Invalid end date.");
            }

            end.setHours(23, 59, 59, 999);
            match.createdAt.$lte = end;
        }
    }

    // Explain query
    if (explain) {

        const plan = await Sale.find(match)
            .explain("executionStats");

        return {
            plan,
            message: "Sales execution plan retrieved successfully."
        };
    }

    // Pagination validation
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Math.max(1, Number(limit) || 10));

    const skip = (page - 1) * limit;

    // Fetch sales
    const [sales, total] = await Promise.all([

        Sale.find(match)
            .populate("plantId", "userName sku price stock")
            .populate("soldBy", "userName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Sale.countDocuments(match)

    ]);

    return {
        sales,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        },

        message: API_MESSAGE.FETCHED
    };
};


// ======================================================
// GET SALE BY ID
// ======================================================

const getSaleById = async (saleId) => {

    if (!isValidObjectId(saleId)) {
        throw new ApiError(400, "Invalid sale ID.");
    }

    const sale = await Sale.findById(saleId)
        .populate("plantId", "name sku price stock")
        .populate("soldBy", "name email");

    if (!sale) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    return {
        sale,
        message: API_MESSAGE.FETCHED
    };
};


// ======================================================
// UPDATE SALE
// ======================================================

const updateSale = async (saleId, updateData) => {

    if (!isValidObjectId(saleId)) {
        throw new ApiError(400, "Invalid sale ID.");
    }

    // Prevent changing protected fields
    updateData = { ...updateData };

    delete updateData.plantId;
    delete updateData.soldBy;
    delete updateData.totalPrice;

    const existingSale = await Sale.findById(saleId);

    if (!existingSale) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    if (updateData.quantity !== undefined) {

        const newQuantity = Number(updateData.quantity);

        if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
            throw new ApiError(
                400,
                "Quantity must be a positive integer."
            );
        }

        const plant = await Plant.findById(existingSale.plantId);

        if (!plant) {
            throw new ApiError(404, "Plant not found.");
        }

        const quantityDifference =
            newQuantity - existingSale.quantity;

        if (quantityDifference > 0) {

            if (plant.stock < quantityDifference) {
                throw new ApiError(
                    400,
                    "Insufficient plant stock."
                );
            }

            plant.stock -= quantityDifference;

        } else if (quantityDifference < 0) {

            plant.stock += Math.abs(quantityDifference);
        }

        await plant.save();

        updateData.totalPrice =
            plant.price * newQuantity;
    }

    const sale = await Sale.findByIdAndUpdate(
        saleId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    )
        .populate("plantId", "name sku price stock")
        .populate("soldBy", "name email");

    return {
        sale,
        message: API_MESSAGE.UPDATED
    };
};


// ======================================================
// DELETE SALE
// ======================================================

const deleteSale = async (saleId) => {

    if (!isValidObjectId(saleId)) {
        throw new ApiError(400, "Invalid sale ID.");
    }

    const sale = await Sale.findById(saleId);

    if (!sale) {
        throw new ApiError(404, API_MESSAGE.NOT_FOUND);
    }

    // Restore plant stock
    const plant = await Plant.findById(sale.plantId);

    if (plant) {
        plant.stock += sale.quantity;
        await plant.save();
    }

    await Sale.findByIdAndDelete(saleId);

    return {
        message: API_MESSAGE.DELETED
    };
};


// ======================================================
// SALES REPORT
// ======================================================

const getSalesReport = async ({
    startDate,
    endDate,
    plantId,
    explain = false
} = {}) => {

    const match = {};

    // Date filter
    if (startDate || endDate) {

        match.createdAt = {};

        if (startDate) {
            const start = new Date(startDate);

            if (Number.isNaN(start.getTime())) {
                throw new ApiError(400, "Invalid start date.");
            }

            match.createdAt.$gte = start;
        }

        if (endDate) {
            const end = new Date(endDate);

            if (Number.isNaN(end.getTime())) {
                throw new ApiError(400, "Invalid end date.");
            }

            end.setHours(23, 59, 59, 999);
            match.createdAt.$lte = end;
        }
    }

    // Plant filter
    if (plantId) {

        if (!isValidObjectId(plantId)) {
            throw new ApiError(400, "Invalid plant ID.");
        }

        match.plantId = new mongoose.Types.ObjectId(plantId);
    }

    const pipeline = [

        {
            $match: match
        },

        {
            $group: {
                _id: null,

                totalSales: {
                    $sum: 1
                },

                totalQuantity: {
                    $sum: "$quantity"
                },

                totalRevenue: {
                    $sum: "$totalPrice"
                }
            }
        },

        {
            $project: {
                _id: 0,
                totalSales: 1,
                totalQuantity: 1,
                totalRevenue: 1
            }
        }

    ];

    // Explain query
    if (explain) {

        const plan = await Sale.aggregate(pipeline)
            .explain("executionStats");

        return {
            plan,
            message: "Sales report execution plan retrieved successfully."
        };
    }

    const report = await Sale.aggregate(pipeline);

    return {
        report: report[0] || {
            totalSales: 0,
            totalQuantity: 0,
            totalRevenue: 0
        },

        message: API_MESSAGE.FETCHED
    };
};


module.exports = {
    createSale,
    getSales,
    getSaleById,
    updateSale,
    deleteSale,
    getSalesReport
};
