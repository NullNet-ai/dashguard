import "dotenv/config";
import { Socket, io } from 'socket.io-client';

const {
  ROOM = 'portal-template',
  SOCKET_URL =  'http://pubsub.events.dnamicro.net',
  SOCKET_USERNAME = '',
  SOCKET_PASSWORD = '',
  NEXT_PUBLIC_ROOM = '',
  NEXT_PUBLIC_SOCKET_URL = '',
  NEXT_PUBLIC_SOCKET_USERNAME = '',
  NEXT_PUBLIC_SOCKET_PASSWORD = '',
} = process.env;

const _SOCKET_URL = NEXT_PUBLIC_SOCKET_URL || SOCKET_URL;
const _SOCKET_USERNAME = NEXT_PUBLIC_SOCKET_USERNAME || SOCKET_USERNAME;
const _SOCKET_PASSWORD = NEXT_PUBLIC_SOCKET_PASSWORD || SOCKET_PASSWORD;
const _ROOM = NEXT_PUBLIC_ROOM || ROOM;

class SocketClient {
  public socket: Socket<any, any> | null = null;
  public token = '';
  public reconnectionAttempts = 5;

  constructor() {
    if (!_SOCKET_URL) {
      console.debug('SOCKET_URL is not set');
      return;
    }
    console.debug(`Connecting to socket at: ${_SOCKET_URL}`);

    this.socket = io(_SOCKET_URL, {
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
        payload: { room: _ROOM },
      },
      (...args: any) => {
        console.info(`@JOIN_ROOM: ${_ROOM}`);
        console.info('@Callback', args);
      },
    );
  }

  public onDisconnect() {
    console.debug('Socket disconnected');
    setTimeout(() => {
      if (!this.socket?.connected && this.reconnectionAttempts > 0) {
        console.debug('Attempting to reconnect...');
        this.socket?.connect();
        this.reconnectionAttempts--;
      } else {
        console.debug('Reconnection attempts exceeded');
      }
    }, 100);
  }

  private onConnect() {
    console.info('Socket connected');
    this.authenticate();
  }

  private authenticate() {
    this.socket?.emit('AUTHENTICATE', _SOCKET_USERNAME, _SOCKET_PASSWORD);
  }

  private onMessage(args: Record<string, any>) {
    console.info('Received message:', args);
  }

  public publish({ payload, type }: { type: string; payload?: unknown }) {
    if (!this.socket?.connected) {
      console.debug('Socket not connected');
      this.socket?.connect();
      return;
    }

    this.socket?.emit(
      'PUBLISH',
      {
        type,
        token: this.token,
        room_name: _ROOM,
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
