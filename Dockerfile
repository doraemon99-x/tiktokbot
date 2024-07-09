# Use the latest Node.js LTS version as the base image
FROM node:18

# Create and set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the bot will run on
EXPOSE 3000

# Command to run the bot
CMD ["node", "index.js"]
