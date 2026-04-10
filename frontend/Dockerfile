FROM node:20-alpine

WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 5173

# Start Vite dev server (will be overridden by docker-compose command if needed)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
