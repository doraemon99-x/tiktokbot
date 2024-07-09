# Menggunakan base image Node.js versi terbaru
FROM node:latest

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy seluruh kode aplikasi ke dalam container
COPY . .

# Expose port
EXPOSE 3000

# Menjalankan aplikasi
CMD ["npm", "start"]
