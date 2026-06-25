import { readFile } from 'fs/promises';
import { join } from 'path';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import redisCache from '~/server/redis/cache';

// Safely quote a value for use in a bash single-quoted string
const bashQuote = (s: string) => `'${s.replace(/'/g, "'\\''")}'`;

// Safely quote a value for use in a PowerShell single-quoted string
const psQuote = (s: string) => `'${s.replace(/'/g, "''")}'`;

export async function GET(req: NextRequest) {
  const installToken = req.nextUrl.searchParams.get('token');
  const format = req.nextUrl.searchParams.get('format');

  if (installToken) {
    const cacheKey = `install_token:${installToken}`;
    const creds = await redisCache.getCachedData(cacheKey);

    if (!creds) {
      return NextResponse.json(
        { message: 'Invalid or expired install token' },
        { status: 401 },
      );
    }

    if (format === 'bootstrap') {
      // pfSense/FreeBSD one-command installer — pure POSIX sh, no bash/curl/jq required.
      // Serves create-device-freebsd.sh with credentials pre-injected.
      const fbsdPath = join(
        process.cwd(),
        'scripts',
        'create-device-freebsd.sh',
      );
      let fbsd = await readFile(fbsdPath, 'utf-8');
      fbsd = fbsd.replace(/^EMAIL=""$/m, `EMAIL=${bashQuote(creds.email)}`);
      fbsd = fbsd.replace(
        /^PASSWORD=""$/m,
        `PASSWORD=${bashQuote(creds.password)}`,
      );
      fbsd = fbsd.replace(
        /^ROOT_SECRET=""$/m,
        `ROOT_SECRET=${bashQuote(creds.rootSecret)}`,
      );
      fbsd = fbsd.replace(
        /^SCRIPT_TOKEN=""$/m,
        `SCRIPT_TOKEN=${bashQuote(installToken)}`,
      );
      fbsd = fbsd.replace(
        /^STORE_URL=""$/m,
        `STORE_URL=${bashQuote(process.env.STORE_URL ?? '')}`,
      );
      fbsd = fbsd.replace(
        /^REMOTE_ACCESS_URL=""$/m,
        `REMOTE_ACCESS_URL=${bashQuote(process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL ?? '')}`,
      );

      return new NextResponse(fbsd, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'inline; filename="create-device-freebsd.sh"',
          'Cache-Control': 'no-store',
        },
      });
    }

    if (format === 'ps1') {
      const ps1Path = join(process.cwd(), 'scripts', 'create-device.ps1');
      let ps1 = await readFile(ps1Path, 'utf-8');

      ps1 = ps1.replace(
        /^\$Script:Email\s*=\s*""$/m,
        `\$Script:Email      = ${psQuote(creds.email)}`,
      );
      ps1 = ps1.replace(
        /^\$Script:Password\s*=\s*""$/m,
        `\$Script:Password   = ${psQuote(creds.password)}`,
      );
      ps1 = ps1.replace(
        /^\$Script:RootSecret\s*=\s*""$/m,
        `\$Script:RootSecret = ${psQuote(creds.rootSecret)}`,
      );
      ps1 = ps1.replace(
        /^\$Script:ScriptToken\s*=\s*""$/m,
        `\$Script:ScriptToken = ${psQuote(installToken)}`,
      );

      return new NextResponse(ps1, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'inline; filename="create-device.ps1"',
          'Cache-Control': 'no-store',
        },
      });
    }

    const filePath = join(process.cwd(), 'scripts', 'create-device.sh');
    let content = await readFile(filePath, 'utf-8');

    content = content.replace(/^EMAIL=""$/m, `EMAIL=${bashQuote(creds.email)}`);
    content = content.replace(
      /^PASSWORD=""$/m,
      `PASSWORD=${bashQuote(creds.password)}`,
    );
    content = content.replace(
      /^ROOT_SECRET=""$/m,
      `ROOT_SECRET=${bashQuote(creds.rootSecret)}`,
    );
    content = content.replace(
      /^SCRIPT_TOKEN=""$/m,
      `SCRIPT_TOKEN=${bashQuote(installToken)}`,
    );

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'inline; filename="create-device.sh"',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Authenticated path — existing behaviour
  const cookieStore = await cookies();
  const { value: token = null } = cookieStore.get('token') || {};

  if (!token) {
    return NextResponse.json({ message: 'No token found' }, { status: 401 });
  }

  const filePath = join(process.cwd(), 'scripts', 'create-device.sh');
  const content = await readFile(filePath);

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'inline; filename="create-device.sh"',
    },
  });
}
