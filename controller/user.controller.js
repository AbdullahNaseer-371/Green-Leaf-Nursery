const userService = require("../service/user.service.js");

const {
    asyncHandler,
    ApiResponse
} = require("../utils/asyncHandler.js");


const registerUser = asyncHandler(async (req, res) => {

    const result =
        await userService.registerUser(
            req.body
        );


    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                result.user,
                result.message
            )
        );
});



const loginUser = asyncHandler(async (req, res) => {

    const {
        userName,
        password
    } = req.body;


    const result =
        await userService.loginUser(
            userName,
            password
        );


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken
                },
                result.message
            )
        );
});




const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await userService.refreshAccessToken(refreshToken);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            },
            result.message
        )
    );
});


const logoutUser = asyncHandler(
    async (req, res) => {

        const {
            refreshToken
        } = req.body;


        const result =
            await userService.logoutUser(
                req.user._id,
                refreshToken
            );


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    result.message
                )
            );
    }
);


const getUsers = asyncHandler(
    async (req, res) => {

        const result =
            await userService.getUsers();


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result.users,
                    result.message
                )
            );
    }
);



const getUserById = asyncHandler(
    async (req, res) => {

        const {
            id
        } = req.params;


        const result =
            await userService.getUserById(id);


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result.user,
                    result.message
                )
            );
    }
);


const getCurrentUser = asyncHandler(
    async (req, res) => {

        const result =
            await userService.getCurrentUser(
                req.user._id
            );


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result.user,
                    result.message
                )
            );
    }
);



const updateUser = asyncHandler(
    async (req, res) => {

        const {
            id
        } = req.params;


        const result =
            await userService.updateUser(
                id,
                req.body
            );


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result.user,
                    result.message
                )
            );
    }
);



const deleteUser = asyncHandler(
    async (req, res) => {

        const {
            id
        } = req.params;


        const result =
            await userService.deleteUser(id);


        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    result.message
                )
            );
    }
);


module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUsers,
    getUserById,
    getCurrentUser,
    updateUser,
    deleteUser
};