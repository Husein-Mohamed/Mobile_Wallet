

import cloudinary from 'cloudinary';
import {CLOUDINARY_CLOUD_MANE, CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET} from './confic.js'

// Configure Cloudinary
// Ensure to replace 'your_cloud_name', 'your_api_key', and 'your_api_secret' with actual values from your Cloudinary dashboard
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_MANE,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export default cloudinary;