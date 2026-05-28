'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Matches server-side typo for right mouse button
const BUTTON_MAP: Record<number, string> = {
  0: 'left',
  1: 'middle',
  2: 'rigth',
};

const SPECIAL_KEYS = new Set([
  'backspace',
  'control',
  'meta',
  'alt',
  'tab',
  'capslock',
  'shift',
  'escape',
  'delete',
  'enter',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'pageup',
  'pagedown',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
]);

function normaliseKey(key: string): string {
  const lower = key.toLowerCase();
  return SPECIAL_KEYS.has(lower) ? lower : key;
}

function parseFrame(
  buf: ArrayBuffer,
): { ms: bigint; payload: Uint8Array } | null {
  if (buf.byteLength < 20) return null;
  const v = new DataView(buf);
  const lo = v.getBigUint64(0, true);
  const hi = v.getBigUint64(8, true);
  const ms = lo | (hi << 64n);
  const len = v.getUint32(16, true);
  if (buf.byteLength < 20 + len) return null;
  return { ms, payload: new Uint8Array(buf, 20, len) };
}

function scanNALs(
  payload: Uint8Array,
): Array<{ type: number; data: Uint8Array }> {
  const nals: Array<{ type: number; data: Uint8Array }> = [];
  let i = 0;
  const startOf = (pos: number) =>
    payload[pos] === 0 &&
    payload[pos + 1] === 0 &&
    payload[pos + 2] === 0 &&
    payload[pos + 3] === 1;
  while (i < payload.length - 4) {
    if (startOf(i)) {
      let end = payload.length;
      for (let j = i + 4; j < payload.length - 3; j++) {
        if (startOf(j)) {
          end = j;
          break;
        }
      }
      const nalData = payload.slice(i + 4, end);
      nals.push({ type: nalData[0]! & 0x1f, data: nalData });
      i = end;
    } else {
      i++;
    }
  }
  return nals;
}

function isKeyFrame(payload: Uint8Array): boolean {
  return scanNALs(payload).some((n) => n.type === 5);
}

function extractCodecString(payload: Uint8Array): string {
  const sps = scanNALs(payload).find((n) => n.type === 7);
  if (!sps || sps.data.length < 4) return 'avc1.420034';
  const p = sps.data[1]!.toString(16).padStart(2, '0');
  const c = sps.data[2]!.toString(16).padStart(2, '0');
  const l = sps.data[3]!.toString(16).padStart(2, '0');
  return `avc1.${p}${c}${l}`;
}

export default function RDClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const decoderRef = useRef<VideoDecoder | null>(null);
  const decoderReadyRef = useRef(false);
  const firstFrameRef = useRef(true);
  const [connecting, setConnecting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const destroyDecoder = useCallback(() => {
    if (decoderRef.current) {
      try {
        decoderRef.current.close();
      } catch {
        /* ignore */
      }
      decoderRef.current = null;
    }
    decoderReadyRef.current = false;
    setShowOverlay(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const ensureDecoder = useCallback((codecStr: string) => {
    if (decoderRef.current) {
      try {
        decoderRef.current.close();
      } catch {
        /* ignore */
      }
      decoderRef.current = null;
    }
    if (!('VideoDecoder' in window)) return;
    try {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      decoderRef.current = new VideoDecoder({
        output(frame) {
          if (firstFrameRef.current) {
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
            firstFrameRef.current = false;
            setShowOverlay(false);
          }
          ctx.drawImage(frame, 0, 0);
          frame.close();
        },
        error() {
          decoderReadyRef.current = false;
        },
      });
      decoderRef.current.configure({
        codec: codecStr,
        optimizeForLatency: true,
      });
      decoderReadyRef.current = true;
    } catch {
      decoderRef.current = null;
      decoderReadyRef.current = false;
    }
  }, []);

  useEffect(() => {
    const sessionKey = localStorage.getItem('current_terminal_session');
    const wsUrl = sessionKey ? localStorage.getItem(sessionKey) : null;
    if (!wsUrl) return;

    firstFrameRef.current = true;
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;
    setConnecting(true);

    ws.onopen = () => setConnecting(false);

    ws.onclose = () => {
      setConnecting(false);
      destroyDecoder();
    };

    ws.onmessage = (e: MessageEvent) => {
      if (typeof e.data === 'string') return;
      const frame = parseFrame(e.data as ArrayBuffer);
      if (!frame) return;
      const kf = isKeyFrame(frame.payload);
      if (!decoderReadyRef.current && kf && 'VideoDecoder' in window) {
        ensureDecoder(extractCodecString(frame.payload));
      }
      if (decoderRef.current && decoderReadyRef.current) {
        try {
          decoderRef.current.decode(
            new EncodedVideoChunk({
              type: kf ? 'key' : 'delta',
              timestamp: Number(frame.ms) * 1000,
              data: frame.payload,
            }),
          );
        } catch {
          /* ignore decode errors */
        }
      }
    };

    return () => {
      ws.close();
      destroyDecoder();
    };
  }, [destroyDecoder, ensureDecoder]);

  const canvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.round(((e.clientX - r.left) * canvas.width) / r.width),
      y: Math.round(((e.clientY - r.top) * canvas.height) / r.height),
    };
  }, []);

  const wsSend = useCallback((msg: object) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const { x, y } = canvasCoords(e);
      ws.send(
        JSON.stringify({
          message_type: 'mousemove',
          button: BUTTON_MAP[e.buttons] ?? 'left',
          x,
          y,
        }),
      );
    },
    [canvasCoords],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      canvasRef.current?.focus();
      const { x, y } = canvasCoords(e);
      wsSend({
        message_type: 'mousedown',
        button: BUTTON_MAP[e.button] ?? 'left',
        x,
        y,
      });
    },
    [canvasCoords, wsSend],
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = canvasCoords(e);
      wsSend({
        message_type: 'mouseup',
        button: BUTTON_MAP[e.button] ?? 'left',
        x,
        y,
      });
    },
    [canvasCoords, wsSend],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      wsSend({
        message_type: 'keydown',
        key: normaliseKey(e.key),
        code: e.code,
      });
    },
    [wsSend],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      wsSend({ message_type: 'keyup', key: normaliseKey(e.key), code: e.code });
    },
    [wsSend],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLCanvasElement>) => {
      const text = e.clipboardData?.getData('text');
      if (text) wsSend({ message_type: 'clipboard', content: text });
      e.preventDefault();
    },
    [wsSend],
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        tabIndex={0}
        className="absolute left-1/2 top-1/2 block max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 cursor-crosshair outline-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
      />

      {showOverlay && !connecting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          No stream — connect to a tunnel
        </div>
      )}
    </div>
  );
}
