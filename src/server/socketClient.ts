import 'dotenv/config';
import { Socket, io } from 'socket.io-client';
import { decryptCredentials } from '~/utils/socketAuth';
import { handleEvent } from './events';

class SocketClient {
  public socket: Socket<any, any> | null = null;
  public token = '';
  public reconnectionAttempts = 5;
  private socketConfig: {
    url: string;
    room: string;
    username: string;
    password: string;
  } | null = null;
  private router: any;

  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      // Fetch socket credentials from secure API
      const response = await fetch('/api/socket/socket-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get socket credentials');
      }

      const config = await response.json();

      if (config?.socketUrl) {
        // Decrypt credentials on client side
        const { username, password } = decryptCredentials(config.credentials);

        this.socketConfig = {
          url: config.socketUrl,
          room: config.room,
          username,
          password,
        };
        this.connect();
      }
    } catch (error) {
      console.error('Socket initialization failed:', error);
    }
  }
  private connect() {
    if (!this.socketConfig) {
      console.error('Socket config not available');
      return;
    }

    console.debug(`Connecting to socket at: ${this.socketConfig.url}`);

    this.socket = io(this.socketConfig.url, {
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
        payload: { room: this.socketConfig?.room },
      },
      (...args: any) => {
        console.info(`@JOIN_ROOM: ${this.socketConfig?.room}`);
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
    this.socket?.emit(
      'AUTHENTICATE',
      this.socketConfig?.username,
      this.socketConfig?.password,
    );
  }

  private async handleEventAction(event: any) {
    const response = await handleEvent(event?.type, event?.payload);
    console.debug('🚀 ~ handleEventAction ~ response:', response);
    if (response?.redirectTo) {
      this.router.push(response.redirectTo);
    }
  }

  private onMessage(args: Record<string, any>) {
    console.debug('Received message:', args);
    this.handleEventAction(args);
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
        room_name: this.socketConfig?.room,
        payload,
      },
      (...args: any) => {
        console.info('@Callback', args);
      },
    );
  }
  public setRouter(router: any) {
    this.router = router;
  }
}

const client = new SocketClient();

export default client;
