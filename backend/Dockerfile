# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]

