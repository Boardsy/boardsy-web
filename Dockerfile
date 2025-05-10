# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --quiet

# Copy the rest of the app
COPY . .

# Install the SvelteKit node adapter
RUN npm install --save-dev @sveltejs/adapter-node

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create a non-root user to run the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Install only production dependencies
COPY --from=build /app/package*.json ./
RUN npm ci --quiet --only=production

# Copy built app from the build stage
COPY --from=build /app/build ./build
COPY --from=build /app/.svelte-kit ./.svelte-kit

# Set correct ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 3554

# Set Node.js to production mode
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3554/ || exit 1

# Start the app
CMD ["node", "build/index.js"]
