# Menggunakan base image Python versi terbaru
FROM python:3.8-slim

# Set working directory di dalam container
WORKDIR /app

# Menyalin dependencies file dan menginstal dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh konten dari direktori saat ini ke dalam container di /app
COPY . .

# Command untuk menjalankan bot saat container dijalankan
CMD ["python", "tt.py"]
