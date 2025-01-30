FROM node:18
WORKDIR /app
COPY package*.json ./
COPY .env /app/.env
RUN npm install
COPY . .  
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
