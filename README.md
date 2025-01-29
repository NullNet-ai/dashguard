# Project Setup Guide

Follow these steps to set up and run the project locally:

1. Install project dependencies using **pnpm**:
   ```bash
   pnpm install

## Copy the sample environment file and configure it:
cp .env-sample .env
Update the .env file with the necessary environment variables.

## Start the local development server
pnpm local

The application will be available at: http://localhost:3000


Note: Ensure pnpm is installed globally before running these commands. If not, install it using:

npm install -g pnpm

If you encounter any issues, double-check the .env file for correct configurations.