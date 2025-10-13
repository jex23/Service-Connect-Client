# Service Connect Client - Setup Guide

## Setting Up on a New Machine

When you clone this project on a new machine, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:
```env
VITE_API_BASE_URL=http://localhost:9078
```

**Important:** Change this URL based on where your backend is running:
- **Local development:** `http://localhost:9078`
- **Different port:** `http://localhost:YOUR_PORT`
- **Different machine:** `http://YOUR_IP:9078`
- **Production server:** `https://your-domain.com`

### 3. Start the Development Server
```bash
npm run dev
```

## Common Issues

### Issue: 401 UNAUTHORIZED Error

**Symptom:** Getting 401 errors when trying to use chat or other authenticated features.

**Causes:**
1. Backend server is not running
2. Backend URL is incorrect in `.env`
3. You're not logged in
4. Auth token has expired

**Solutions:**
1. Make sure your backend server is running on the correct port
2. Verify `VITE_API_BASE_URL` in `.env` matches your backend URL
3. Log in through the app (tokens are stored in localStorage)
4. If still failing, clear localStorage and log in again:
   ```javascript
   // In browser console:
   localStorage.clear()
   ```

### Issue: Cannot Connect to Backend

**Symptom:** Network errors, "Failed to fetch" errors

**Solutions:**
1. Check if backend is running: `curl http://localhost:9078/api/health` (if you have a health endpoint)
2. Verify the URL in `.env` is correct
3. Check for CORS issues in backend configuration
4. Make sure firewall isn't blocking the connection

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:9078` |

## Running on Different Machines

### Same Network (e.g., Backend on PC A, Frontend on PC B)

1. Find the IP address of the machine running the backend:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig` or `ip addr`

2. On the frontend machine, update `.env`:
   ```env
   VITE_API_BASE_URL=http://192.168.1.100:9078
   ```
   (Replace with actual IP)

3. Ensure backend allows connections from other machines (not bound to localhost only)

### Production Deployment

1. Update `.env` with production API URL:
   ```env
   VITE_API_BASE_URL=https://api.yourproduction.com
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting service

## Notes

- The `.env` file is **not committed to Git** (it's in `.gitignore`)
- Always use `.env.example` as a template
- Each developer/machine should have their own `.env` file
- Never commit sensitive credentials to Git
