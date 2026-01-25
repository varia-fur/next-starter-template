# Cloudflare Durable Objects Configuration Guide

## Overview

This document explains how to configure and deploy the Butterfly House Ticket System to Cloudflare Workers with Durable Objects.

## Prerequisites

1. Cloudflare account with Workers enabled
2. `wrangler` CLI installed (`npm install -g @cloudflare/wrangler`)
3. Your Cloudflare API token configured

## Step 1: Configure wrangler.toml

Update your `wrangler.jsonc` with Durable Objects bindings:

```jsonc
{
  "name": "butterfly-house-tickets",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-10-08",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  
  // Durable Objects Configuration
  "durable_objects": {
    "bindings": [
      {
        "name": "TICKET_MANAGER",
        "class_name": "TicketManager",
        "script_name": "butterfly-house-tickets"
      }
    ]
  },

  // Durable Objects Migrations
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["TicketManager"]
    }
  ],

  // Assets
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },

  "observability": {
    "enabled": true
  },

  "upload_source_maps": true,

  // Environment Variables
  "env": {
    "production": {
      "vars": {
        "ENVIRONMENT": "production"
      },
      "routes": [
        {
          "pattern": "butterfly-house.example.com/*",
          "zone_name": "example.com"
        }
      ]
    },
    "staging": {
      "vars": {
        "ENVIRONMENT": "staging"
      },
      "routes": [
        {
          "pattern": "staging-butterfly-house.example.com/*",
          "zone_name": "example.com"
        }
      ]
    }
  }
}
```

## Step 2: Build the Project

```bash
npm run build
```

This will create the `.open-next` directory with the Worker bundle.

## Step 3: Deploy to Cloudflare

### First Time Deployment

```bash
npm run deploy
```

This will:
1. Build the Next.js project
2. Bundle for Cloudflare Workers
3. Create the Durable Object
4. Deploy to Cloudflare

### Subsequent Deployments

```bash
npm run deploy
```

### Deploy to Specific Environment

```bash
wrangler deploy --env production
```

## Step 4: Verify Deployment

1. Check deployment status:
   ```bash
   wrangler deployments list
   ```

2. View logs:
   ```bash
   wrangler tail
   ```

3. Test the API:
   ```bash
   curl https://your-worker.your-account.workers.dev/api/tickets/stats
   ```

## Step 5: Configure Custom Domain

1. Go to Cloudflare Dashboard
2. Navigate to Workers > Your Worker
3. Click "Trigger" → "Add Custom Domain"
4. Enter your domain (e.g., `tickets.example.com`)
5. Set up DNS records as required

## Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, update to your Cloudflare Workers URL:

```env
NEXT_PUBLIC_API_URL=https://tickets.example.com
```

## Database Initialization

The first time a request is made to the system:

1. The Durable Object `TicketManager` is created
2. Storage is initialized with empty data
3. All subsequent requests use the same Durable Object instance

No manual database setup is required!

## Data Persistence

All data is persisted in Durable Objects storage:

- **Location**: Cloudflare Durable Objects distributed storage
- **Consistency**: Strong consistency
- **Availability**: Global edge deployment
- **Backup**: Included in Cloudflare infrastructure

## Monitoring

### View Real-Time Logs

```bash
wrangler tail --env production
```

### Check Durable Object Status

1. Cloudflare Dashboard → Workers
2. Select your worker
3. View "Durable Objects" tab
4. Monitor storage usage and requests

### Analytics

1. Cloudflare Dashboard → Workers Analytics Engine
2. View request metrics
3. Monitor error rates

## Scaling Considerations

- **No configuration needed** - Durable Objects auto-scale
- **Rate limiting** - Configure in Workers → Rate Limiting
- **Cost** - Durable Objects charged per GB of storage per month

## Troubleshooting

### Durable Object Not Found

```
Error: Could not find Durable Object
```

**Solution**: 
- Ensure migration is deployed: `wrangler migrations list`
- Redeploy: `npm run deploy`

### Storage Quota Exceeded

```
Error: Storage quota exceeded
```

**Solution**:
- Check storage usage in Cloudflare Dashboard
- Consider archiving old logs
- Contact Cloudflare support for quota increase

### API Requests Failing

**Solution**:
- Check `wrangler tail` for error logs
- Verify `TICKET_MANAGER` binding in `wrangler.jsonc`
- Ensure `NEXT_PUBLIC_API_URL` is correct

## Rollback

To rollback to previous deployment:

```bash
wrangler rollback --env production
```

## Testing in Staging

Before production deployment, test in staging:

```bash
wrangler deploy --env staging
```

Then test with staging URL before promoting to production.

## Performance Optimization

1. **Enable Caching**:
   ```jsonc
   {
     "routes": [
       {
         "pattern": "*.example.com/api/tickets/stats",
         "zone_name": "example.com",
         "custom_domain": true,
         "path": "/api/tickets/stats"
       }
     ]
   }
   ```

2. **Reduce Requests**:
   - Cache frequently accessed data
   - Batch operations when possible

3. **Monitor Performance**:
   ```bash
   wrangler analytics engine tail
   ```

## Advanced Features

### Multiple Durable Objects

For very large-scale deployments with multiple Durable Objects:

```jsonc
"durable_objects": {
  "bindings": [
    {
      "name": "TICKET_MANAGER",
      "class_name": "TicketManager",
      "script_name": "butterfly-house-tickets"
    },
    {
      "name": "ANALYTICS",
      "class_name": "AnalyticsManager",
      "script_name": "butterfly-house-analytics"
    }
  ]
}
```

### Namespace Partitioning

Create separate Durable Objects for different ticket types:

```typescript
const id = env.TICKET_MANAGER.idFromName(`tickets-${ticketType}`);
const stub = env.TICKET_MANAGER.get(id);
```

## Support

For Cloudflare-specific issues:
- Cloudflare Community: https://community.cloudflare.com
- Cloudflare Docs: https://developers.cloudflare.com/workers/

For application issues:
- Check application logs: `wrangler tail`
- Review error responses in browser DevTools
