import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import axios from 'axios';

/**
 * Download images from SekaiKomik.
 * @param {string} url - The URL of the SekaiKomik page.
 * @returns {Promise<string[]>} - An array of image URLs.
 */
async function sekaikomikDl(url) {
  try {
    const res = await fetch(url);
    const $ = cheerio.load(await res.text());
    let data = $('script').map((idx, el) => $(el).html()).toArray();
    data = data.filter(v => /wp-content/i.test(v));
    const jsonString = data[0].split('"images":')[1].split('}],')[0];
    const imagesArray = JSON.parse(`[${jsonString}]`);
    return imagesArray.map(v => encodeURI(v));
  } catch (error) {
    console.error('Error in sekaikomikDl:', error);
    throw error;
  }
}

/**
 * Download videos from Facebook.
 * @param {string} url - The URL of the Facebook video page.
 * @returns {Promise<object>} - An object containing video URLs.
 */
async function facebookDl(url) {
  try {
    const res = await fetch('https://fdownloader.net/');
    const $ = cheerio.load(await res.text());
    const token = $('input[name="__RequestVerificationToken"]').attr('value');
    const json = await (await fetch('https://fdownloader.net/api/ajaxSearch', {
      method: 'post',
      headers: {
        cookie: res.headers.get('set-cookie'),
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        referer: 'https://fdownloader.net/'
      },
      body: new URLSearchParams({ __RequestVerificationToken: token, q: url })
    })).json();
    const $$ = cheerio.load(json.data);
    const result = {};
    $$('.button.is-success.is-small.download-link-fb').each(function () {
      const quality = $$(this).attr('title').split(' ')[1];
      const link = $$(this).attr('href');
      if (link) result[quality] = link;
    });
    return result;
  } catch (error) {
    console.error('Error in facebookDl:', error);
    throw error;
  }
}

/**
 * Stalk a TikTok user profile.
 * @param {string} user - The username of the TikTok user.
 * @returns {Promise<object>} - An object containing user profile details.
 */
async function tiktokStalk(user) {
  try {
    const res = await axios.get(`https://urlebird.com/user/${user}/`);
    const $ = cheerio.load(res.data);
    return {
      pp_user: $('div[class="col-md-auto justify-content-center text-center"] > img').attr('src'),
      name: $('h1.user').text().trim(),
      username: $('div.content > h5').text().trim(),
      followers: $('div[class="col-7 col-md-auto text-truncate"]').text().trim().split(' ')[1],
      following: $('div[class="col-auto d-none d-sm-block text-truncate"]').text().trim().split(' ')[1],
      description: $('div.content > p').text().trim()
    };
  } catch (error) {
    console.error('Error in tiktokStalk:', error);
    throw error;
  }
}

/**
 * Stalk an Instagram user profile.
 * @param {string} username - The username of the Instagram user.
 * @returns {Promise<object>} - An object containing user profile details.
 */
async function igStalk(username) {
  try {
    username = username.replace(/^@/, '');
    const html = await (await fetch(`https://dumpor.com/v/${username}`)).text();
    const $$ = cheerio.load(html);
    const name = $$('div.user__title > a > h1').text().trim();
    const Uname = $$('div.user__title > h4').text().trim();
    const description = $$('div.user__info-desc').text().trim();
    const profilePic = $$('div.user__img').attr('style')?.replace("background-image: url('", '').replace("');", '');
    const row = $$('#user-page > div.container > div > div > div:nth-child(1) > div > a');
    const postsH = row.eq(0).text().replace(/Posts/i, '').trim();
    const followersH = row.eq(2).text().replace(/Followers/i, '').trim();
    const followingH = row.eq(3).text().replace(/Following/i, '').trim();
    const list = $$('ul.list > li.list__item');
    const posts = parseInt(list.eq(0).text().replace(/Posts/i, '').trim().replace(/\s/g, ''));
    const followers = parseInt(list.eq(1).text().replace(/Followers/i, '').trim().replace(/\s/g, ''));
    const following = parseInt(list.eq(2).text().replace(/Following/i, '').trim().replace(/\s/g, ''));
    return {
      name,
      username: Uname,
      description,
      postsH,
      posts,
      followersH,
      followers,
      followingH,
      following,
      profilePic
    };
  } catch (error) {
    console.error('Error in igStalk:', error);
    throw error;
  }
}

export {
  sekaikomikDl,
  igStalk,
  facebookDl,
  tiktokStalk
};
