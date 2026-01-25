// Local in-memory database for development (replaces Durable Objects)
import { v4 as uuidv4 } from 'uuid';

export interface Ticket {
  id: string;
  qrCode: string;
  ticketType: string;
  purchaseDate: string;
  activated: boolean;
  activatedBy?: string;
  activatedAt?: string;
  validated: boolean;
  validatedAt?: string;
  checkInCount: number;
}

export interface Company {
  id: string;
  name: string;
  apiKey: string;
  createdAt: string;
  active: boolean;
}

interface ActivationLog {
  qrCode: string;
  companyName: string;
  timestamp: string;
}

interface ValidationLog {
  qrCode: string;
  scannerLocation?: string;
  timestamp: string;
}

class LocalTicketDatabase {
  private tickets: Map<string, Ticket> = new Map();
  private companies: Map<string, Company> = new Map();
  private activationLogs: ActivationLog[] = [];
  private validationLogs: ValidationLog[] = [];

  createTicket(ticketType: string): Ticket {
    const id = `BUTTERFLY-${uuidv4()}`;
    const ticket: Ticket = {
      id,
      qrCode: id,
      ticketType,
      purchaseDate: new Date().toISOString(),
      activated: false,
      validated: false,
      checkInCount: 0,
    };
    this.tickets.set(id, ticket);
    console.log('📝 Ticket created in DB:', id, '| Total tickets:', this.tickets.size);
    return ticket;
  }

  activateTicket(qrCode: string, companyName: string): Ticket | string {
    // Trim and normalize the QR code
    const normalizedCode = (qrCode || '').trim();
    const ticket = this.tickets.get(normalizedCode);
    
    if (!ticket) {
      return `Ticket not found: ${normalizedCode}`;
    }

    if (ticket.activated) {
      return `Ticket already activated by ${ticket.activatedBy}`;
    }

    ticket.activated = true;
    ticket.activatedBy = companyName;
    ticket.activatedAt = new Date().toISOString();

    this.activationLogs.push({
      qrCode: normalizedCode,
      companyName,
      timestamp: new Date().toISOString(),
    });

    return ticket;
  }

  validateTicket(
    qrCode: string,
    scannerLocation?: string
  ): Ticket | string {
    // Trim and normalize the QR code
    const normalizedCode = (qrCode || '').trim();
    const ticket = this.tickets.get(normalizedCode);
    
    if (!ticket) {
      return `Ticket not found: ${normalizedCode}`;
    }

    if (!ticket.activated) {
      return 'Ticket not activated - must be activated first';
    }

    if (ticket.validated) {
      return 'Ticket already used - cannot validate twice';
    }

    ticket.validated = true;
    ticket.validatedAt = new Date().toISOString();
    ticket.checkInCount = 1;

    this.validationLogs.push({
      qrCode: normalizedCode,
      scannerLocation,
      timestamp: new Date().toISOString(),
    });

    return ticket;
  }

  checkTicket(qrCode: string): Ticket | string {
    // Trim and normalize the QR code
    const normalizedCode = (qrCode || '').trim();
    const ticket = this.tickets.get(normalizedCode);
    
    if (!ticket) {
      return `Ticket not found: ${normalizedCode}`;
    }
    return ticket;
  }

  getStats() {
    const tickets = Array.from(this.tickets.values());
    return {
      totalTickets: tickets.length,
      activatedTickets: tickets.filter((t) => t.activated).length,
      validatedTickets: tickets.filter((t) => t.validated).length,
      activationLogs: this.activationLogs.length,
      validationLogs: this.validationLogs.length,
    };
  }

  listTickets() {
    return Array.from(this.tickets.values());
  }

  deleteTicket(qrCode: string): string | boolean {
    // Trim and normalize the QR code
    const normalizedCode = (qrCode || '').trim();
    const ticket = this.tickets.get(normalizedCode);
    
    if (!ticket) {
      return `Ticket not found: ${normalizedCode}`;
    }

    this.tickets.delete(normalizedCode);
    return true;
  }

