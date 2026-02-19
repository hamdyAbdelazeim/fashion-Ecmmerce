# Deployment Guide for MERN Stack Application

This guide will walk you through deploying your Fashion E-commerce application using **MongoDB Atlas** (Database), **Render** (Backend), and **Vercel** (Frontend).

## Prerequisites
- GitHub account (Ensure your code is pushed to a repository)
- MongoDB Atlas account
- Render account
- Vercel account

---

## Step 1: Database (MongoDB Atlas)

1. **Log in** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Create a Cluster** (The free shared cluster is sufficient).
3. **Create a Database User**:
   - Go to "Database Access".
   - Add a new user with a username and password. **Remember these credentials**.
4. **Network Access**:
   - Go to "Network Access".
   - Add IP Address -> Allow Access from Anywhere (`0.0.0.0/0`).
5. **Get Connection String**:
   - Go to "Database" -> "Connect" -> "Drivers".
   - Copy the connection string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/...`).
   - Replace `<username>` and `<password>` with the user you created in step 3.

---

## Step 2: Backend Deployment (Render)

1. **Log in** to [Render](https://render.com/).
2. Click **"New +"** -> **"Web Service"**.
3. Connect your **GitHub repository**.
4. Configure the service:
   - **Name**: `fashion-ecommerce-api` (or similar).
   - **Root Directory**: `server`.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install`.
   - **Start Command**: `node index.js`.
5. **Environment Variables** (Scroll down to "Advanced"):
   - `MONGO_URI`: Paste your MongoDB connection string from Step 1.
   - `JWT_SECRET`: `supersecretkey123` (or generate a secure one).
   - `STRIPE_SECRET_KEY`: Your Stripe secret key.
   - `PORT`: `5001` (Render usually sets a PORT env var automatically, but good to have fallback).
   - `CLIENT_URL`: Leave blank for now, we will update this after deploying the frontend.
6. Click **"Create Web Service"**.
7. Wait for deployment to finish. **Copy the URL** of your deployed backend (e.g., `https://fashion-ecommerce-api.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)

1. **Log in** to [Vercel](https://vercel.com/).
2. Click **"Add New..."** -> **"Project"**.
3. Import your **GitHub repository**.
4. Configure the project:
   - **Root Directory**: Click "Edit" and select `client`.
   - **Framework Preset**: Vite (should be auto-detected).
5. **Environment Variables**:
   - `VITE_API_URL`: Paste the **Render Backend URL** from Step 2 (e.g., `https://fashion-ecommerce-api.onrender.com`).
   - **IMPORTANT**: Do NOT add a trailing slash `/` at the end of the URL.
6. Click **"Deploy"**.
7. Wait for deployment to finish. **Copy the URL** of your deployed frontend (e.g., `https://fashion-ecommerce.vercel.app`).

---

## Step 4: Final Configuration

1. **Update Backend CORS**:
   - Go back to your **Render Dashboard**.
   - Go to "Environment" -> Add/Edit `CLIENT_URL`.
   - Set `CLIENT_URL` to your **Vercel Frontend URL** (e.g., `https://fashion-ecommerce.vercel.app`).
   - Save changes. Render will redeploy automatically.

2. **Update Stripe (Optional but Recommended)**:
   - Update your Stripe Webhook endpoints if you are using them.
   - In `orderController.js`, specifically check the `success_url` and `cancel_url`.
     - `success_url: ${process.env.CLIENT_URL}/success`
     - `cancel_url: ${process.env.CLIENT_URL}/checkout`
   - Ensure the `CLIENT_URL` env var in Render is set correctly (without trailing slash).

## Troubleshooting

- **CORS Errors**: Ensure `CLIENT_URL` in Render matches your Vercel URL exactly.
- **Database Connection**: Double-check your `MONGO_URI` in Render. Ensure "Network Access" in MongoDB Atlas allows `0.0.0.0/0`.
- **White Screen on Frontend**: Check the browser console (F12) for errors. Often due to missing `VITE_API_URL`.
