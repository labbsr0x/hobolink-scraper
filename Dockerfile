FROM flaviostutz/puppeteer
WORKDIR /app
COPY package.json .
RUN npm install --production
COPY app .