  getActivationsByCompany() {
    const groupedByCompany: { [key: string]: { count: number; tickets: Ticket[] } } = {};

    Array.from(this.tickets.values()).forEach((ticket) => {
      if (ticket.activated && ticket.activatedBy) {
        if (!groupedByCompany[ticket.activatedBy]) {
          groupedByCompany[ticket.activatedBy] = { count: 0, tickets: [] };
        }
        groupedByCompany[ticket.activatedBy].count++;
        groupedByCompany[ticket.activatedBy].tickets.push(ticket);
      }
    });

    console.log('📊 LocalDB - getActivationsByCompany result:', groupedByCompany);
    return groupedByCompany;
  }

  deleteTicketsByCompany(companyName: string): { success: boolean; count: number } {
    let deleteCount = 0;
    
    Array.from(this.tickets.entries()).forEach(([qrCode, ticket]) => {
      if (ticket.activatedBy === companyName) {
        this.tickets.delete(qrCode);
        deleteCount++;
      }
    });

    console.log(`📊 LocalDB - Deleted ${deleteCount} tickets for company: ${companyName}`);
    return { success: true, count: deleteCount };
  }

  createCompany(name: string): Company {
    const company: Company = {
      id: uuidv4(),
      name,
      apiKey: `COMP_${uuidv4().replace(/-/g, '').substring(0, 16)}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.companies.set(company.id, company);
    console.log(`📊 LocalDB - Company created: ${name} with key: ${company.apiKey}`);
    return company;
  }

  validateCompanyKey(companyName: string, apiKey: string): boolean {
    const company = Array.from(this.companies.values()).find((c) => c.name === companyName);
    if (!company) {
      console.log(`❌ LocalDB - Company not found: ${companyName}`);
      return false;
    }
    const isValid = company.apiKey === apiKey && company.active;
    console.log(`${isValid ? '✓' : '❌'} LocalDB - Key validation for ${companyName}: ${isValid}`);
    return isValid;
  }

  getCompanies(): Company[] {
    return Array.from(this.companies.values());
  }

  deleteCompany(id: string): boolean {
    const company = this.companies.get(id);
    if (!company) return false;
    this.companies.delete(id);
    console.log(`📊 LocalDB - Company deleted: ${company.name}`);
    return true;
  }

  regenerateCompanyKey(id: string): Company | string {
    const company = this.companies.get(id);
    if (!company) return `Company not found: ${id}`;
    company.apiKey = `COMP_${uuidv4().replace(/-/g, '').substring(0, 16)}`;
    console.log(`📊 LocalDB - Company key regenerated: ${company.name}`);
    return company;
  }
}

// Global singleton instance - stored on globalThis to persist across Hot Module Reload
declare global {
  var __LOCAL_DB_INSTANCE__: LocalTicketDatabase | undefined;
}

export function getLocalDB(): LocalTicketDatabase {
  if (!global.__LOCAL_DB_INSTANCE__) {
    console.log('🗄️ Initializing local database singleton');
    global.__LOCAL_DB_INSTANCE__ = new LocalTicketDatabase();
  }
  return global.__LOCAL_DB_INSTANCE__;
}

// Export as localDB for use in all routes - use getter to ensure latest instance
export const localDB = {
  createTicket: (ticketType: string) => getLocalDB().createTicket(ticketType),
  activateTicket: (qrCode: string, companyName: string) => getLocalDB().activateTicket(qrCode, companyName),
  validateTicket: (qrCode: string, scannerLocation?: string) => getLocalDB().validateTicket(qrCode, scannerLocation),
  checkTicket: (qrCode: string) => getLocalDB().checkTicket(qrCode),
  getStats: () => getLocalDB().getStats(),
  listTickets: () => getLocalDB().listTickets(),
  deleteTicket: (qrCode: string) => getLocalDB().deleteTicket(qrCode),
  getActivationsByCompany: () => getLocalDB().getActivationsByCompany(),
  deleteTicketsByCompany: (companyName: string) => getLocalDB().deleteTicketsByCompany(companyName),
  createCompany: (name: string) => getLocalDB().createCompany(name),
  validateCompanyKey: (companyName: string, apiKey: string) => getLocalDB().validateCompanyKey(companyName, apiKey),
  getCompanies: () => getLocalDB().getCompanies(),
  deleteCompany: (id: string) => getLocalDB().deleteCompany(id),
  regenerateCompanyKey: (id: string) => getLocalDB().regenerateCompanyKey(id),
};
