import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import redisCache from '~/server/redis/cache';
import { buildInstallBase } from '../_url';

const TOKEN_TTL_SECONDS = parseInt(
  process.env.INSTALL_TOKEN_TTL_SECONDS ?? '7200',
  10,
);

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

  const installBase = buildInstallBase(req);
  if (!installBase) {
    return NextResponse.json({ message: 'Invalid host' }, { status: 400 });
  }
  const base = `${installBase}/api/scripts/create-device?token=${installToken}`;
  const url = base;
  const windowsUrl = `${base}&format=ps1`;
  const freebsdUrl = `${base}&format=bootstrap`;

  return NextResponse.json({
    token: installToken,
    url,
    windowsUrl,
    freebsdUrl,
    expiresIn: TOKEN_TTL_SECONDS,
  });
}
