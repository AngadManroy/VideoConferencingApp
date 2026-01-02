#!/bin/bash

# Initialize npm
npm init -y

# Install dependencies
npm install express socket.io cors
npm install --save-dev typescript @types/node @types/express @types/cors tsx

# Create tsconfig
npx tsc --init

# Create directory structure
mkdir -p src/{config,services,handlers,types,utils}

echo "Setup complete! Now update package.json and tsconfig.json with the provided configs."

# To Exexcute this file run:
# chmod +x setup.sh
# ./setup.sh