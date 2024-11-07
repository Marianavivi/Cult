import fetch from 'node-fetch';
import { FormData, Blob } from 'formdata-node';
import { JSDOM } from 'jsdom';

/**
 * Convert a WebP image to MP4 format using ezgif.com.
 * @param {Buffer|string} source - The image buffer or URL.
 * @returns {Promise<string>} - The URL of the converted MP4 video.
 * @throws Will throw an error if the conversion fails.
 */
async function webp2mp4(source) {
  const form = new FormData();
  const isUrl = typeof source === 'string' && /^https?:\/\//.test(source);
  const blob = !isUrl && new Blob([source.toArrayBuffer()]);

  form.append('new-image-url', isUrl ? source : '');
  form.append('new-image', isUrl ? '' : blob, 'image.webp');

  // Initial request to upload the image
  const res = await fetch('https://ezgif.com/webp-to-mp4', {
    method: 'POST',
    body: form,
  });

  const html = await res.text();
  const { document } = new JSDOM(html).window;
  const form2 = new FormData();
  const obj = {};

  for (const input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }

  // Second request to process the image
  const res2 = await fetch(`https://ezgif.com/webp-to-mp4/${obj.file}`, {
    method: 'POST',
    body: form2,
  });

  const html2 = await res2.text();
  const { document: document2 } = new JSDOM(html2).window;
  const videoSource = document2.querySelector('div#output > p.outfile > video > source');

  if (!videoSource) {
    throw new Error('Conversion failed: Unable to find the output video.');
  }

  return new URL(videoSource.src, res2.url).toString();
}

/**
 * Convert a WebP image to PNG format using ezgif.com.
 * @param {Buffer|string} source - The image buffer or URL.
 * @returns {Promise<string>} - The URL of the converted PNG image.
 * @throws Will throw an error if the conversion fails.
 */
async function webp2png(source) {
  const form = new FormData();
  const isUrl = typeof source === 'string' && /^https?:\/\//.test(source);
  const blob = !isUrl && new Blob([source.toArrayBuffer()]);

  form.append('new-image-url', isUrl ? source : '');
  form.append('new-image', isUrl ? '' : blob, 'image.webp');

  // Initial request to upload the image
  const res = await fetch('https://ezgif.com/webp-to-png', {
    method: 'POST',
    body: form,
  });

  const html = await res.text();
  const { document } = new JSDOM(html).window;
  const form2 = new FormData();
  const obj = {};

  for (const input of document.querySelectorAll('form input[name]')) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }

  // Second request to process the image
  const res2 = await fetch(`https://ezgif.com/webp-to-png/${obj.file}`, {
    method: 'POST',
    body: form2,
  });

  const html2 = await res2.text();
  const { document: document2 } = new JSDOM(html2).window;
  const imageSource = document2.querySelector('div#output > p.outfile > img');

  if (!imageSource) {
    throw new Error('Conversion failed: Unable to find the output image.');
  }

  return new URL(imageSource.src, res2.url).toString();
}

export { webp2mp4, webp2png };
