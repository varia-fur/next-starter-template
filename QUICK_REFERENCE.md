# 🦋 Quick Reference Card

## URLs

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | System overview |
| Admin Dashboard | `/admin/dashboard` | Real-time stats |
| Create Tickets | `/admin/create-tickets` | Generate presale tickets |
| Activation Scanner | `/scanner/activation` | Company activation |
| Validation Scanner | `/scanner/validation` | Entry validation |

## Getting Started

```bash
# Install
npm install

# Develop
npm run dev

# Deploy
npm run deploy

# Monitor
wrangler tail
```

## API Endpoints

```bash
# Create ticket
POST /api/tickets/create
Body: { ticketType }

# Activate ticket
POST /api/tickets/activate
Body: { qrCode, companyName }

# Validate ticket
POST /api/tickets/validate
Body: { qrCode, scannerLocation? }

# Check status
GET /api/tickets/check?qrCode=...

# Stats
GET /api/tickets/stats

# List all
GET /api/tickets/list
```

## Ticket Flow

```
Create → Activate → Validate
↓        ↓          ↓
Admin    Company    Event Staff
```

## Environment Variables

```env
# Local
NEXT_PUBLIC_API_URL=http://localhost:3000

# Production
NEXT_PUBLIC_API_URL=https://your-domain.workers.dev
```

## Ticket Lifecycle

```
🆕 New
  ↓ Create by Admin
🎫 Created (QR Code Available)
  ↓ Company Scans → Activation Scanner
✍️ Activated (By Company Name)
  ↓ Staff Scans → Validation Scanner
✅ Validated (Entry Approved - Used Once)
  ↓ Attempts to scan again
❌ Duplicate (Rejected)
```

## File Locations

### Key Files
- Durable Object: `src/lib/ticket-manager.ts`
- API Routes: `src/app/api/tickets/*/route.ts`
- Scanners: `src/app/scanner/{activation,validation}/page.tsx`
- Admin: `src/app/admin/{dashboard,create-tickets}/page.tsx`
- Config: `wrangler.jsonc`, `package.json`

### Documentation
- System: `TICKET_SYSTEM_README.md`
- Deploy: `CLOUDFLARE_SETUP.md`
- Testing: `TESTING_GUIDE.md`
- Troubleshooting: `TROUBLESHOOTING.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build project
npm run lint            # Check code quality

# Deployment
npm run deploy          # Deploy to Cloudflare
npm run preview         # Preview build locally

# Monitoring
wrangler tail           # Watch production logs
wrangler deployments    # List deployments
wrangler rollback       # Rollback deployment
```

## Testing Quick Checks

✅ Create ticket → See QR code  
✅ Activate ticket → See company name stored  
✅ Validate ticket → Green success  
✅ Validate again → Red duplicate error  
✅ Dashboard updates → Real-time stats  
✅ Mobile camera works → Responsive design  

## Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` in production
- [ ] Test locally thoroughly
- [ ] Run `npm run build` successfully
- [ ] Deploy with `npm run deploy`
- [ ] Monitor with `wrangler tail`
- [ ] Test all three pages on production
- [ ] Test on mobile device
- [ ] Train staff on scanner usage

## Error Quick Fixes

| Error | Fix |
|-------|-----|
| Camera not working | Use HTTPS, check permissions |
| QR won't scan | Better lighting, steady hand |
| Tickets disappear | Run `npm run dev` for local |
| API 404 | Check env var `NEXT_PUBLIC_API_URL` |
| Stats not updating | Refresh page or wait 5 sec |
| Durable Object error | Redeploy: `npm run deploy` |

## Database (Durable Objects)

- **Location**: Cloudflare Durable Objects
- **Persistence**: Automatic
- **Consistency**: Strong
- **Access**: Via Next.js API routes
- **Backup**: Cloudflare automatic

## Ticket Data Structure

```typescript
{
  id: string                    // UUID
  qrCode: string               // BUTTERFLY-xxxxx
  ticketType: string           // adult/child/senior/family
  purchaseDate: ISO string     // 2025-01-18T...
  activated: boolean           // true/false
  activatedBy: string          // Company Name
  activatedAt: ISO string      // 2025-01-18T...
  validated: boolean           // true/false
  validatedAt: ISO string      // 2025-01-18T...
  checkInCount: number         // 0 or 1
}
```

## Features Matrix

| Feature | Admin | Activation | Validation |
|---------|-------|-----------|-----------|
| Create tickets | ✅ | - | - |
| View dashboard | ✅ | - | - |
| Activate tickets | - | ✅ | - |
| Validate tickets | - | - | ✅ |
| View stats | ✅ | - | - |
| Company tracking | - | ✅ | - |
| Location tracking | - | - | ✅ |

## Performance Targets

- Page load: < 1 second
- API response: < 200ms
- QR generation: < 500ms
- Dashboard refresh: Every 5 seconds

## Security Features

- ✅ Unique QR codes (UUID-based)
- ✅ One-time use (duplicate prevention)
- ✅ Activation requirement
- ✅ Company accountability
- ✅ Complete audit trail
- ✅ Timestamp tracking

## Support Resources

- **Docs**: See TICKET_SYSTEM_README.md
- **Deploy**: See CLOUDFLARE_SETUP.md
- **Test**: See TESTING_GUIDE.md
- **Issues**: See TROUBLESHOOTING.md
- **Logs**: `wrangler tail`
- **Console**: F12 in browser

---

**Butterfly House Ticket System**  
Built with Next.js 16 & Cloudflare Durable Objects  
Version 1.0 - Production Ready
