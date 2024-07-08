const { Telegraf } = require('telegraf');
const request = require('request');
const fs = require('fs');

// Token bot Telegram dari BotFather
const TOKEN = '7495607275:AAGF2rlglCRZFDCV-zGESe6Rp3WnbSU2Vr8';

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
                return reject(`Gagal mengunduh video. Error: ${err}`);
            } else if (response.statusCode !== 200) {
                return reject(`Gagal mengunduh video. Status code: ${response.statusCode}`);
            } else {
                if (body.status === 'redirect') {
                    resolve({ type: 'redirect', url: body.url });
                } else {
                    const video_url = body.url;
                    const video_name = 'video.mp4';
                    const file = fs.createWriteStream(video_name);
                    
                    const videoStream = request.get(video_url);

                    // Penanganan error pada videoStream
                    videoStream.on('error', (err) => {
                        return reject(`Gagal mengunduh video. Error: ${err}`);
                    });

                    // Penanganan error pada file write stream
                    file.on('error', (err) => {
                        return reject(`Gagal menyimpan video. Error: ${err}`);
                    });

                    videoStream.pipe(file).on('finish', () => {
                        resolve({ type: 'video', name: video_name });
                    }).on('error', (err) => {
                        return reject(`Gagal mengunduh video. Error: ${err}`);
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
        const result = await downloadVideo(url);
        if (result.type === 'redirect') {
            ctx.reply(`Video dapat diunduh di: ${result.url}`);
        } else if (result.type === 'video') {
            // Kirim video yang telah diunduh ke pengguna
            ctx.replyWithVideo({ source: result.name });
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
