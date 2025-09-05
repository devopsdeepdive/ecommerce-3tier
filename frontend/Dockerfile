# Use Node.js base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (works even without package-lock.json)
RUN npm install

# Copy source code
COPY . .

# Expose Vite/React dev server port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]

