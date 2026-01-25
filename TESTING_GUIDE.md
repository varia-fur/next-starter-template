# Testing Guide for Butterfly House Ticket System

## Manual Testing Checklist

### 1. Homepage (`/`)
- [ ] Page loads without errors
- [ ] All three action cards are visible and clickable
- [ ] Feature list displays correctly
- [ ] Workflow section shows all 4 steps
- [ ] Footer appears at bottom

### 2. Admin Dashboard (`/admin/dashboard`)
- [ ] Dashboard loads
- [ ] All 5 stat cards display
- [ ] Numbers are visible (should be 0 initially)
- [ ] Stats refresh every 5 seconds
- [ ] Three action cards are clickable

### 3. Create Tickets (`/admin/create-tickets`)
- [ ] Form displays with ticket type selector
- [ ] Can select Ticket Type (Adult, Child, Senior, Family)
- [ ] "Create Ticket" button is clickable
- [ ] QR code displays after creation
- [ ] QR code contains ticket information
- [ ] Can create multiple tickets
- [ ] Dashboard stats update after ticket creation

### 4. Activation Scanner (`/scanner/activation`)
- [ ] Page loads
- [ ] Company Name input field is visible and required
- [ ] "Start Scanning" button appears
- [ ] Button is disabled without company name
- [ ] Camera access prompt appears when scanning
- [ ] Camera video preview shows when granted
- [ ] QR code scanning works
- [ ] Success/failure feedback appears after scan
- [ ] Scanning results show ticket type
- [ ] Can scan multiple tickets without refresh
- [ ] Already activated tickets show error with company name

### 5. Validation Scanner (`/scanner/validation`)
- [ ] Page loads
- [ ] Scanner Location field is optional
- [ ] "Start Scanning" button appears
- [ ] Camera access prompt appears when scanning
- [ ] Camera video preview shows when granted
- [ ] QR code scanning works
- [ ] Valid activated tickets show green success
- [ ] Invalid (not activated) tickets show red error
- [ ] Already validated tickets show duplicate error
- [ ] Results show ticket type
- [ ] Can scan multiple tickets without refresh

## Testing Scenarios

### Scenario 1: Complete Happy Path

```
1. Homepage → Create Tickets
2. Select: Adult ticket type
3. Note the QR code displayed
4. Homepage → Activation Scanner
5. Enter company name: "Tour Company A"
6. Scan the QR code
7. Verify ticket is activated
8. Homepage → Dashboard → Check stats updated
9. Homepage → Validation Scanner
10. Scan the same QR code
11. Verify ticket is valid and green
12. Dashboard should show 1 total, 1 activated, 1 validated
```

### Scenario 2: Duplicate Activation

```
1. Create ticket (see Scenario 1)
2. Activate with Company A
3. Try to activate again with Company B
4. Should show error: "Ticket already activated"
5. Should display original company name
```

### Scenario 3: Validate Without Activation

```
1. Create ticket
2. Try to validate without activating
3. Should show: "Ticket has not been activated yet"
4. Should show red error
5. Ticket should not be marked as validated
```

### Scenario 4: Duplicate Validation

```
1. Create ticket
2. Activate with Company A
3. Validate ticket (first scan)
4. Should show green "Valid" with ticket type
5. Try to validate again with same QR code
6. Should show: "Ticket already used"
7. Should show when it was used
```

### Scenario 5: Multiple Tickets

```
1. Create 5 different tickets
2. Activate all 5 with same company
3. Validate all 5
4. Dashboard should show:
   - Total: 5
   - Activated: 5
   - Validated: 5
```

## Testing with Browser DevTools

### Check API Calls

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Create Ticket"
4. Look for request to `/api/tickets/create`
5. Response should contain ticket data and QR code

### Check Console

1. Open DevTools (F12)
2. Go to Console tab
3. No errors should appear during normal operation
4. Watch for any warnings

### Test Mobile

1. Open DevTools (F12)
2. Click device toggle (mobile view)
3. Test both scanner apps on mobile viewport
4. Camera should work on mobile browser

## Performance Testing

### Dashboard Refresh Rate

