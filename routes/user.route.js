const express = require("express");

const router = express.Router();

const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUsers,
    getUserById,
    getCurrentUser,
    updateUser,
    deleteUser
} = require("../controller/user.controller.js");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware.js");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Refresh token rotation is handled by userService.refreshAccessToken()
router.post("/refresh", refreshAccessToken);

router.post("/logout", authenticate, logoutUser);

router.get("/me", authenticate, authorize("read"), getCurrentUser);
router.get("/", authenticate, authorize("read"), getUsers);
router.get("/:id", authenticate, authorize("read"), getUserById);
router.put("/:id", authenticate, authorize("update"), updateUser);
router.delete("/:id", authenticate, authorize("delete"), deleteUser);

module.exports = router;