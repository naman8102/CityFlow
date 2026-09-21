/**
 * CityFlow AI — Real-Time SOS Server-Sent Events (SSE) Engine
 * Synchronizes Special Case Citizen and Police Dashboard tabs with sub-50ms latency
 */

class SosEventService {
  constructor() {
    this.clients = new Set();
    this.heartbeatInterval = null;
    this.startHeartbeat();
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      this.sendRaw(': keepalive\n\n');
    }, 15000);
  }

  registerClient(req, res, userInfo = {}) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no'
    });

    res.write('retry: 3000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'CityFlow Real-Time SOS Stream Active', timestamp: new Date().toISOString() })}\n\n`);

    const client = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, res, userInfo };
    this.clients.add(client);

    req.on('close', () => {
      this.clients.delete(client);
    });

    req.on('error', () => {
      this.clients.delete(client);
    });

    return client.id;
  }

  broadcastSosEvent(eventType, payload) {
    const dataString = `event: ${eventType}\ndata: ${JSON.stringify({ eventType, payload, timestamp: new Date().toISOString() })}\n\n`;
    this.sendRaw(dataString);
  }

  sendRaw(dataString) {
    for (const client of this.clients) {
      try {
        client.res.write(dataString);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }

  getClientCount() {
    return this.clients.size;
  }
}

export const sosEventBus = new SosEventService();
