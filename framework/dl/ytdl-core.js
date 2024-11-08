const ytdl = require('youtubedl-core');
const yts = require('youtube-yts');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const NodeID3 = require('node-id3');
const fs = require('fs');
const { fetchBuffer } = require("./Function");
const { randomBytes } = require('crypto');
const ytIdRegex = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/;
const progress = require('progress');
const path = require('path');
const { promisify } = require('util');

class YT {
    constructor() {}

    static isYTUrl = (url) => {
        return ytIdRegex.test(url);
    }

    static getVideoID = (url) => {
        if (!this.isYTUrl(url)) throw new Error('is not YouTube URL');
        return ytIdRegex.exec(url)[1];
    }

    static WriteTags = async (filePath, Metadata) => {
        NodeID3.write({
            title: Metadata.Title,
            artist: Metadata.Artist,
            originalArtist: Metadata.Artist,
            image: {
                mime: 'jpeg',
                type: {
                    id: 3,
                    name: 'front cover',
                },
                imageBuffer: (await fetchBuffer(Metadata.Image)).buffer,
                description: `Cover of ${Metadata.Title}`,
            },
            album: Metadata.Album,
            year: Metadata.Year || ''
        }, filePath);
    }

    static search = async (query, options = {}) => {
        const search = await yts.search({ query, hl: 'id', gl: 'ID', ...options });
        return search.videos;
    }

    static downloadMusic = async (query) => {
        try {
            const getTrack = Array.isArray(query) ? query : await this.search(query);
            const search = getTrack[0];
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + search.videoId, { lang: 'id' });
            let stream = ytdl(search.id, { filter: 'audioonly', quality: 'highestaudio' });
            let songPath = path.resolve(`./downloads/${randomBytes(3).toString('hex')}.mp3`);
            
            const bar = new progress(':bar :percent :etas', { total: 100, width: 40 });
            stream.on('progress', (_, downloaded, total) => bar.update(downloaded / total));

            const file = await new Promise((resolve, reject) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(192)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => resolve(songPath))
                    .on('error', reject);
            });

            await this.WriteTags(file, { 
                Title: search.title, 
                Artist: search.author.name, 
                Image: search.thumbnail, 
                Album: videoInfo.videoDetails.title, 
                Year: videoInfo.videoDetails.publishDate.split('-')[0] 
            });
            
            return {
                meta: search,
                path: file,
                size: fs.statSync(songPath).size
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to download music');
        }
    }

    static mp4 = async (query, quality = '134') => {
        try {
            if (!query) throw new Error('Video ID or YouTube Url is required');
            const videoId = this.isYTUrl(query) ? this.getVideoID(query) : query;
            const videoInfo = await ytdl.getInfo('https://www.youtube.com/watch?v=' + videoId, { lang: 'id' });
            const format = ytdl.chooseFormat(videoInfo.formats, { quality });

            return {
                title: videoInfo.videoDetails.title,
                thumb: videoInfo.videoDetails.thumbnails.slice(-1)[0],
                date: videoInfo.videoDetails.publishDate,
                duration: videoInfo.videoDetails.lengthSeconds,
                channel: videoInfo.videoDetails.ownerChannelName,
                quality: format.qualityLabel,
                contentLength: format.contentLength,
                description: videoInfo.videoDetails.description,
                videoUrl: format.url
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to retrieve video info');
        }
    }

    static mp3 = async (url, metadata = {}, autoWriteTags = false) => {
        try {
            if (!url) throw new Error('Video ID or YouTube Url is required');
            url = this.isYTUrl(url) ? 'https://www.youtube.com/watch?v=' + this.getVideoID(url) : url;
            const { videoDetails } = await ytdl.getInfo(url, { lang: 'id' });
            let stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
            let songPath = path.resolve(`./downloads/${randomBytes(3).toString('hex')}.mp3`);

            let starttime;
            stream.once('response', () => {
                starttime = Date.now();
            });

            const file = await new Promise((resolve, reject) => {
                ffmpeg(stream)
                    .audioFrequency(44100)
                    .audioChannels(2)
                    .audioBitrate(192)
                    .audioCodec('libmp3lame')
                    .audioQuality(5)
                    .toFormat('mp3')
                    .save(songPath)
                    .on('end', () => resolve(songPath))
                    .on('error', reject);
            });

            if (Object.keys(metadata).length) {
                await this.WriteTags(file, metadata);
            } else if (autoWriteTags) {
                await this.WriteTags(file, {
                    Title: videoDetails.title,
                    Album: videoDetails.author.name,
                    Year: videoDetails.publishDate.split('-')[0],
                    Image: videoDetails.thumbnails.slice(-1)[0].url
                });
            }

            return {
                meta: {
                    title: videoDetails.title,
                    channel: videoDetails.author.name,
                    seconds: videoDetails.lengthSeconds,
                    description: videoDetails.description,
                    image: videoDetails.thumbnails.slice(-1)[0].url
                },
                path: file,
                size: fs.statSync(songPath).size
            }
        } catch (error) {
            console.error(error);
            throw new Error('Failed to download MP3');
        }
    }
}

module.exports = YT;
