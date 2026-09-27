const Sale = require("../model/sale.model.js");
const Plant = require("../model/plant.model.js");

const {
    API_MESSAGE
} = require("../constants/apiMessage.Constant.js");

const {
    ApiError
} = require("../utils/asyncHandler.js");

const {
    isValidObjectId
} = require("mongoose");


const createSale = async (saleData, userId) => {

    const {
        plantId,
        quantity
    } = saleData;


    // Validate Plant ID
    if (!isValidObjectId(plantId)) {
        throw new ApiError(
            400,
            "Invalid plant ID."
        );
    }


    // Validate quantity
    if (!quantity || quantity <= 0) {
        throw new ApiError(
            400,
            "Quantity must be greater than 0."
        );
    }


    // Find plant
    const plant = await Plant.findById(plantId);

    if (!plant) {
        throw new ApiError(
            404,
            "Plant not found."
        );
    }


    // Check stock
    if (plant.stock < quantity) {
        throw new ApiError(
            400,
            "Insufficient plant stock."
        );
    }


    // Calculate total price
    const totalPrice = plant.unitPrice * quantity;


    // Create sale
    const sale = await Sale.create({
        plantId,
        quantity,
        totalPrice,
        soldBy: userId
    });


    // Reduce stock
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
    explain = false
} = {}) => {

    const filter = {};


    // Filter by plant
    if (plantId) {

        if (!isValidObjectId(plantId)) {
            throw new ApiError(
                400,
                "Invalid plant ID."
            );
        }

        filter.plantId = plantId;
    }


    // Filter by seller
    if (soldBy) {

        if (!isValidObjectId(soldBy)) {
            throw new ApiError(
                400,
                "Invalid user ID."
            );
        }

        filter.soldBy = soldBy;
    }


    // Date filtering
    if (startDate || endDate) {

        filter.saleDate = {};

        if (startDate) {
            filter.saleDate.$gte = new Date(startDate);
        }

        if (endDate) {
            filter.saleDate.$lte = new Date(endDate);
        }
    }


    // Query execution plan
    if (explain) {

        const plan = await Sale
            .find(filter)
            .sort({ saleDate: -1 })
            .explain("executionStats");

        return {
            plan,
            message: "Query execution plan retrieved successfully."
        };
    }


    // Get all sales
    const sales = await Sale
        .find(filter)
        .populate("plantId", "name sku unitPrice stock")
        .populate("soldBy", "name email")
        .sort({ saleDate: -1 });


    return {
        sales,
        message: API_MESSAGE.FETCHED
    };
};


// ======================================================
// GET SALE BY ID
// ======================================================

const getSaleById = async (saleId) => {

    if (!isValidObjectId(saleId)) {
        throw new ApiError(
            400,
            "Invalid sale ID."
        );
    }


    const sale = await Sale
        .findById(saleId)
        .populate(
            "plantId",
            "name sku unitPrice stock"
        )
        .populate(
            "soldBy",
            "name email"
        );


    if (!sale) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
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
        throw new ApiError(
            400,
            "Invalid sale ID."
        );
    }


    // Sale plant and seller should not be changed
    delete updateData.plantId;
    delete updateData.soldBy;
    delete updateData.totalPrice;


    const existingSale = await Sale.findById(saleId);

    if (!existingSale) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    // If quantity changes,
    // recalculate stock and total price.
    if (updateData.quantity !== undefined) {

        if (updateData.quantity <= 0) {
            throw new ApiError(
                400,
                "Quantity must be greater than 0."
            );
        }


        const plant = await Plant.findById(
            existingSale.plantId
        );


        if (!plant) {
            throw new ApiError(
                404,
                "Plant not found."
            );
        }


        const quantityDifference =
            updateData.quantity - existingSale.quantity;


        // Increasing sale quantity
        if (quantityDifference > 0) {

            if (plant.stock < quantityDifference) {
                throw new ApiError(
                    400,
                    "Insufficient plant stock."
                );
            }

            plant.stock -= quantityDifference;
        }


        // Decreasing sale quantity
        else if (quantityDifference < 0) {

            plant.stock += Math.abs(
                quantityDifference
            );
        }


        await plant.save();


        // Recalculate total price
        updateData.totalPrice =
            plant.unitPrice * updateData.quantity;
    }


    const sale = await Sale.findByIdAndUpdate(
        saleId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    )
        .populate(
            "plantId",
            "name sku unitPrice stock"
        )
        .populate(
            "soldBy",
            "name email"
        );


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
        throw new ApiError(
            400,
            "Invalid sale ID."
        );
    }


    const sale = await Sale.findById(saleId);

    if (!sale) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    // Restore plant stock
    const plant = await Plant.findById(
        sale.plantId
    );


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

        match.saleDate = {};

        if (startDate) {
            match.saleDate.$gte = new Date(startDate);
        }

        if (endDate) {
            match.saleDate.$lte = new Date(endDate);
        }
    }


    // Plant filter
    if (plantId) {

        if (!isValidObjectId(plantId)) {
            throw new ApiError(
                400,
                "Invalid plant ID."
            );
        }

        match.plantId = new mongoose.Types.ObjectId(
            plantId
        );
    }


    // Explain
    if (explain) {

        const plan = await Sale.aggregate([
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
            }
        ]).explain("executionStats");


        return {
            plan,
            message:
                "Sales report execution plan retrieved successfully."
        };
    }


    const report = await Sale.aggregate([

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
    ]);


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