# Menggunakan base image Node.js versi LTS (14.x)
FROM node:14-slim

# Set working directory di dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Menginstal dependencies
RUN npm install

# Menyalin seluruh konten dari direktori saat ini ke dalam container di /app
COPY . .

# Command untuk menjalankan bot saat container dijalankan
CMD ["npm", "start"]
