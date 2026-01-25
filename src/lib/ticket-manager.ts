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
  lastScanned?: string;
  checkInCount: number;
}

export interface ActivationLog {
  id: string;
  ticketId: string;
  companyName: string;
  activatedAt: string;
}

export interface ValidationLog {
  id: string;
  ticketId: string;
  validatedAt: string;
  scannerLocation?: string;
  validationStatus: 'valid' | 'invalid' | 'duplicate';
}

export class TicketManager {
  private state: DurableObjectState;
  private env: any;
  private tickets: Map<string, Ticket> = new Map();
  private activationLogs: ActivationLog[] = [];
  private validationLogs: ValidationLog[] = [];

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage?.get('tickets');
      if (stored && typeof stored === 'string') {
        const data = JSON.parse(stored);
        this.tickets = new Map(data.tickets || []);
        this.activationLogs = data.activationLogs || [];
        this.validationLogs = data.validationLogs || [];
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      if (path === '/create-ticket' && method === 'POST') {
        return await this.createTicket(request);
      } else if (path === '/activate-ticket' && method === 'POST') {
        return await this.activateTicket(request);
      } else if (path === '/validate-ticket' && method === 'POST') {
        return await this.validateTicket(request);
      } else if (path === '/check-ticket' && method === 'GET') {
        return await this.checkTicket(request);
      } else if (path === '/get-stats' && method === 'GET') {
        return await this.getStats(request);
      } else if (path === '/list-tickets' && method === 'GET') {
        return await this.listTickets(request);
      } else if (path === '/delete-ticket' && method === 'POST') {
        return await this.deleteTicket(request);
      } else if (path === '/activations-by-company' && method === 'GET') {
        return await this.getActivationsByCompany(request);
      } else if (path === '/delete-company-tickets' && method === 'POST') {
        return await this.deleteTicketsByCompany(request);
      } else {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  private async createTicket(request: Request): Promise<Response> {
    const body = await request.json<{
      ticketType: string;
    }>();

    const ticketId = uuidv4();
    const qrCode = `BUTTERFLY-${ticketId.toUpperCase()}`;

    const ticket: Ticket = {
      id: ticketId,
      qrCode,
      ticketType: body.ticketType,
      purchaseDate: new Date().toISOString(),
      activated: false,
      validated: false,
      checkInCount: 0,
    };

    this.tickets.set(ticketId, ticket);
    await this.persistData();

    return new Response(JSON.stringify(ticket), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async activateTicket(request: Request): Promise<Response> {
    const body = await request.json<{
      qrCode: string;
      companyName: string;
    }>();

    const ticket = Array.from(this.tickets.values()).find(
      (t) => t.qrCode === body.qrCode
    );

    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (ticket.activated) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Ticket already activated by ${ticket.activatedBy}`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    ticket.activated = true;
    ticket.activatedBy = body.companyName;
    ticket.activatedAt = new Date().toISOString();

    const log: ActivationLog = {
      id: uuidv4(),
      ticketId: ticket.id,
      companyName: body.companyName,
      activatedAt: ticket.activatedAt,
    };

    this.activationLogs.push(log);
    await this.persistData();

    return new Response(
      JSON.stringify({
        success: true,
        ticket,
        message: `Ticket activated by ${body.companyName}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private async validateTicket(request: Request): Promise<Response> {
    const body = await request.json<{
      qrCode: string;
      scannerLocation?: string;
    }>();

    const ticket = Array.from(this.tickets.values()).find(
      (t) => t.qrCode === body.qrCode
    );

    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ticket.activated) {
      const log: ValidationLog = {
        id: uuidv4(),
        ticketId: ticket.id,
        validatedAt: new Date().toISOString(),
        scannerLocation: body.scannerLocation,
        validationStatus: 'invalid',
      };
      this.validationLogs.push(log);
      await this.persistData();

      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'Ticket has not been activated yet',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if already used
    if (ticket.validated) {
      const log: ValidationLog = {
        id: uuidv4(),
        ticketId: ticket.id,
        validatedAt: new Date().toISOString(),
        scannerLocation: body.scannerLocation,
        validationStatus: 'duplicate',
      };
      this.validationLogs.push(log);
      await this.persistData();

      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'Ticket already used',
          usedAt: ticket.validatedAt,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    ticket.validated = true;
    ticket.validatedAt = new Date().toISOString();
    ticket.lastScanned = ticket.validatedAt;
    ticket.checkInCount += 1;

    const log: ValidationLog = {
      id: uuidv4(),
      ticketId: ticket.id,
      validatedAt: ticket.validatedAt,
      scannerLocation: body.scannerLocation,
      validationStatus: 'valid',
    };
    this.validationLogs.push(log);
    await this.persistData();

    return new Response(
      JSON.stringify({
        valid: true,
        ticket: {
          id: ticket.id,
          ticketType: ticket.ticketType,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private async checkTicket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const qrCode = url.searchParams.get('qrCode');

    if (!qrCode) {
      return new Response(JSON.stringify({ error: 'qrCode parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ticket = Array.from(this.tickets.values()).find(
      (t) => t.qrCode === qrCode
    );

    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ticket }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async getStats(request: Request): Promise<Response> {
    const stats = {
      totalTickets: this.tickets.size,
      activatedTickets: Array.from(this.tickets.values()).filter(
        (t) => t.activated
      ).length,
      validatedTickets: Array.from(this.tickets.values()).filter(
        (t) => t.validated
      ).length,
      activationLogs: this.activationLogs.length,
      validationLogs: this.validationLogs.length,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async listTickets(request: Request): Promise<Response> {
    const tickets = Array.from(this.tickets.values());

    return new Response(JSON.stringify({ tickets, total: tickets.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async deleteTicket(request: Request): Promise<Response> {
    const body = await request.json<{ qrCode: string }>();

    if (!body.qrCode) {
      return new Response(JSON.stringify({ error: 'qrCode parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!this.tickets.has(body.qrCode)) {
      return new Response(JSON.stringify({ error: 'Ticket not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    this.tickets.delete(body.qrCode);
    await this.persistData();

    return new Response(JSON.stringify({ success: true, message: 'Ticket deleted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async getActivationsByCompany(request: Request): Promise<Response> {
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

    return new Response(JSON.stringify(groupedByCompany), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async deleteTicketsByCompany(request: Request): Promise<Response> {
    const body = await request.json<{ companyName: string }>();

    if (!body.companyName) {
      return new Response(JSON.stringify({ error: 'companyName parameter required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let deleteCount = 0;
    
    Array.from(this.tickets.entries()).forEach(([qrCode, ticket]) => {
      if (ticket.activatedBy === body.companyName) {
        this.tickets.delete(qrCode);
        deleteCount++;
      }
    });

    await this.persistData();

    return new Response(
      JSON.stringify({ success: true, count: deleteCount, companyName: body.companyName }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  private async persistData(): Promise<void> {
    const data = {
      tickets: Array.from(this.tickets.entries()),
      activationLogs: this.activationLogs,
      validationLogs: this.validationLogs,
    };
    await this.state.storage?.put('tickets', JSON.stringify(data));
  }
}

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const id = env.TICKET_MANAGER.idFromName('default');
    const stub = env.TICKET_MANAGER.get(id);
    return stub.fetch(request);
  },
};
