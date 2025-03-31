#!/bin/bash
# Install Node.js dependencies and build frontend
npm install
cd app
npm install
npm run build
cd ..

# Install Python dependencies
pip install -r requirements.txt
