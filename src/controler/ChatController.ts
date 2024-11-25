import { Socket , Server as SocketIOServer } from 'socket.io';


class ChatController {
  private static readonly users: Map<string, { username: string; socket: Socket }> = new Map();

  public static handleUserJoin(socket: Socket, username: string, io: SocketIOServer): void {
    this.users.set(socket.id, { username, socket });
    console.log(`${username} joined the chat.`);
    io.emit('message', { type: 'system', content: `${username} joined the chat.` });
  }

  public static handleChatMessage(socket: Socket, message: string, io: SocketIOServer): void {
    const sender = this.users.get(socket.id)?.username;
    if (sender) {
      console.log(`${sender}: ${message}`);
      io.emit('message', { type: 'chat', username: sender, content: message }); // Broadcast to all
    } else {
      socket.emit('error', { message: 'User not identified.' });
    }
  }

  public static  handlePrivateMessage(socket: Socket, recipientUsername: string, message: string): void {
    const sender = this.users.get(socket.id)?.username;
    if (!sender) {
      socket.emit('error', { message: 'You must be identified to send messages.' });
      return;
    }

    const recipient = Array.from(this.users.values()).find(user => user.username === recipientUsername);
    if (!recipient) {
      socket.emit('error', { message: `User ${recipientUsername} not found.` });
      return;
    }

    recipient.socket.emit('message', { type: 'private', username: sender, content: message });
  }

  public static handleDisconnect(socket: Socket, io: SocketIOServer): void {
    const username = this.users.get(socket.id)?.username;
    if (username) {
      console.log(`${username} left the chat.`);
      this.users.delete(socket.id);
      io.emit('message', { type: 'system', content: `${username} left the chat.` });
    }
  }
}

export default ChatController;
