const User = require("../model/user.model.js");

const {
    ApiError
} = require("../utils/asyncHandler.js");

const {
    hashPassword,
    comparePassword
} = require("../utils/hashedPassword.js");

const {
    generateToken
} = require("../utils/generateToken.js");

const {
    generateRefreshToken
} = require("../utils/generateRefreshToken.js");

const {
    verifyRefreshToken
} = require("../utils/verifyToken.js");

const {
    isValidObjectId
} = require("mongoose");

const {
    API_MESSAGE
} = require("../constants/apiMessage.Constant.js");



const registerUser = async (userData) => {

    const {
        userName,
        password,
        role
    } = userData;


    // Validate username
    if (!userName || !userName.trim()) {
        throw new ApiError(
            400,
            "Username is required."
        );
    }


    // Validate password
    if (!password) {
        throw new ApiError(
            400,
            "Password is required."
        );
    }


    if (password.length < 6) {
        throw new ApiError(
            400,
            "Password must contain at least 6 characters."
        );
    }


    // Check existing username
    const existingUser = await User.findOne({
        userName: userName.trim()
    });


    if (existingUser) {
        throw new ApiError(
            409,
            "Username already exists."
        );
    }


    // Hash password
    const hashedPassword =
        await hashPassword(password);


    const user = await User.create({
        userName: userName.trim(),
        password: hashedPassword,
        role: role || "Employee"
    });


    // Never return password
    user.password = undefined;


    return {
        user,
        message: API_MESSAGE.CREATED
    };
};



const loginUser = async (userName, password) => {

    if (!userName || !password) {
        throw new ApiError(
            400,
            "Username and password are required."
        );
    }


    // Find user
    const user = await User.findOne({
        userName: userName.trim()
    });


    if (!user) {
        throw new ApiError(
            401,
            "Invalid username or password."
        );
    }


    // Compare password
    const passwordMatched =
        await comparePassword(
            password,
            user.password
        );


    if (!passwordMatched) {
        throw new ApiError(
            401,
            "Invalid username or password."
        );
    }


    // Access token payload
    const accessToken = generateToken({
        id: user._id,
        role: user.role
    });


    // Refresh token
    const refreshToken =
        generateRefreshToken({
            id: user._id
        });


    // Store refresh token
    user.refreshTokens.push(refreshToken);

    await user.save();


    return {
        user: {
            _id: user._id,
            userName: user.userName,
            role: user.role
        },

        accessToken,
        refreshToken,

        message: "Login successful."
    };
};




const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(400, "Refresh token is required.");
    }

    let decoded;

    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw new ApiError(403, "Invalid or expired refresh token.");
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        throw new ApiError(401, "User account no longer exists.");
    }

    // Check whether the refresh token is still active
    const tokenExists = user.refreshTokens.includes(refreshToken);

    if (!tokenExists) {
        // Token reuse detected -> revoke all active refresh tokens
        user.refreshTokens = [];
        await user.save();

        throw new ApiError(
            403,
            "Refresh token reuse detected. Please login again."
        );
    }

    // Remove the old refresh token
    user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
    );

    // Generate new access token
    const newAccessToken = generateToken({
        id: user._id,
        role: user.role
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
        id: user._id
    });

    // Store the new refresh token
    user.refreshTokens.push(newRefreshToken);

    await user.save();

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: "Tokens rotated successfully."
    };
};




const logoutUser = async (
    userId,
    refreshToken
) => {

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }


    const user = await User.findById(
        userId
    );


    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }


    if (refreshToken) {

        user.refreshTokens =
            user.refreshTokens.filter(
                (token) => token !== refreshToken
            );

    } else {


        user.refreshTokens = [];
    }


    await user.save();


    return {
        message: "Logout successful."
    };
};



const getUsers = async () => {

    const users = await User
        .find()
        .select("-password -refreshTokens")
        .sort({ createdAt: -1 });


    return {
        users,
        message: API_MESSAGE.FETCHED
    };
};




const getUserById = async (userId) => {

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }


    const user = await User
        .findById(userId)
        .select("-password -refreshTokens");


    if (!user) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    return {
        user,
        message: API_MESSAGE.FETCHED
    };
};




const getCurrentUser = async (userId) => {

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }


    const user = await User
        .findById(userId)
        .select("-password -refreshTokens");


    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }


    return {
        user,
        message: API_MESSAGE.FETCHED
    };
};




const updateUser = async (
    userId,
    updateData
) => {

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }


    const user = await User.findById(
        userId
    );


    if (!user) {
        throw new ApiError(
            404,
            API_MESSAGE.NOT_FOUND
        );
    }


    // Username update
    if (updateData.userName) {

        const existingUser =
            await User.findOne({
                userName:
                    updateData.userName.trim(),
                _id: {
                    $ne: userId
                }
            });


        if (existingUser) {
            throw new ApiError(
                409,
                "Username already exists."
            );
        }


        user.userName =
            updateData.userName.trim();
    }


    // Password update
    if (updateData.password) {

        if (updateData.password.length < 6) {
            throw new ApiError(
                400,
                "Password must contain at least 6 characters."
            );
        }


        user.password =
            await hashPassword(
                updateData.password
            );

        // Invalidate existing sessions
        user.refreshTokens = [];
    }


    // Role update
    if (updateData.role) {

        const allowedRoles = [
            "Admin",
            "Manager",
            "Employee"
        ];


        if (!allowedRoles.includes(
            updateData.role
        )) {
            throw new ApiError(
                400,
                "Invalid user role."
            );
        }


        user.role = updateData.role;
    }


    await user.save();


    return {
        user: {
            _id: user._id,
            userName: user.userName,
            role: user.role
        },

        message: API_MESSAGE.UPDATED
    };
};




const deleteUser = async (userId) => {

    if (!isValidObjectId(userId)) {
        throw new ApiError(
            400,
            "Invalid user ID."
        );
    }


    const user = await User.findByIdAndDelete(
        userId
    );


    if (!user) {
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