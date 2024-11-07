import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Helper function to perform a POST request.
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} formdata - The form data to send in the POST request.
 * @returns {Promise<Response>} - The fetch response.
 */
const post = async (url, formdata) => {
  return fetch(url, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: new URLSearchParams(Object.entries(formdata)),
  });
};

/**
 * Extract YouTube video ID from a URL.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} - The YouTube video ID or null if not found.
 */
const extractYouTubeId = (url) => {
  const ytIdRegex =
    /(?:http(?:s|):\/\/)?(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?.*?v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/;
  const match = ytIdRegex.exec(url);
  return match ? match[1] : null;
};

/**
 * Get YouTube video download link (video).
 * @param {string} yutub - The YouTube URL.
 * @returns {Promise<Object>} - The video details including the download link.
 */
const ytv = async (yutub) => {
  const ytId = extractYouTubeId(yutub);
  if (!ytId) throw new Error('Invalid YouTube URL');

  const url = `https://youtu.be/${ytId}`;
  const analyzeRes = await post('https://www.y2mate.com/mates/en68/analyze/ajax', {
    url,
    q_auto: 0,
    ajax: 1,
  });

  const analyzeData = await analyzeRes.json();
  const $ = cheerio.load(analyzeData.result);
  const thumb = $('div.thumbnail.cover > a > img').attr('src');
  const title = $('div.thumbnail.cover > div > b').text();
  const quality = $('#mp4 > table > tbody > tr:nth-child(4) > td:nth-child(3) > a').attr('data-fquality');
  const type = $('#mp4 > table > tbody > tr:nth-child(3) > td:nth-child(3) > a').attr('data-ftype');
  const output = `${title}.${type}`;
  const size = $('#mp4 > table > tbody > tr:nth-child(2) > td:nth-child(2)').text();
  const id = /var k__id = "(.*?)"/.exec(analyzeData.result)[1];

  const convertRes = await post('https://www.y2mate.com/mates/en68/convert', {
    type: 'youtube',
    _id: id,
    v_id: ytId,
    ajax: '1',
    token: '',
    ftype: type,
    fquality: quality,
  });

  const convertData = await convertRes.json();
  const $convert = cheerio.load(convertData.result);
  const link = $convert('div > a').attr('href');

  return { thumb, title, quality, type, size, output, link };
};

/**
 * Get YouTube video download link (audio).
 * @param {string} yutub - The YouTube URL.
 * @returns {Promise<Object>} - The audio details including the download link.
 */
const yta = async (yutub) => {
  const ytId = extractYouTubeId(yutub);
  if (!ytId) throw new Error('Invalid YouTube URL');

  const url = `https://youtu.be/${ytId}`;
  const analyzeRes = await post('https://www.y2mate.com/mates/en68/analyze/ajax', {
    url,
    q_auto: 0,
    ajax: 1,
  });

  const analyzeData = await analyzeRes.json();
  const $ = cheerio.load(analyzeData.result);
  const thumb = $('div.thumbnail.cover > a > img').attr('src');
  const title = $('div.thumbnail.cover > div > b').text();
  const size = $('#mp3 > table > tbody > tr > td:nth-child(2)').text();
  const type = $('#mp3 > table > tbody > tr > td:nth-child(3) > a').attr('data-ftype');
  const output = `${title}.${type}`;
  const quality = $('#mp3 > table > tbody > tr > td:nth-child(3) > a').attr('data-fquality');
  const id = /var k__id = "(.*?)"/.exec(analyzeData.result)[1];

  const convertRes = await post('https://www.y2mate.com/mates/en68/convert', {
    type: 'youtube',
    _id: id,
    v_id: ytId,
    ajax: '1',
    token: '',
    ftype: type,
    fquality: quality,
  });

  const convertData = await convertRes.json();
  const $convert = cheerio.load(convertData.result);
  const link = $convert('div > a').attr('href');

  return { thumb, title, quality, type, size, output, link };
};

export { yta, ytv };
/*
by https://instabio.cc/fg98ff
*/
