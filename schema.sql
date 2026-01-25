-- Butterfly House Presale Ticket System Database Schema

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  qr_code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  ticket_type TEXT NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  activated INTEGER DEFAULT 0,
  activated_by TEXT,
  activated_at DATETIME,
  validated INTEGER DEFAULT 0,
  validated_at DATETIME,
  last_scanned DATETIME,
  check_in_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL,
  company_name TEXT NOT NULL,
  activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS validation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL,
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scanner_location TEXT,
  validation_status TEXT DEFAULT 'valid',
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS scanner_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  scanner_type TEXT NOT NULL,
  company_name TEXT,
  location TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
);
