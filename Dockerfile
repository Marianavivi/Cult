# Use Node.js LTS version based on Debian Buster
FROM node:lts-buster

# Install dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install && npm install qrcode-terminal

# Copy the rest of the application code
COPY . .

# Expose port 5000
EXPOSE 5000

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000 || exit 1

# Start the application
CMD ["node", "index.js"]
