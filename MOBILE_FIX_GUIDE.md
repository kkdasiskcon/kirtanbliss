# Mobile/Web Wrapper Fix Guide

## Issues Fixed

1. ✅ **CORS/Network Issues** - Added network security config for Android
2. ✅ **Environment Variables** - Fixed env var loading in mobile builds
3. ✅ **Supabase Client Config** - Optimized for mobile/web wrappers
4. ✅ **Error Handling** - Better error messages for debugging
5. ✅ **Content Security Policy** - Added CSP headers for mobile

## Steps to Fix Your Mobile App

### 1. Create/Update `.env` file

Create a `.env` file in the root directory with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Make sure the URL starts with `https://` (not `http://`)

### 2. Rebuild the App

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Or for iOS
npx cap sync ios
```

### 3. Rebuild Android App

```bash
# Open Android Studio
npx cap open android

# Or build from command line
cd android
./gradlew assembleDebug
```

### 4. Test the Fixes

1. **Check Console Logs:**
   - Open Chrome DevTools (chrome://inspect)
   - Connect your device
   - Check for any Supabase connection errors

2. **Verify Environment Variables:**
   - The app should log Supabase URL/Key status on startup
   - Check browser console for any missing env warnings

3. **Test Network Connection:**
   - Try on WiFi first
   - Then test on mobile data
   - Check if timeout errors occur

## Common Issues & Solutions

### Issue: "Failed to fetch" or "Connection error"

**Solution:**
- Check if Supabase URL is correct and uses HTTPS
- Verify internet connection
- Check Android network security config is applied
- Rebuild the app after changes

### Issue: Environment variables not loading

**Solution:**
- Make sure `.env` file exists in root directory
- Rebuild the app: `npm run build`
- Sync Capacitor: `npx cap sync android`
- Check `dist/index.html` has the env vars injected

### Issue: CORS errors

**Solution:**
- Supabase handles CORS automatically
- Check Content Security Policy in `index.html`
- Verify network security config in Android

### Issue: Works on desktop but not mobile

**Solution:**
- Mobile browsers have stricter security
- Check AndroidManifest.xml has network permissions
- Verify network_security_config.xml exists
- Rebuild the native app completely

## Debugging Steps

1. **Enable Debug Logging:**
   - Check browser console on mobile (use remote debugging)
   - Look for Supabase connection errors
   - Check network tab for failed requests

2. **Test Supabase Connection:**
   - Try accessing Supabase URL directly in mobile browser
   - Check if Supabase dashboard is accessible

3. **Check Build Output:**
   - Verify `dist/index.html` has environment variables
   - Check if `dist` folder is synced to Capacitor

4. **Network Debugging:**
   - Test on different networks (WiFi vs Mobile Data)
   - Check firewall/proxy settings
   - Verify SSL certificates

## Additional Configuration

### For Production Builds

Update `vite.config.js` to ensure env vars are embedded:

```js
export default defineConfig({
  // ... existing config
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
})
```

### For iOS (if applicable)

Add to `ios/App/App/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>supabase.co</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <false/>
        </dict>
    </dict>
</dict>
```

## Still Having Issues?

1. Check Supabase project settings:
   - API URL is correct
   - Anon key is correct
   - Project is active (not paused)

2. Verify network connectivity:
   - Test Supabase URL in mobile browser
   - Check if other HTTPS sites work

3. Check Capacitor logs:
   ```bash
   npx cap run android --verbose
   ```

4. Test in browser first:
   - Open `dist/index.html` in mobile browser
   - If it works there, issue is with Capacitor config
   - If it doesn't, issue is with Supabase/env vars
