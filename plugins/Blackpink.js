import fetch from 'node-fetch';

let bpink = [];

// Fetch the list of Blackpink images from the remote text file
fetch('https://raw.githubusercontent.com/arivpn/dbase/master/kpop/blekping.txt')
  .then(res => res.text())
  .then(txt => {
    bpink = txt.split('\n');
  })
  .catch(err => {
    console.error('Error fetching Blackpink images:', err);
  });

let handler = async (m, { conn }) => {
  try {
    // Select a random image from the list
    let img = bpink[Math.floor(Math.random() * bpink.length)];
    
    if (!img) throw new Error('No image found');

    // Fetch the image and send it to the chat
    await conn.sendFile(m.chat, img, '', '*POWERED BY © CULT*', m, 0, {
      thumbnail: await (await fetch(img)).buffer(),
    });
  } catch (error) {
    console.error('Error sending image:', error);
    await conn.sendMessage(m.chat, { text: 'Sorry, something went wrong. Please try again later.' }, { quoted: m });
  }
};

handler
