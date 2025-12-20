FROM node:22-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code (for production build)
# In development, src/ is overridden by volume mount
COPY . .

EXPOSE 5173

# Run vite dev server with host flag for Docker access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
