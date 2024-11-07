// @ts-check
import pkg from 'imgur';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const { ImgurClient } = pkg;

const client = new ImgurClient({ clientId: process.env.IMGUR_CLIENT_ID });

/**
 * Uploads an image to Imgur
 * @param {string} imagePath - Path to the image file to upload
 * @returns {Promise<string>} - URL of the uploaded image
 */
async function uploadToImgur(imagePath) {
  try {
    const response = await client.upload({
      image: fs.createReadStream(imagePath),
      type: 'stream',
    });

    const url = response.data.link;
    console.log('Image URL:', url);
    return url;
  } catch (error) {
    console.error('Error uploading image to Imgur:', error.message || error);
    throw error;
  }
}

export default uploadToImgur;
