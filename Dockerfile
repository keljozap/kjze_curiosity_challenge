# Usar una imagen ligera de Node
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto interno de la API
EXPOSE 3001

# Comando para iniciar la aplicación en producción
CMD ["npm", "start"]