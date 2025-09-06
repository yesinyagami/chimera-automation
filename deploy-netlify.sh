#!/bin/bash
echo "Deploying to Netlify..."
npm install
netlify deploy --prod
echo "Netlify deployment complete!"
echo "Visit: https://chimera-ai-io.com"
