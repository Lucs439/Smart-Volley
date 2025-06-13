FROM node:18

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Création du dossier logs avec les bonnes permissions
RUN mkdir -p logs && \
    touch logs/combined.log logs/error.log && \
    chown -R node:node /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/logs

USER node

EXPOSE 3001

CMD ["npm", "run", "dev"] 