```javascript
// Console test: Check if stats refresh
console.time('stats-fetch');
fetch('/api/tickets/stats').then(() => console.timeEnd('stats-fetch'));
```

Expected: < 200ms response time

### Create Ticket Performance

```javascript
// Console test: Time ticket creation
async function createTicket() {
  console.time('create-ticket');
  const res = await fetch('/api/tickets/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketType: 'adult'
    })
  });
  console.timeEnd('create-ticket');
  return res.json();
}
createTicket();
```

Expected: < 500ms

## API Testing with cURL

### Create Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "ticketType": "adult"
  }'
```

### Get Stats
```bash
curl http://localhost:3000/api/tickets/stats
```

### Check Ticket Status
```bash
curl "http://localhost:3000/api/tickets/check?qrCode=BUTTERFLY-xxxxx"
```

## Edge Cases to Test

### 1. Empty Fields
- [ ] Try activating without company name
- [ ] Should show validation error

### 2. Invalid QR Codes
- [ ] Scan invalid/malformed QR code
- [ ] Scan non-existent ticket code
- [ ] Should show "Ticket not found"

### 3. Rapid Operations
- [ ] Click "Start Scanning" multiple times
- [ ] Should not create duplicate requests
- [ ] Create multiple tickets in quick succession
- [ ] System should handle gracefully

### 4. Browser Permissions
- [ ] Deny camera permission
- [ ] Should show helpful error message
- [ ] Allow camera after denying
- [ ] Should prompt again

### 5. Offline Behavior
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Try to create ticket
- [ ] Should show network error
- [ ] Go back online and retry

## Cloudflare Specific Testing

After deploying to Cloudflare:

### 1. Verify Durable Object
```bash
wrangler tail
```
- Watch for requests being routed to Durable Object

### 2. Check Storage
```bash
wrangler durable-objects list
```
- Verify TicketManager instance exists

### 3. Monitor Performance
```bash
wrangler analytics engine tail
```
- View real-time metrics

### 4. Test Custom Domain
- Replace localhost with your Cloudflare domain
- Test all scanners with production URL
- Verify mobile camera access works

## Load Testing

### Simulate Multiple Users Creating Tickets

```bash
# Using Apache Bench
ab -n 100 -c 10 \
  -p data.json \
  -T application/json \
  http://localhost:3000/api/tickets/create
```

### Simulate Scanner Load

```bash
# Multiple validation requests
for i in {1..50}; do
  curl -X POST http://localhost:3000/api/tickets/validate \
    -H "Content-Type: application/json" \
    -d '{"qrCode": "BUTTERFLY-test"}'
done
```

## Regression Testing

Before each deployment, verify:

1. [ ] All pages load without 404s
2. [ ] Create ticket generates valid QR code
3. [ ] Activation prevents duplicates
4. [ ] Validation prevents duplicates
5. [ ] Stats update in real-time
6. [ ] Dashboard refreshes correctly
7. [ ] Both scanners work on mobile
8. [ ] No console errors
9. [ ] All links are functional
10. [ ] Forms validate correctly

## Known Issues & Workarounds

### Camera Not Available
- Ensure HTTPS (required for camera access)
- Check browser permissions
- Try different browser

### QR Code Won't Scan
- Improve lighting
- Hold camera steady
- Ensure QR code is not damaged
- Try from different angle

### Stats Not Updating
- Refresh page manually
- Check browser cache (Ctrl+Shift+Delete)
- Check network connection

## Test Report Template

```markdown
# Test Report - [Date]

## Environment
- OS: 
- Browser: 
- URL: 

## Test Summary
- Total Tests: 
- Passed: 
- Failed: 
- Issues: 

## Issues Found

### Issue 1: [Title]
- Description: 
- Severity: [Critical/High/Medium/Low]
- Steps to Reproduce: 
- Expected: 
- Actual: 

## Sign-off
- Tested by: 
- Date: 
- Status: [PASS/FAIL]
```

---

For any test failures, collect:
1. Browser console logs
2. Network tab HAR file
3. Screenshots
4. Wrangler logs (if production)
5. Steps to reproduce
