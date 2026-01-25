import { TicketManager } from './lib/ticket-manager';

export { TicketManager };

// Export the Durable Object for Cloudflare Workers
export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Route to Durable Object
    if (url.pathname.startsWith('/api/tickets/')) {
      const id = env.TICKET_MANAGER.idFromName('default');
      const stub = env.TICKET_MANAGER.get(id);
      return stub.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
