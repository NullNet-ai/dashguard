import { io } from 'socket.io-client';

const {
  ROOM = 'portal-template',
  SOCKET_URL = 'pubsub.events.dnamicro.net',
  SOCKET_USERNAME = 'admin@dnamicro.com',
  SOCKET_PASSWORD = 'ch@ng3m3Pl3@s3!!',
} = process.env;

class SocketClient {
  public socket;
  private token = '';

  constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('MESSAGE', this.onMessage.bind(this));
    this.socket.on('AUTHENTICATED', this.onAuthenticated.bind(this));
  }

  private onAuthenticated(token: string) {
    this.token = token;
    this.joinRoom();
  }

  private joinRoom() {
    this.socket.emit(
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
  }

  private onConnect() {
    console.info('Socket connected');
    this.authenticate();
  }

  private authenticate() {
    this.socket.emit('AUTHENTICATE', SOCKET_USERNAME, SOCKET_PASSWORD);
  }

  private onMessage(args: Record<string, any>) {
    console.info('Received message:', args);
  }

  public publish({ payload, type }: { payload: unknown; type: string }) {
    if (!this.socket.connected) {
      console.info('Socket not connected');
      this.socket.connect();
      return;
    }

    this.socket.emit(
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

  public addEventListener(
    eventName: string,
    callback: (...args: any[]) => void,
  ) {
    if (!this.socket.connected) {
      this.socket.connect();
    }

    if (eventName === '*') {
      this.socket.onAny((...args) => {
        console.info(`Event received: ${args[0]}`, args.slice(1));
        callback(...args);
      });
    } else {
      this.socket.on(eventName, (...args) => {
        console.info(`Event ${eventName} received:`, args);
        callback(...args);
      });
    }
  }
}

const client = new SocketClient();

export default client;
