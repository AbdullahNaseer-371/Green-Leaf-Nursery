const saleService = require("../service/sale.service.js");

const {
    asyncHandler,
    ApiResponse
} = require("../utils/asyncHandler.js");

const createSale = asyncHandler(async (req, res) => {

    const result = await saleService.createSale(
        req.body,
        req.user._id
    );


    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                result.sale,
                result.message
            )
        );
});


const getSales = asyncHandler(async (req, res) => {

    const {
        plantId,
        soldBy,
        startDate,
        endDate,
        explain
    } = req.query;


    const result = await saleService.getSales({
        plantId,
        soldBy,
        startDate,
        endDate,
        explain: explain === "true"
    });


    // Explain result
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
                result.sales,
                result.message
            )
        );
});



const getSaleById = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await saleService.getSaleById(id);


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.sale,
                result.message
            )
        );
});




const updateSale = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await saleService.updateSale(
            id,
            req.body
        );


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result.sale,
                result.message
            )
        );
});



const deleteSale = asyncHandler(async (req, res) => {

    const { id } = req.params;


    const result =
        await saleService.deleteSale(id);


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



const getSalesReport = asyncHandler(async (req, res) => {

    const {
        startDate,
        endDate,
        plantId,
        explain
    } = req.query;


    const result =
        await saleService.getSalesReport({
            startDate,
            endDate,
            plantId,
            explain: explain === "true"
        });


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
                result.report,
                result.message
            )
        );
});


module.exports = {
    createSale,
    getSales,
    getSaleById,
    updateSale,
    deleteSale,
    getSalesReport
};