# Use the official Fedora base image
FROM fedora:37

# Update the system and install necessary packages
RUN dnf -y update && \
    dnf install -y https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm \
                   https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm && \
    dnf install -y git ffmpeg ImageMagick nodejs yarnpkg libwebp && \
    dnf clean all

# Clone the repository
RUN git clone https://github.com/Marianavivi/Cult /root/Cult

# Set the working directory
WORKDIR /root/Cult

# Copy the current directory contents into the container
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose the port your app runs on (adjust if necessary)
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]
