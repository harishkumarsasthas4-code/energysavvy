FROM node:18-alpine

# Install Python for Python analysis
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the action
RUN npm run build

# Set entrypoint
ENTRYPOINT ["node", "/app/dist/index.js"]