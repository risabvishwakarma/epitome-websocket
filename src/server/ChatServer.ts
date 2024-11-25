import express, { Application } from 'express';
import http, { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ChatRoutes from '../routers/Routes';

export class ChatServer {
  private readonly app: Application;
  private  readonly httpServer: HttpServer;
  private  readonly io: SocketIOServer;

  constructor(private  readonly port: number) {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, { cors: { origin: '*' } });

    this.initialize();
  }

  private initialize(): void {
    // Initialize routes and WebSocket handlers
        new ChatRoutes(this.app, this.io);

    // Apply other middlewares if needed
    this.app.use(express.json());
  }

  public start(): void {
    this.httpServer.listen(this.port, () => {
      console.log(`Server is running on http://localhost:${this.port}`);
    });
  }
}

export default ChatServer;
