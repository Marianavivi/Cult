FROM quay.io/gurusensei/gurubhay:latest

RUN git clone https://github.com/Marianavivi/Cult/root/cult

WORKDIR /root/cult/

RUN npm install --platform=linuxmusl

EXPOSE 5000

CMD ["npm", "start"]
