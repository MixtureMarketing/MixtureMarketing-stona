/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cloudflare Durable Object: ChatRoom
 * Handles real-time WebSocket connections and broadcasts.
 */
export class ChatRoom {
  state: DurableObjectState;
  sessions: WebSocket[] = [];
  env: any;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const [client, server] = new WebSocketPair();

    await this.handleSession(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async handleSession(ws: WebSocket) {
    ws.accept();
    this.sessions.push(ws);

    ws.addEventListener('message', async (msg) => {
      try {
        const data = JSON.parse(msg.data as string);

        // Broadcast to all other connections in this room
        this.broadcast(JSON.stringify(data), ws);

        // Persistent save to D1
        if (data.content && data.user_id) {
          await this.env.DB.prepare(
            `
            INSERT INTO messages (user_id, project_id, content, sender_type, is_read)
            VALUES (?, ?, ?, ?, ?)
          `,
          )
            .bind(data.user_id, data.project_id || null, data.content, data.sender_type, 0)
            .run();
        }
      } catch (err) {
        console.error('DO Message Error:', err);
      }
    });

    ws.addEventListener('close', () => {
      this.sessions = this.sessions.filter((s) => s !== ws);
    });
  }

  broadcast(message: string, sender: WebSocket) {
    this.sessions.forEach((s) => {
      if (s !== sender) {
        try {
          s.send(message);
        } catch {
          this.sessions = this.sessions.filter((ws) => ws !== s);
        }
      }
    });
  }
}

/**
 * Pages Function: chat endpoint
 * Path: /api/portal/chat?userId=123
 */
export const onRequest: PagesFunction<{ CHAT_ROOM: DurableObjectNamespace }> = async (context) => {
  const { request, env, data } = context;
  const currentUser = data.user as { id: number; role: string };

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const targetUserId = url.searchParams.get('userId') || currentUser.id.toString();

  // Security: Client can only join their own room. Admin can join any.
  if (currentUser.role !== 'admin' && targetUserId !== currentUser.id.toString()) {
    return new Response('Forbidden', { status: 403 });
  }

  // Use targetUserId to get the specific room
  const id = env.CHAT_ROOM.idFromName(targetUserId);
  const room = env.CHAT_ROOM.get(id);

  return room.fetch(request);
};
