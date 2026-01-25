# Tech Stack & Dependencies

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Cloudflare Workers Platform     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Next.js 16 Application    │   │
│  │                             │   │
│  │  ├── Pages (React)          │   │
│  │  ├── API Routes             │   │
│  │  └── Static Assets          │   │
│  └──────────────┬──────────────┘   │
│                 │                   │
│  ┌──────────────▼──────────────┐   │
│  │ Durable Objects Storage     │   │
│  │                             │   │
│  │ ├── Tickets                 │   │
│  │ ├── Activation Logs         │   │
│  │ └── Validation Logs         │   │
│  └─────────────────────────────┘   │
│                                     │
│  Global Edge Deployment             │
│  Zero Infrastructure Management     │
└─────────────────────────────────────┘
```

## 📦 Production Dependencies

### Framework & Runtime
```json
{
  "@opennextjs/cloudflare": "1.14.0",  // Next.js on Cloudflare
  "next": "16.0.7",                    // React framework
  "react": "19.2.1",                   // UI library
  "react-dom": "19.2.1"                // DOM rendering
}
```

### QR Code Handling
```json
{
  "qrcode": "^1.5.3",        // Generate QR codes
  "qrcode.react": "^1.0.1",  // React QR component
  "jsqr": "^1.4.0"           // Scan QR codes from video
}
```

### Utilities
```json
{
  "uuid": "^9.0.1"           // Generate unique IDs
}
```

## 📦 Development Dependencies

### Build Tools
```json
{
  "typescript": "5.9.3",           // Type safety
  "@types/node": "24.10.1",        // Node types
  "@types/react": "19.2.7",        // React types
  "@types/react-dom": "19.2.3",    // React DOM types
  "@types/uuid": "^9.0.7"          // UUID types
}
```

### Code Quality
```json
{
  "eslint": "9.39.2",              // Linting
  "eslint-config-next": "16.0.7"   // Next.js lint config
}
```

### Styling
```json
{
  "@tailwindcss/postcss": "4.1.17",  // CSS framework
  "tailwindcss": "4.1.17"            // Tailwind CLI
}
```

### Cloudflare
```json
{
  "wrangler": "4.56.0"  // Cloudflare Workers CLI
}
```

## 🔧 Tool Versions

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| npm | Latest | Package manager |
| TypeScript | 5.9.3 | Type safety |
| Next.js | 16.0.7 | Framework |
| React | 19.2.1 | UI Library |
| Tailwind CSS | 4.1.17 | Styling |
| Wrangler | 4.56.0 | Deployment |

## 🗄️ Database Technology

### Cloudflare Durable Objects
- **Type**: Serverless stateful storage
- **Use Case**: Persistent ticket data
- **Consistency**: Strong consistency
- **Features**:
  - Global edge deployment
  - Automatic backups
  - Millisecond latency
  - Pay-as-you-go pricing

### Data Stored
```typescript
interface TicketData {
  tickets: Map<string, Ticket>;
  activationLogs: ActivationLog[];
  validationLogs: ValidationLog[];
}
```

## 🎨 Frontend Libraries

### UI Components
- **React 19**: Latest React for optimal performance
- **Tailwind CSS 4.1**: Utility-first CSS framework

### QR Code Libraries
- **jsqr 1.4.0**: Decode QR codes from video stream
  - ~10KB minified
  - No external dependencies
  - Fast parsing

- **qrcode 1.5.3**: Generate QR codes
  - Canvas/SVG support
  - Error correction levels
  - Multiple output formats

- **qrcode.react 1.0.1**: React wrapper
  - Simple component API
  - Customizable styling
  - Export as image

## 🚀 Performance Metrics

### Bundle Size
```
React + ReactDOM:    ~42 KB
Next.js Framework:   ~Included in worker
jsqr:                ~10 KB
qrcode:              ~8 KB
Tailwind CSS:        ~Purged to 20-30 KB
Total Gzipped:       ~80-100 KB
```

### Load Time Targets
```
First Contentful Paint:   < 1s
Largest Contentful Paint: < 2s
Time to Interactive:      < 2s
API Response Time:        < 200ms
```

## 🔒 Security Packages

None needed - security implemented in application logic:
- UUID for unique identifiers (via `uuid` package)
- Strong consistency from Durable Objects
- No external auth library (simple company name)
- Input validation in API routes

## 📱 Browser Support

### Minimum Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS 14+ (camera API)
- Android 7+ (camera API)
- Responsive design (Tailwind)

## 🛠️ Development Stack

### Local Development
```bash
npm run dev
# Runs Next.js dev server on localhost:3000
# Hot reload enabled
# Full debugging support
```

### Production Build
```bash
npm run build
# Creates optimized build
# Generates .open-next bundle
# Ready for Cloudflare deployment
```

### Type Checking
```bash
npm run check
# Runs TypeScript compiler
# Verifies type safety
# Catches errors before runtime
```

## ☁️ Cloudflare Services Used

### Cloudflare Workers
- **Function**: Serverless compute
- **Runtime**: Node.js compatible
- **Regions**: 300+ globally

### Durable Objects
- **Function**: Persistent state
- **Consistency**: Strong
- **Replication**: Multi-region automatic

### Workers KV
- **Function**: Could be used for caching
- **Current**: Not required, using Durable Objects

## 📋 Configuration Files

```
wrangler.jsonc
├── Worker configuration
├── Durable Objects bindings
├── Environment variables
└── Deployment settings

