FROM node:20-alpine AS builder

WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application code
COPY . .

# Build the NestJS application
RUN npm run build

# Second stage: Production runtime environment
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (NestJS default)
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start:prod"]
