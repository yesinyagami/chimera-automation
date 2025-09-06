#!/bin/bash
echo "Installing Wrangler CLI..."
npm install -g wrangler

echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy . --project-name=chimera-ai

echo "Cloudflare deployment complete!"
echo "Your site will be available at: https://chimera-ai.pages.dev"
echo ""
echo "To set up custom domain:"
echo "1. Go to Cloudflare Dashboard"
echo "2. Select your Pages project"
echo "3. Go to Custom domains"
echo "4. Add your domain"
