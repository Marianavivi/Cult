import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Uploads an image to telegra.ph.
 * Supported mimetypes:
 * - image/jpeg
 * - image/jpg
 * - image/png
 * @param {Buffer} buffer - The image buffer to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 * @throws Will throw an error if the upload fails.
 */
export default async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer);

  if (!ext || !mime || !['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
    throw new Error('Unsupported file type. Supported types are image/jpeg, image/jpg, image/png.');
  }

  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, `tmp.${ext}`);

  const response = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return `https://telegra.ph${result[0].src}`;
};
