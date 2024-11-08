# Use multi-stage build to reduce final image size
FROM node:lts-buster AS builder

# Set the working directory
WORKDIR /root/status

# Install system dependencies and clean up the package list
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  npm i pm2 -g && \
  rm -rf /var/lib/apt/lists/*

# Copy package.json and install project dependencies
COPY package.json .
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Final stage
FROM node:lts-buster

# Set the working directory
WORKDIR /root/status

# Copy only the necessary files from the builder stage
COPY --from=builder /root/status /root/status

# Expose port 5000
EXPOSE 5000

# Start the application
CMD ["pm2-runtime", "index.js"]
