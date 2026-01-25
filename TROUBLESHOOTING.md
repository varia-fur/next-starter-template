# Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Camera Issues

#### "Camera not accessible" Error
**Symptoms**: Scanner pages show camera error or permission denied

**Solutions**:
1. **HTTPS Required** - Camera API requires HTTPS
   - Dev: `http://localhost:3000` (allowed)
   - Production: Must use HTTPS domain
   
2. **Check Browser Permissions**
   - Click lock icon in address bar
   - Find "Camera" setting
   - Change from "Block" to "Allow"
   - Reload page

3. **Try Different Browser**
   - Chrome/Edge have best QR support
   - Firefox works well too
   - Safari may have limitations

4. **Device Camera Check**
   ```bash
   # Test camera on your device
   # Visit: https://webcamtests.com/
   ```

---

### 🔴 QR Code Won't Scan

#### "No QR code detected" / Scanning Takes Forever
**Symptoms**: Camera shows live video but QR code never detected

**Solutions**:
1. **Improve Lighting**
   - Scan in bright room or sunlight
   - Avoid shadows on QR code
   - Use phone's flashlight if indoors

2. **Better Angle**
   - Hold camera 6-12 inches from QR code
   - Keep QR code centered in frame
   - Hold steady for 2+ seconds

3. **QR Code Quality**
   - Ensure QR code not damaged/wrinkled
   - Print at good quality or display on bright screen
   - Zoom in to check code is clear

4. **Device Camera Quality**
   - Some low-end devices have poor cameras
   - Try different device
   - Clean camera lens

---

### 🔴 Tickets Not Persisting

#### "Ticket was created but now it's gone"
**Symptoms**: Create ticket, refresh, ticket disappears

**Local Development**:
1. Check development server is running:
   ```bash
   npm run dev
   ```

2. Data stored in memory, not persistent in dev
   - Restart dev server clears data
   - This is expected behavior

**Production (Cloudflare)**:
1. Verify Durable Objects migration deployed:
   ```bash
   wrangler migrations list
   ```

2. Check worker logs for errors:
   ```bash
   wrangler tail
   ```

3. Ensure wrangler.jsonc has correct config:
   ```jsonc
   "durable_objects": {
     "bindings": [
       {
         "name": "TICKET_MANAGER",
         "class_name": "TicketManager",
         "script_name": "your-worker-name"
       }
     ]
   }
   ```

---

### 🔴 Activation/Validation API Errors

#### "Error: Cannot POST /api/tickets/activate"
**Symptoms**: 404 errors when trying to activate or validate

**Solutions**:
1. **Check Environment Variable**:
   ```bash
   # In .env.local or production
   NEXT_PUBLIC_API_URL=http://localhost:3000  # dev
   NEXT_PUBLIC_API_URL=https://your-domain.workers.dev  # prod
   ```

2. **Verify Routes Exist**:
   ```bash
   # Check these routes exist:
   curl http://localhost:3000/api/tickets/activate
   curl http://localhost:3000/api/tickets/validate
   ```

3. **Check for Typos**:
   - Verify route paths match exactly
   - Check file names: `route.ts` (not `routes.ts`)

---

### 🔴 Stats Not Updating

#### "Dashboard shows 0 even after creating tickets"
**Symptoms**: Create ticket, dashboard stats don't change

**Solutions**:
1. **Manual Refresh**:
   - Press F5 or Cmd+R
   - Auto-refresh happens every 5 seconds

2. **Check Browser Cache**:
   ```bash
   # Hard refresh to clear cache
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   ```

3. **Check Network Connection**:
   - Ensure internet is stable
   - Check browser console (F12) for errors
   - Verify `/api/tickets/stats` returns data:
   ```bash
   curl http://localhost:3000/api/tickets/stats
   ```

4. **Restart Dev Server**:
   ```bash
   # Stop and restart
   Ctrl+C
   npm run dev
   ```

---

### 🔴 QR Code Generation Issues

#### "QR code not displaying" or "Invalid QR code"
**Symptoms**: Create ticket but QR code shows blank

**Solutions**:
1. **Check QRCode Component**:
   - Verify `qrcode.react` is installed:
   ```bash
   npm list qrcode.react
   ```

2. **Valid QR Data**:
   - QR code should contain: `BUTTERFLY-[UUID]`
   - Check browser console for errors

3. **Re-create Ticket**:
   - Try creating another ticket
   - If multiple fail, restart dev server

---

### 🔴 Scanner Shows Wrong Ticket Status

#### "Ticket shows 'invalid' but it should be valid"
**Symptoms**: Validation scanner shows wrong status

**Causes & Solutions**:
1. **Ticket Not Activated**
   - Activation step is required before validation
   - Use activation scanner first
   - Then use validation scanner

2. **Already Used**
   - Tickets can only be validated once
   - Check if ticket was already scanned
   - Create new ticket to test

3. **Wrong QR Code Scanned**
   - Ensure scanning correct ticket
   - Use newly created ticket for testing

---

### 🔴 Mobile Scanner Not Working

#### "Scanner app opens but camera doesn't work on phone"
**Symptoms**: Works on desktop but not on mobile browser

**Solutions**:
1. **Use HTTPS**
   - Mobile browsers stricter with camera
   - Must use HTTPS URL
   - `http://localhost` only works on desktop

2. **Test with ngrok** (for local testing on mobile):
   ```bash
   # Terminal 1: Start dev server
   npm run dev
   
   # Terminal 2: Create HTTPS tunnel
   npx ngrok http 3000
   
   # Terminal 3: Open ngrok URL on phone
   ```