tsconfig.json
├── TypeScript configuration
├── Path aliases (@/*)
└── Compiler options

package.json
├── Dependencies list
├── Build scripts
└── Project metadata

next.config.ts
├── Next.js configuration
└── Build optimization
```

## 🔄 Data Flow

```
Browser
   ↓
Next.js API Route (/api/tickets/*)
   ↓
Durable Object Handler (ticket-manager.ts)
   ↓
Durable Objects Storage
   ↓
Persisted Data
```

## 📊 Scalability

### Current Architecture Supports
- ✅ Unlimited tickets (storage scales)
- ✅ Thousands of concurrent users
- ✅ Millions of operations per day
- ✅ Global distribution (edge locations)

### Scaling Strategies
1. **Multiple Durable Objects**: One per venue/batch
2. **Caching**: Client-side or KV cache
3. **Logging**: Archive old logs to external storage
4. **Analytics**: Export data periodically

## 🧪 Testing Tools

### Built-in Testing
- Browser DevTools (F12)
- Network tab inspection
- Console error checking

### Optional External Tools
- cURL for API testing
- ngrok for HTTPS local tunnel
- Artillery for load testing
- WebDriver for automation

## 📚 Documentation Format

All docs in Markdown:
- TICKET_SYSTEM_README.md (1200+ lines)
- CLOUDFLARE_SETUP.md (500+ lines)
- TESTING_GUIDE.md (600+ lines)
- TROUBLESHOOTING.md (400+ lines)
- IMPLEMENTATION_SUMMARY.md (400+ lines)
- QUICK_REFERENCE.md (150+ lines)

## 🎯 Why This Stack?

### Next.js 16
- ✅ Full-stack React framework
- ✅ Built-in API routes
- ✅ Edge deployment ready
- ✅ Type-safe with TypeScript

### Cloudflare Workers
- ✅ Global edge deployment
- ✅ Serverless (no ops)
- ✅ Automatic scaling
- ✅ Fast cold starts

### Durable Objects
- ✅ Persistent state
- ✅ Strong consistency
- ✅ Perfect for ticket data
- ✅ No database setup needed

### Tailwind CSS
- ✅ Rapid UI development
- ✅ Mobile-first responsive
- ✅ Small production bundle
- ✅ Great for mobile scanners

### jsqr
- ✅ Lightweight (~10KB)
- ✅ No dependencies
- ✅ Real-time QR parsing
- ✅ Works on mobile

## 🚀 Deployment Platforms

### Primary: Cloudflare Workers
```bash
npm run deploy
# Deploys to Cloudflare globally
# Using wrangler CLI
# Includes Durable Objects migration
```

### Alternative: Self-hosted
```bash
npm run build
npm run start
# Runs on any Node.js server
# Requires external database
# Not recommended for this use case
```

## 💰 Cost Estimate

### Cloudflare (Recommended)
- Workers: Free tier or $0.50/million requests
- Durable Objects: ~$0.15/million requests + $0.20/GB storage
- For 1000 tickets + 2000 scans: ~$2/month

### Database
- Durable Objects included
- No additional database costs

### Hosting
- Included with Cloudflare
- Global edge deployment

---

**Total Dependencies: 11 production packages**  
**Total Dev Dependencies: 8 dev packages**  
**Total Size (Gzipped): ~100-150 KB**  
**No external service dependencies (except Cloudflare)**
