const { Telegraf } = require('telegraf');
const request = require('request');
const fs = require('fs');

// Token bot Telegram dari BotFather
const TOKEN = '7006660414:AAFztKCoXAmk9IV3vA6DIE73cpIH3mswAUw';

// Inisialisasi bot
const bot = new Telegraf(TOKEN);

// Fungsi untuk mengunduh video dari URL menggunakan Cobalt API
function downloadVideo(url) {
    return new Promise((resolve, reject) => {
        const api_url = 'https://api.cobalt.tools/api/json';
        const payload = { url };
        const headers = { 'Accept': 'application/json' };

        request.post({ url: api_url, json: payload, headers }, (err, response, body) => {
            if (err) {
                reject(`Gagal mengunduh video. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                reject(`Gagal mengunduh video. Status code: ${response.statusCode}`);
            } else {
                const video_url = body.url;
                const video_name = 'video.mp4';
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
        const videoName = await downloadVideo(url);
        // Kirim video yang telah diunduh ke pengguna
        ctx.replyWithVideo({ source: videoName });
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
