import requests
import telebot

# Inisialisasi bot Telegram
TOKEN = '7006660414:AAFztKCoXAmk9IV3vA6DIE73cpIH3mswAUw'
bot = telebot.TeleBot(TOKEN)

# Fungsi untuk mengunduh video dari URL menggunakan Cobalt API
def download_video(url):
    api_url = 'https://api.cobalt.tools/api/json'
    payload = {
        'url': url
    }
    headers = {
        'Accept': 'application/json'
    }
    
    try:
        response = requests.post(api_url, json=payload, headers=headers)
        if response.status_code == 200:
            json_response = response.json()
            video_url = json_response.get('url')
            
            # Mengunduh video dari URL yang didapat
            video_response = requests.get(video_url, stream=True)
            if video_response.status_code == 200:
                # Menyimpan konten video ke dalam file lokal
                with open('video.mp4', 'wb') as f:
                    for chunk in video_response.iter_content(chunk_size=1024):
                        if chunk:
                            f.write(chunk)
                return True, 'Video berhasil diunduh'
            else:
                return False, f'Gagal mengunduh video. Status code: {video_response.status_code}'
        else:
            return False, f'Error: {response.status_code} - {response.text}'
    except requests.exceptions.RequestException as e:
        return False, f'Error: {e}'

# Handler untuk perintah /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, 'Halo! Ketik /download <URL TikTok> untuk mengunduh video.')

# Handler untuk perintah /download
@bot.message_handler(commands=['download'])
def download(message):
    chat_id = message.chat.id
    if len(message.text.split()) > 1:
        url = message.text.split()[1]
        success, response = download_video(url)
        if success:
            bot.reply_to(message, response)
            # Kirim video yang telah diunduh ke pengguna
            video = open('video.mp4', 'rb')
            bot.send_video(chat_id, video)
        else:
            bot.reply_to(message, response)
    else:
        bot.reply_to(message, 'Gunakan perintah /download dengan URL TikTok.')

# Jalankan bot
bot.polling()
