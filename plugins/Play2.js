import fetch from 'node-fetch';
import yts from 'yt-search';

// Main handler function
let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  try {
    // Validate input
    if (!text) {
      return conn.reply(m.chat, `Please enter the title of a YouTube video or song.\n\nExample:\n${usedPrefix + command} Gemini Aaliyah - If Only`, m);
    }

    // React with a waiting emoji
    await m.react('⏳');

    // Search for the video
    let results = await searchYouTube(args.join(" "));
    if (results.length === 0) throw 'No results found for your search. Please try a different query.';

    // Fetch the thumbnail image
    let img = await fetchImage(results[0].image);
    
    // Construct the response message
    let responseMessage = constructMessage(results[0]);

    // Send the response
    await conn.sendFile(m.chat, img, 'thumbnail.jpg', responseMessage, m);

    // React with a success emoji
    await m.react('✅');
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, '❌ An error occurred. Please try again later.', m);
    await m.react('❌');
  }
};

// Register the handler
handler.help = ['play *<search>*'];
handler.tags = ['downloader'];
handler.command = ['play5'];

export default handler;

// Function to search YouTube
async function searchYouTube(query, options = {}) {
  let search = await yts.search({ query, hl: "en", gl: "US", ...options });
  return search.videos;
}

// Function to fetch the image
async function fetchImage(url) {
  let res = await fetch(url);
  return await res.buffer();
}

// Function to construct the response message
function constructMessage(video) {
  return `\`乂  Y O U T U B E  -  P L A Y\`\n\n
✩ *Title* : ${video.title}\n
✩ *Duration* : ${formatDuration(video.duration.seconds)}\n
✩ *Published* : ${formatPublishedDate(video.ago)}\n
✩ *Channel* : ${video.author.name || 'Unknown'}\n
✩ *Url* : https://youtu.be/${video.videoId}\n\n
> To download, reply to this message with *Video* or *Audio*.`;
}

// Function to format duration
function formatDuration(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' Day, ' : ' Days, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' Hour, ' : ' Hours, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' Minute, ' : ' Minutes, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' Second' : ' Seconds') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

// Function to format published date
function formatPublishedDate(txt) {
  if (!txt) return '×';
  const timeMap = {
    'month ago': ' month',
    'months ago': ' months',
    'year ago': ' year',
    'years ago': ' years',
    'hour ago': ' hour',
    'hours ago': ' hours',
    'minute ago': ' minute',
    'minutes ago': ' minutes',
    'day ago': ' day',
    'days ago': ' days'
  };

  for (let key in timeMap) {
    if (txt.includes(key)) {
      let T = txt.replace(key, "").trim();
      return `does ${T}${timeMap[key]}`;
    }
  }
  return txt;
}
