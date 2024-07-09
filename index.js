const { Telegraf } = require('telegraf');
const request = require('request');
const fs = require('fs');
const path = require('path');

// Token bot Telegram dari BotFather
const TOKEN = '7431504934:AAF0HhTwFCKzp2Oc4J6qa9oqc2XqEkHd6EE';

// Inisialisasi bot
const bot = new Telegraf(TOKEN);

// Fungsi untuk mengunduh video dari URL menggunakan Cobalt API
function downloadVideo(url) {
    return new Promise((resolve, reject) => {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url, vQuality: '1080' };
        const headers = { 'Accept': 'application/json' };

        request.post({ url: api_url, json: payload, headers }, (err, response, body) => {
            if (err) {
                reject(`Gagal mengunduh video. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                reject(`Gagal mengunduh video. Status code: ${response.statusCode}`);
            } else {
                const video_url = body.url;
                if (body.status === 'redirect') {
                    resolve(body.url);
                } else {
                    const video_name = `video_${Date.now()}.mp4`;
                    const file = fs.createWriteStream(video_name);

                    request.get(video_url)
                        .on('error', (err) => {
                            reject(`Gagal mengunduh video. Error: ${err}`);
                        })
                        .pipe(file)
                        .on('finish', () => {
                            resolve(video_name);
                        });
                }
            }
        });
    });
}

// Middleware untuk menanggapi pesan /start
bot.start((ctx) => ctx.reply('Halo! Ketik /download <URL TikTok> untuk mengunduh video.'));

// Middleware untuk menanggapi pesan /download <URL>
bot.command('download', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url) {
        return ctx.reply('Gunakan perintah /download dengan URL TikTok.');
    }

    try {
        const video = await downloadVideo(url);
        if (video.startsWith('http')) {
            // Kirim URL yang diterima dari respons redirect ke pengguna
            ctx.reply(video);
        } else {
            // Kirim video yang telah diunduh ke pengguna
            ctx.replyWithVideo({ source: video });
        }
    } catch (error) {
        console.error('Error:', error);
        ctx.reply(error); // Balas pengguna jika terjadi kesalahan
    }
});

// Mulai bot
bot.launch().then(() => {
    console.log('Bot is running');
}).catch((err) => {
    console.error('Error starting bot', err);
});
