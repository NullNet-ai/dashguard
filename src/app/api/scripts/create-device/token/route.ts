import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import redisCache from '~/server/redis/cache';

const TOKEN_TTL_SECONDS = 3600; // 1 hour

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const { value: userToken = null } = cookieStore.get('token') || {};

  if (!userToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const {
    SCHEDULE_USERNAME: email = '',
    SCHEDULE_PASSWORD: password = '',
    ROOT_ACCOUNT_PASSWORD: rootSecret = '',
  } = process.env;

  if (!email || !password || !rootSecret) {
    return NextResponse.json(
      { message: 'Install credentials not configured on server' },
      { status: 500 },
    );
  }

  const installToken = randomBytes(32).toString('hex');
  await redisCache.cacheData(
    `install_token:${installToken}`,
    { email, password, rootSecret },
    TOKEN_TTL_SECONDS,
  );

  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? '';
  const base = `${proto}://${host}/api/scripts/create-device?token=${installToken}`;
  const url = base;
  const windowsUrl = `${base}&format=ps1`;

  return NextResponse.json({ url, windowsUrl, expiresIn: TOKEN_TTL_SECONDS });
}
