const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (
    buffer,
    folder = "GREENLEAF/CATEGORIES"
) => {
    return new Promise((resolve, reject) => {

        if (!buffer) {
            return reject(
                new Error("Image buffer is required.")
            );
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                allowed_formats: [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp"
                ],
            },
            (error, result) => {

                if (error) {
                    return reject(error);
                }

                if (!result) {
                    return reject(
                        new Error("Cloudinary upload failed.")
                    );
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

module.exports = uploadToCloudinary;