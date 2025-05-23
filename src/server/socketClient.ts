import { Socket, io } from 'socket.io-client';

const {
  ROOM = 'portal-template',
  SOCKET_URL = 'http://pubsub.events.dnamicro.net',
  SOCKET_USERNAME = 'admin@dnamicro.com',
  SOCKET_PASSWORD = 'ch@ng3m3Pl3@s3!!',
  NEXT_PUBLIC_SOCKET_URL,
} = process.env;

class SocketClient {
  public socket: Socket<any, any> | null = null;
  public token = '';
  public reconnectionAttempts = 5;

  constructor() {
    if (!SOCKET_URL) {
      console.info('SOCKET_URL is not set');
      return;
    }
    console.info('🚀 ~ NEXT_SOCKET_URL:', NEXT_PUBLIC_SOCKET_URL);
    console.info(`Connecting to socket at: ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
    });

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.socket?.on('connect', this.onConnect.bind(this));
    this.socket?.on('disconnect', this.onDisconnect.bind(this));
    this.socket?.on('connect_error', (error) => {
      console.info('Connection error:', error);
    });
    this.socket?.on('MESSAGE', this.onMessage.bind(this));
    this.socket?.on('AUTHENTICATED', this.onAuthenticated.bind(this));
  }

  private onAuthenticated(token: string) {
    this.token = token;
    this.joinRoom();
  }

  private joinRoom() {
    this.socket?.emit(
      'JOIN_ROOM',
      {
        type: 'JOIN_ROOM',
        token: this.token,
        payload: { room: ROOM },
      },
      (...args: any) => {
        console.info(`@JOIN_ROOM: ${ROOM}`);
        console.info('@Callback', args);
      },
    );
  }

  public onDisconnect() {
    console.info('Socket disconnected');
    setTimeout(() => {
      if (!this.socket?.connected && this.reconnectionAttempts > 0) {
        console.info('Attempting to reconnect...');
        this.socket?.connect();
        this.reconnectionAttempts--;
      } else {
        console.info('Reconnection attempts exceeded');
      }
    }, 100);
  }

  private onConnect() {
    console.info('Socket connected');
    this.authenticate();
  }

  private authenticate() {
    this.socket?.emit('AUTHENTICATE', SOCKET_USERNAME, SOCKET_PASSWORD);
  }

  private onMessage(args: Record<string, any>) {
    console.info('Received message:', args);
  }

  public publish({ payload, type }: { type: string; payload?: unknown }) {
    if (!this.socket?.connected) {
      console.info('Socket not connected');
      this.socket?.connect();
      return;
    }

    this.socket?.emit(
      'PUBLISH',
      {
        type,
        token: this.token,
        room_name: ROOM,
        payload,
      },
      (...args: any) => {
        console.info('@Callback', args);
      },
    );
  }
}

const client = new SocketClient();

export default client;
