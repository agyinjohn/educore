FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install dependencies
RUN npm ci

# Build TypeScript
RUN npm run build

EXPOSE 4007

# Start application
CMD ["npm", "start"]
