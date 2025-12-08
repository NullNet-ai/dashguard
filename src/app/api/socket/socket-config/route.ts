import { NextRequest, NextResponse } from 'next/server';
import { encryptCredentials } from '~/utils/socketAuth';

const {
  ROOM = 'portal-template',
  SOCKET_URL = 'http://pubsub.events.dnamicro.net',
  SOCKET_USERNAME = '',
  SOCKET_PASSWORD = '',
} = process.env;

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      socketUrl: SOCKET_URL,
      room: ROOM,
      credentials: encryptCredentials(SOCKET_USERNAME, SOCKET_PASSWORD),
    });
  } catch (error) {
    console.error('Socket config error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}