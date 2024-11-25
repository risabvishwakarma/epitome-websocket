import ChatServer from "./server/ChatServer";
import { WebsocketServer } from "./server/Websocket";


// Get the port from the environment variable or default to 8080
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

// Create and start the server
// const server = new WebsocketServer(PORT);

const server = new ChatServer(PORT)
server.start();
