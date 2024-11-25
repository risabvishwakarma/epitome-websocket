import * as WebSocket from 'ws';
import { IncomingMessage, Server } from 'http';
import { parse } from 'url'; // To parse URL and query parameters
import * as jwt from 'jsonwebtoken'; // Import JWT library
import { JwtMiddleware } from '../middleware/JwtMiddleware';

const JWT_SECRET = 'your-secret-key'; // Replace with your actual secret key

export class WebsocketServer {
    private readonly httpServer: Server;
    private readonly wss: WebSocket.Server;
    private readonly clients: Set<WebSocket> = new Set();

    constructor(private readonly port: number) {
        this.httpServer = new Server();
        this.wss = new WebSocket.Server({
            server: this.httpServer,
            handleProtocols: this.handleProtocols,
            // Using `verifyClient` as a middleware to verify JWT token
           // verifyClient: new JwtMiddleware().verifyJWTToken,
        });

        // Setup WebSocket event handlers
        this.setupWebSocketHandlers();

        // Send the "Hello, are you awake?" message to all clients every 5 seconds
        // setInterval(() => this.sendHelloToAllClients(), 5000);
    }

    private setupWebSocketHandlers() {
        // Event: New client connection
        this.wss.on('connection', (ws: WebSocket, req: any) => {
            // Extract `uid` from the URL query parameters
            const parsedUrl = parse(req.url, true); // parse the URL
            const uid = parsedUrl.query.uid;
            console.log(`New client connected. UID: ${uid}`);

            // Store the `uid` in the WebSocket object or in a separate map (optional)
            (ws as any).uid = uid;

            this.clients.add(ws);

            // Event: Message received from client
            ws.on('message', (message: string) => {
                try {
                    const parsedMessage = JSON.parse(message);
                    console.log('Received JSON message:', parsedMessage);

                    // Process the message based on its type
                    if (parsedMessage.type === 'chat') {
                        this.handleChatMessage(ws, parsedMessage);
                    } else {
                        ws.send(JSON.stringify({ error: 'Unknown message type' }));
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    ws.send(JSON.stringify({ error: 'Invalid JSON message' }));
                }
            });

            // Event: Client disconnects
            ws.on('close', () => {
                console.log(`Client with UID ${uid} disconnected.`);
                this.clients.delete(ws);
            });

            // Event: Error
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Send a welcome message to the newly connected client
            const welcomeMessage = { type: 'chat', content: 'Welcome to the WebSocket server!' };
            ws.send(JSON.stringify(welcomeMessage));
        });
    }

    private handleChatMessage(ws: WebSocket, message: any) {
        // Handle the chat message
        const chatResponse = {
            type: 'chat',
            content: `You said: ${message.content}`,
            timestamp: new Date().toISOString()
        };
        ws.send(JSON.stringify(chatResponse));
    }

    private sendHelloToAllClients() {
        // Construct the message to be sent
        const message = {
            type: 'chat',
            content: 'Hello, are you awake?',
            timestamp: new Date().toISOString()
        };

        // Send the message to all clients
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    public start() {
        this.httpServer.listen(this.port, () => {
            console.log(`WebSocket server is running on ws://localhost:${this.port}`);
        });
    }

    // Correct the type of protocols to Set<string>
    private handleProtocols(protocols: Set<string>, req: IncomingMessage): string | false {
        // Convert the Set to an array and handle protocol negotiation
        const protocolArray = Array.from(protocols); // Convert Set to Array
        console.log('Available protocols:', protocolArray);

        if (protocolArray.includes('chat-protocol')) {
            return 'chat-protocol'; // Accept chat-protocol
        } else if (protocolArray.includes('notification-protocol')) {
            return 'notification-protocol'; // Accept notification-protocol
        } else {
            return false; // Reject connection if no matching protocol
        }
    }

}
