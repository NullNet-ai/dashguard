import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import redisCache from '~/server/redis/cache';
import { dnaClient } from '~/server/dnaOrm';
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

  const { ROOT_ACCOUNT_PASSWORD: rootSecret = '' } = process.env;

  if (!rootSecret) {
    return NextResponse.json(
      { message: 'Install credentials not configured on server' },
      { status: 500 },
    );
  }

  // Verify user token and check remaining lifetime
  const tokenData = await dnaClient
    .verifyToken(userToken)
    .execute()
    .then((res) => res.data?.[0])
    .catch(() => null);

  if (!tokenData) {
    return NextResponse.json(
      { message: 'Invalid user token' },
      { status: 401 },
    );
  }

  const expiresAt = tokenData.exp * 1000; // exp is in seconds, convert to ms
  const now = Date.now();
  const remainingMs = expiresAt - now;
  const installWindowMs = TOKEN_TTL_SECONDS * 1000;

  if (remainingMs < installWindowMs) {
    const remainingMins = Math.ceil(remainingMs / 60000);
    return NextResponse.json(
      {
        message: `Your login session expires in ${remainingMins}m, which is shorter than the ${TOKEN_TTL_SECONDS / 3600}h install window. Please log out and log back in, then regenerate the install command.`,
      },
      { status: 409 },
    );
  }

  const installToken = randomBytes(32).toString('hex');
  await redisCache.cacheData(
    `install_token:${installToken}`,
    { userToken, rootSecret },
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
