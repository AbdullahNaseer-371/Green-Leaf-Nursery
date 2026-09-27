const { ApiError, asyncHandler } = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/verifyToken.js');
const {  generateRefreshToken } = require('../utils/generateRefreshToken.js');
const {  generateAccessToken } = require('../utils/generateToken.js');
const { ENV } = require('../config/env');
const { User } = require('../model/user.model.js');


const ROLES_HIERARCHY = {
    Admin: ['create', 'read', 'update', 'delete'],
    Manager: ['create', 'read', 'update'],
    Employee: ['read']
};

const hasPermission = (userRole, requiredPermission) => {
    const permissions = ROLES_HIERARCHY[userRole] || [];
    return permissions.indexOf(requiredPermission) !== -1;
};


const isTokenActive = (activeTokens, lookupToken) => {
    return activeTokens.indexOf(lookupToken) !== -1;
};


const authenticate = asyncHandler(async (req, res, next) => {
    const headerKey = ENV.JWT_TOKEN_HEADER.toLowerCase();
    const tokenHeader = req.headers[headerKey];
    const token = tokenHeader && tokenHeader.split(' ')[1]; 

    if (!token) {
        throw new ApiError(401, 'Access token required to view this resource');
    }

    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError(401, 'User account no longer exists in system');
        }

        req.user = user; 
        next();
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(403, 'Access token is invalid or has expired');
    }
});


const authorize = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, 'Authentication credentials missing'));
        }

        // Extracted functional verification line replacing .includes()
        if (!hasPermission(req.user.role, requiredPermission)) {
            return next(new ApiError(403, `Access denied: '${req.user.role}' role lacks '${requiredPermission}' privileges`));
        }

        next();
    };
};


const handleTokenRotation = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new ApiError(400, 'Refresh token required for session renewal');
    }

    try {
        const decoded = verifyToken(refreshToken);
        const user = await User.findById(decoded.id);

       
        if (!user || !isTokenActive(user.refreshTokens, refreshToken)) {
            if (user) {
                user.refreshTokens = [];
                await user.save();
            }
            throw new ApiError(403, 'Compromised session fingerprint detected. Full re-authentication forced.');
        }

        
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);

        
        const payload = { id: user._id, role: user.role };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken({ id: user._id });

        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Tokens rotated successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(403, 'Invalid or expired refresh token');
    }
});

module.exports = {
    authenticate,
    authorize,
    handleTokenRotation
};
