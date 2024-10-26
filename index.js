const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Masukkan token bot dari BotFather
const TELEGRAM_TOKEN = '7338403050:AAFZe7WgAslciDgUl9Nm_UCWEq2WwLYSJ64';

// Masukkan API ID dan API Key dari Edamam
const app_id = 'bb9e2c19';  // Ganti dengan app_id Anda
const app_key = 'ee4dbbd504006d6d764ab2119bd35af2';  // Ganti dengan app_key Anda

// Fungsi untuk fetch data nutrisi dari Edamam
async function getNutritionData(foodText) {
  const baseUrl = 'https://api.edamam.com/api/nutrition-data';
  
  try {
    const response = await axios.get(baseUrl, {
      params: {
        app_id: app_id,
        app_key: app_key,
        ingr: foodText
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    return null;
  }
}

// Buat instance bot Telegram
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// Mengirimkan pesan saat server dimulai
console.log('NutriSys bot bisa digunakan pada URL: t.me/NutriSys_bot');

// Ketika bot menerima pesan dari pengguna
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const foodText = msg.text;

  // Kirim pesan selamat datang kepada pengguna yang baru pertama kali menghubungi bot
  if (msg.text.toLowerCase() === '/start') {
    bot.sendMessage(chatId, `Selamat datang di NutriSys! Bot ini bisa digunakan untuk mendapatkan informasi nutrisi makanan. Silakan masukkan nama makanan dalam bahasa inggris (misalnya, "100 gram rice") untuk mendapatkan datanya. Gunakan URL ini untuk mengakses bot: t.me/NutriSys_bot`);
    return;
  }

  // Cek apakah pengguna mengirimkan perintah /end
  if (msg.text.toLowerCase() === '/end') {
    bot.sendMessage(chatId, `Percakapan telah diakhiri. Jika Anda ingin memulai lagi, silakan gunakan perintah /start.`);
    return;
  }

  // Kirim pesan loading ke pengguna dalam bahasa Indonesia
  bot.sendMessage(chatId, `Sedang mengambil data nutrisi untuk "${foodText}"...`);

  // Fetch data nutrisi
  const nutritionData = await getNutritionData(foodText);

  // Cek apakah datanya tersedia
  if (nutritionData && nutritionData.calories) {
    // Format data nutrisi dalam bahasa Indonesia dan kirimkan ke pengguna
    const nutritionInfo = `
🍎 *Data Nutrisi untuk ${foodText}:*
- Kalori: *${nutritionData.calories}* kkal
- Berat: *${nutritionData.totalWeight.toFixed(2)}* gram
- Lemak: *${nutritionData.totalNutrients.FAT ? nutritionData.totalNutrients.FAT.quantity.toFixed(2) : 0}* g
- Protein: *${nutritionData.totalNutrients.PROCNT ? nutritionData.totalNutrients.PROCNT.quantity.toFixed(2) : 0}* g
- Karbohidrat: *${nutritionData.totalNutrients.CHOCDF ? nutritionData.totalNutrients.CHOCDF.quantity.toFixed(2) : 0}* g
    `;
    bot.sendMessage(chatId, nutritionInfo, { parse_mode: 'Markdown' });  // Gunakan parse_mode untuk Markdown
  } else {
    // Kirim pesan error dalam bahasa Indonesia jika data tidak ditemukan
    bot.sendMessage(chatId, `Maaf, data nutrisi untuk "${foodText}" tidak ditemukan.`);
    bot.sendMessage(chatId, `Format chat yang benar = 100 gram rice (gunakan bahasa Inggris untuk nama makanan).`);
  }
});
