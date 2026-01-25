# 🦋 Butterfly House Presale Ticket System

A complete presale ticket management system with QR code generation, company activation tracking, and entry validation. Built with Next.js and Cloudflare Durable Objects for reliable, serverless ticket management.

## 🎯 System Overview

The system consists of three main components:

1. **Admin Panel** - Create and manage presale tickets
2. **Activation Scanner** - Companies activate tickets before the event
3. **Validation Scanner** - Entry staff validate tickets at the event

## 🏗️ Architecture

### Cloudflare Durable Objects

All ticket data, activation logs, and validation logs are stored in Cloudflare Durable Objects, providing:

- ✅ Strong consistency for ticket data
- ✅ Serverless operation with zero infrastructure management
- ✅ Global edge deployment
- ✅ Real-time persistence without databases

### API Endpoints

```
POST   /api/tickets/create       - Create a new presale ticket
POST   /api/tickets/activate     - Activate a ticket (company)
POST   /api/tickets/validate     - Validate a ticket (entry)
GET    /api/tickets/check        - Check ticket status
GET    /api/tickets/stats        - Get system statistics
GET    /api/tickets/list         - List all tickets
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

3. **Update environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   - Homepage: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin/dashboard
   - Activation Scanner: http://localhost:3000/scanner/activation
   - Validation Scanner: http://localhost:3000/scanner/validation

## 📋 Ticket Workflow

### 1️⃣ Create Tickets (Admin)
- Visit `/admin/create-tickets`
- Select ticket type (Adult, Child, Senior, Family)
- System generates unique QR code
- Print or distribute the QR code

### 2️⃣ Distribute Tickets
- Print QR codes or display on screen
- Customers can present QR code at entry

### 3️⃣ Company Activation
- Visit `/scanner/activation`
- Enter company name
- Scan customer's QR code
- System marks ticket as activated by that company
- Can only be activated once

### 4️⃣ Entry Validation
- Visit `/scanner/validation` at event entrance
- Scan customer's QR code
- System checks if ticket is:
  - ✅ Activated (required)
  - ✅ Not already used (duplicate prevention)
- If valid, entry is approved
- Ticket can only be validated once

## 🗄️ Data Structure

### Tickets
```typescript
{
  id: string;                    // Unique ticket ID
  qrCode: string;               // QR code identifier
  ticketType: string;           // Type: adult, child, senior, family
  purchaseDate: string;         // ISO timestamp
  activated: boolean;           // Whether company activated
  activatedBy?: string;         // Company name that activated
  activatedAt?: string;         // Activation timestamp
  validated: boolean;           // Whether used for entry
  validatedAt?: string;         // Validation timestamp
  lastScanned?: string;         // Last scan time
  checkInCount: number;         // Entry count
}
```

### Activation Log
```typescript
{
  id: string;                   // Log entry ID
  ticketId: string;             // Associated ticket
  companyName: string;          // Company that activated
  activatedAt: string;          // ISO timestamp
}
```

### Validation Log
```typescript
{
  id: string;                   // Log entry ID
  ticketId: string;             // Associated ticket
  validatedAt: string;          // ISO timestamp
  scannerLocation?: string;     // Where ticket was scanned
  validationStatus: string;     // 'valid', 'invalid', or 'duplicate'
}
```

## 📊 Admin Dashboard

The dashboard at `/admin/dashboard` displays:

- **Total Tickets** - All created presale tickets
- **Activated Tickets** - Tickets activated by companies
- **Validated Tickets** - Tickets used for entry
- **Activation Logs** - Count of activation events
- **Validation Logs** - Count of validation events

Dashboard refreshes every 5 seconds with real-time data.

## 📱 QR Code Scanner Features

### Activation Scanner (`/scanner/activation`)
- 🎯 Company name input (required)
- 📹 Camera-based QR scanning
- ✍️ One-time activation tracking
- 🟢 Success/failure feedback
- 📊 Shows ticket type

### Validation Scanner (`/scanner/validation`)
- 📹 Camera-based QR scanning
- 📍 Optional scanner location tracking
- ✅ Validates activation and duplicate check
- 🟢 Green for valid entries
- 🔴 Red for invalid/already used
- 📱 Responsive mobile design

## 🔒 Security Features

1. **Duplicate Prevention** - Tickets can only be validated once
2. **Activation Requirement** - Tickets must be activated before validation
3. **Company Tracking** - Records which company activated each ticket
4. **Audit Logs** - Complete activation and validation history
5. **Unique QR Codes** - Each ticket has cryptographically unique identifier

## 🌐 Deployment to Cloudflare

### 1. Update wrangler.jsonc

Configure your Cloudflare project:

```jsonc
{
  "name": "butterfly-house-tickets",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-10-08",
  "durable_objects": {
    "bindings": [
      {
        "name": "TICKET_MANAGER",
        "class_name": "TicketManager",
        "script_name": "butterfly-house-tickets"
      }
    ]
  }
}
```

### 2. Build and Deploy

```bash
npm run build
npm run deploy
```

### 3. Set Production Environment

Update `NEXT_PUBLIC_API_URL` to your Cloudflare Workers URL in production.

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── create-tickets/    # Ticket creation interface
│   │   └── dashboard/         # Admin dashboard
│   ├── api/
│   │   └── tickets/
│   │       ├── create/        # Create ticket endpoint
│   │       ├── activate/      # Activate ticket endpoint
│   │       ├── validate/      # Validate ticket endpoint
│   │       ├── check/         # Check ticket endpoint
│   │       ├── stats/         # Get stats endpoint
│   │       └── list/          # List tickets endpoint
│   ├── scanner/
│   │   ├── activation/        # Activation scanner UI
│   │   └── validation/        # Validation scanner UI
│   ├── page.tsx               # Homepage
│   └── layout.tsx             # Root layout
└── lib/
    └── ticket-manager.ts      # Durable Object class
```

### Key Dependencies

- **Next.js 16** - React framework
- **qrcode.react** - QR code generation
- **jsqr** - QR code reading
- **uuid** - Unique ID generation
- **Tailwind CSS** - Styling

## 🐛 Troubleshooting

### Camera Not Working

1. Ensure HTTPS is used (required for camera access)
2. Grant camera permissions to the browser
3. Check browser console for errors

### Tickets Not Persisting

1. Verify Durable Objects are configured in `wrangler.jsonc`
2. Check that the migration is deployed
3. Monitor Cloudflare Dashboard for errors

### QR Code Not Scanning

1. Ensure good lighting
2. Hold camera steady for 1-2 seconds
3. Try different angles
4. Verify QR code is not damaged

## 📝 API Examples

### Create Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/create \
  -H "Content-Type: application/json" \
  -d '{
    "ticketType": "adult"
  }'
```

### Activate Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/activate \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BUTTERFLY-xxxxx",
    "companyName": "Tour Company ABC"
  }'
```

### Validate Ticket
```bash
curl -X POST http://localhost:3000/api/tickets/validate \
  -H "Content-Type: application/json" \
  -d '{
    "qrCode": "BUTTERFLY-xxxxx",
    "scannerLocation": "Main Entrance"
  }'
```

### Check Ticket
```bash
curl http://localhost:3000/api/tickets/check?qrCode=BUTTERFLY-xxxxx
```

### Get Stats
```bash
curl http://localhost:3000/api/tickets/stats
```

## 📄 License

Built for Butterfly House Presale System

## 🤝 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js and Cloudflare**
