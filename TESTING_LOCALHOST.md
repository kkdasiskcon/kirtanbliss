# Testing on Localhost - Step by Step Guide

## Prerequisites

1. **Node.js installed** (v16 or higher)
2. **Supabase account** with your project URL and API key
3. **Internet connection** (to connect to Supabase)

## Step 1: Install Dependencies

If you haven't already, install all required packages:

```bash
npm install
```

## Step 2: Create Environment File

Create a `.env` file in the root directory (same level as `package.json`):

```bash
# Create .env file
touch .env
```

Or manually create a file named `.env` with this content:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key-here` with your actual Supabase anon key
- Make sure the URL starts with `https://` (not `http://`)
- No quotes needed around the values
- No spaces around the `=` sign

### Where to find your Supabase credentials:

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`

## Step 3: Start Development Server

Run the development server:

```bash
npm run dev
```

You should see output like:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Step 4: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

(Or whatever port Vite shows in the terminal)

## Step 5: Verify It's Working

1. **Check Browser Console** (Press F12):
   - Look for any error messages
   - Should see: `✅ Set` messages for Supabase URL and Key
   - If you see `❌ Missing`, check your `.env` file

2. **Check Network Tab**:
   - Open DevTools → Network tab
   - Look for requests to `supabase.co`
   - Should see successful requests (status 200)

3. **Test the App**:
   - The app should load without errors
   - You should see devotee data if your Supabase database has data
   - Try clicking buttons and navigating tabs

## Troubleshooting

### Issue: "Supabase configuration is missing"

**Solution:**
- Check `.env` file exists in root directory
- Verify file is named exactly `.env` (not `.env.txt` or `.env.local`)
- Restart the dev server after creating/editing `.env`
- Check console for which variable is missing

### Issue: "Connection error"

**Solution:**
- Verify Supabase URL is correct (check for typos)
- Make sure URL starts with `https://`
- Check your internet connection
- Verify Supabase project is active (not paused)

### Issue: Port already in use

**Solution:**
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3000
```

### Issue: Module not found errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Environment variables not loading

**Solution:**
1. Make sure `.env` file is in root directory (not in `src/`)
2. Restart dev server completely (stop and start again)
3. Check `.env` file format (no quotes, no spaces)
4. Try clearing browser cache

## Testing Different Scenarios

### Test with Empty Database
- App should show "No devotees found" or empty lists
- Should not crash or show errors

### Test with Network Offline
- Disconnect internet
- App should show connection error
- Reconnect and click "Retry"

### Test Error Handling
- Temporarily break Supabase URL in `.env`
- App should show helpful error message
- Fix and restart server

## Development Tips

1. **Hot Reload**: Changes to code automatically refresh the browser
2. **Console Logs**: Check browser console for debugging info
3. **Network Tab**: Monitor API requests to Supabase
4. **React DevTools**: Install browser extension for React debugging

## Next Steps

Once localhost is working:
- Test on mobile browser (use your computer's IP address)
- Build for production: `npm run build`
- Test production build: `npm run preview`
