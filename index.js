const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const TOKEN = '5219568853:AAFnaY_na9bF3y8yjnKNj5b8n2ItNu60HJ0';

const bot = new Telegraf(TOKEN);

async function downloadVideo(url) {
    try {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url, vQuality: '1080' };
        const headers = { 'Accept': 'application/json' };

        const response = await axios.post(api_url, payload, { headers });

        if (response.data.status === 'redirect') {
            return response.data.url;
        } else {
            const video_url = response.data.url;
            const video_name = `video_${Date.now()}.mp4`;

            const videoResponse = await axios.get(video_url, { responseType: 'stream' });
            const file = fs.createWriteStream(video_name);

            videoResponse.data.pipe(file);

            return new Promise((resolve, reject) => {
                file.on('finish', () => resolve(video_name));
                file.on('error', reject);
            });
        }
    } catch (error) {
        throw new Error(`Gagal mengunduh video. Error: ${error.message}`);
    }
}

bot.start((ctx) => ctx.reply('Halo! Ketik /download <URL TikTok> untuk mengunduh video.'));

bot.command('download', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) {
        return ctx.reply('Gunakan perintah /download dengan URL TikTok.');
    }

    try {
        await ctx.reply('Sedang mengunduh video, harap tunggu...');
        const video = await downloadVideo(url);
        
        if (video.startsWith('http')) {
            await ctx.reply('Video berhasil diunduh!');
            ctx.reply(video);
        } else {
            await ctx.reply('Video berhasil diunduh! Sedang mengunggah...');
            ctx.replyWithVideo({ source: video });
        }
    } catch (error) {
        console.error('Error:', error);
        ctx.reply(`Terjadi kesalahan: ${error.message}`);
    }
});

bot.launch().then(() => {
    console.log('Bot is running');
}).catch((err) => {
    console.error('Error starting bot', err);
});