3. **Permission Settings**
   - On phone: Settings → Browser → Permissions
   - Find camera permission
   - Set to "Allow"

4. **Different Mobile Browser**
   - Chrome works best on Android
   - Safari on iPhone
   - Avoid Firefox on mobile for camera

---

### 🔴 "TICKET_MANAGER not found" Error

#### Production Error: Durable Object binding missing
**Symptoms**: 500 error on production with undefined binding

**Solutions**:
1. **Check wrangler.jsonc**:
   ```jsonc
   {
     "durable_objects": {
       "bindings": [
         {
           "name": "TICKET_MANAGER",  // Must match in code
           "class_name": "TicketManager",
           "script_name": "your-worker-name"
         }
       ]
     }
   }
   ```

2. **Check Environment Code**:
   - Verify `env.TICKET_MANAGER` used in routes
   - Match binding name exactly

3. **Redeploy**:
   ```bash
   npm run deploy
   ```

4. **Check Logs**:
   ```bash
   wrangler tail --env production
   ```

---

### 🔴 Too Many Requests / Rate Limiting

#### "Error: Too many requests" on multiple scans
**Symptoms**: System rejects requests after scanning many times

**Solutions**:
1. **This is expected** - Durable Objects rate limit:
   - Default: ~100-1000 requests per second per object
   - For large events, may need multiple object instances

2. **For Heavy Load**:
   - Partition Durable Objects by date or batch
   - Contact Cloudflare for quota increase
   - Implement client-side caching

---

### 🔴 Deploy Fails with Error

#### "Error: Failed to publish"
**Symptoms**: `npm run deploy` fails

**Solutions**:
1. **Check Wrangler Setup**:
   ```bash
   # Verify wrangler installed
   npm list wrangler
   
   # Check Cloudflare login
   wrangler whoami
   ```

2. **Missing Dependencies**:
   ```bash
   npm install
   ```

3. **Build Error**:
   ```bash
   # Check for TypeScript errors
   npm run build
   ```

4. **Invalid Configuration**:
   - Check `wrangler.jsonc` syntax
   - Use JSON validator if unsure

5. **Clear Cache & Retry**:
   ```bash
   rm -rf .open-next node_modules/.cache
   npm run deploy
   ```

---

### 🔴 Blank Page / 500 Error

#### Pages show error or blank screen
**Symptoms**: Navigate to page and see nothing

**Solutions**:
1. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Copy error and search for solution

2. **Check Server Logs**:
   ```bash
   # For dev:
   npm run dev  # Watch console output
   
   # For production:
   wrangler tail
   ```

3. **Check Network Tab**:
   - DevTools → Network
   - Look for failed requests (red)
   - Check response for error details

4. **Try Hard Refresh**:
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

---

### 🔴 Form Validation Issues

#### "Form won't submit" or missing error messages
**Symptoms**: Can't create tickets

**Solutions**:
1. **Check Required Fields**:

   - Ticket Type: has default (Adult)

2. **Browser Validation**:
   - Try different browser
   - Check console for validation errors

3. **Clear Form Data**:
   - Clear browser cache
   - Reset form values manually

---

### 🟡 Performance Issues

#### "System is slow" or "Dashboard takes forever to load"
**Symptoms**: Pages respond slowly

**Solutions**:
1. **Check Network Speed**:
   - DevTools → Network → Throttling
   - Test on slow connection

2. **Dashboard Refresh Rate**:
   - Currently refreshes every 5 seconds
   - To change: edit `useEffect` in dashboard component
   - Increase interval if too slow

3. **Check Browser Performance**:
   - Close other tabs/apps
   - Check CPU/Memory usage
   - Try different browser

4. **Cloudflare Region**:
   - Workers deployed globally
   - Regional latency may vary
   - Production usually faster than local

---

## Debug Checklist

When something goes wrong:

1. ✓ **Open Browser DevTools** (F12)
2. ✓ **Check Console** for error messages
3. ✓ **Check Network** tab for failed requests
4. ✓ **Clear Cache** (Ctrl+Shift+Delete)
5. ✓ **Restart Dev Server** (Ctrl+C then `npm run dev`)
6. ✓ **Check Logs** (`wrangler tail` for production)
7. ✓ **Read Error Message** carefully
8. ✓ **Search Error** on Google/Stack Overflow
9. ✓ **Check Configuration** files
10. ✓ **Test with Simple Case** (e.g., create 1 ticket)

---

## Getting Help

### Check These First
- `TICKET_SYSTEM_README.md` - System overview
- `CLOUDFLARE_SETUP.md` - Deployment guide
- `TESTING_GUIDE.md` - Testing procedures
- Browser console errors (F12)
- `wrangler tail` output (production)

### Resources
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Next.js Docs: https://nextjs.org/docs
- QR Code Library: https://github.com/davidshimjs/qrcodejs

### Collect Information Before Reporting
1. Error message (full text)
2. Steps to reproduce
3. Browser and version
4. Screenshot of issue
5. Console errors (copy & paste)
6. `wrangler tail` output (if production)

---

## Success Indicators

System is working correctly when:

✅ Can create tickets with QR codes  
✅ Activation scanner marks tickets activated  
✅ Validation scanner shows valid for activated tickets  
✅ Dashboard stats update in real-time  
✅ Can't validate without activating first  
✅ Can't validate same ticket twice  
✅ Mobile cameras work properly  
✅ No console errors  
✅ All pages load quickly  

If all above work, you're ready for production!
