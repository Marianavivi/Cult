import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Uploads a file to file.io with an expiry of 1 day.
 * Maximum file size is 100MB.
 * @param {Buffer} buffer - The file buffer to upload.
 * @returns {Promise<string>} - URL of the uploaded file.
 * @throws Will throw an error if the upload fails.
 */
const fileIO = async (buffer) => {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {};
  const form = new FormData();
  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  form.append('file', blob, `tmp.${ext}`);

  const response = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  });

  const json = await response.json();
  if (!json.success) throw new Error(`file.io upload failed: ${json.message}`);
  return json.link;
};

/**
 * Uploads file(s) to storage.restfulapi.my.id.
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} input - File buffer/stream or an array of them.
 * @returns {Promise<string|null|(string|null)[]>} - URL(s) of the uploaded file(s).
 * @throws Will throw an error if the upload fails.
 */
const RESTfulAPI = async (input) => {
  const form = new FormData();
  const buffers = Array.isArray(input) ? input : [input];

  for (const buffer of buffers) {
    const blob = new Blob([buffer.toArrayBuffer()]);
    form.append('file', blob);
  }

  const response = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form,
  });

  let jsonResponse = await response.text();
  try {
    jsonResponse = JSON.parse(jsonResponse);
    if (!Array.isArray(input)) return jsonResponse.files[0].url;
    return jsonResponse.files.map(file => file.url);
  } catch (error) {
    throw new Error(`RESTfulAPI upload failed: ${jsonResponse}`);
  }
};

/**
 * Tries uploading a file to multiple services with fallback mechanism.
 * @param {Buffer} input - The file buffer to upload.
 * @returns {Promise<string>} - URL of the uploaded file.
 * @throws Will throw an error if all uploads fail.
 */
export default async function uploadFile(input) {
  const services = [RESTfulAPI, fileIO];
  let lastError = null;

  for (const service of services) {
    try {
      return await service(input);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
}
