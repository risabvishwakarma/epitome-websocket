import { Application } from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import JwtMiddlewareV2 from '../middleware/JwtMiddlewareV2';
import ChatController from '../controler/ChatController';

class ChatRoutes {
  constructor(private readonly app: Application, private readonly io: SocketIOServer) {
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  private setupRoutes(): void {
    // HTTP route for testing
    this.app.get('/', (req, res) => {
      res.send('Chat Server is Running!');
    });

    // Protected route (requires JWT)
    this.app.get('/protected', JwtMiddlewareV2.verifyToken, (req, res) => {
      res.json({ message: 'This is a protected route', user: (req as any).user });
    });
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`User connected: ${socket.id}`);
      // Handle user joining
      socket.on('join', (username: string) => {
        ChatController.handleUserJoin(socket, username, this.io);
      });

      // Handle chat messages
      socket.on('chat', (message: string) => {
        console.log("brodcast message route")
        ChatController.handleChatMessage(socket, message, this.io);
      });

      socket.on('private-message', ({ recipient, message }: { recipient: string; message: string }) => {
        console.log("private- message")
        ChatController.handlePrivateMessage(socket, recipient, message);
      });
      

      // Handle user disconnect
      socket.on('disconnect', () => {
        ChatController.handleDisconnect(socket, this.io);
      });
    });
  }
}

export default ChatRoutes;
