const cloudinary = require('cloudinary');
let streamifier = require('streamifier');
const { promisify } = require('util');

exports.Cloudinary = {
  upload: async (image) => {
    const res = await cloudinary.v2.uploader.upload(image, {
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
      cloud_name: process.env.CLOUDINARY_NAME,
      folder: `TwitterClone/Users/`,
    });
    // // streamifier.createReadStream(image).pipe(res);

    return res.secure_url;
  },
};

// upload: async (image) => {
//     const res = await cloudinary.v2.uploader.upload({
//       api_key: process.env.CLOUDINARY_KEY,
//       api_secret: process.env.CLOUDINARY_SECRET,
//       cloud_name: process.env.CLOUDINARY_NAME,
//       folder: `TwitterClone/Users/`,
//     });
