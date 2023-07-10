import * as http from "http";
import internal, { pipeline, Readable } from 'stream';
import { createGzip } from 'zlib';

export interface RouteInput {
  method: Uppercase<string>;
  url: URL;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
  cookies: Record<string, string>,
}

export interface RouteOutput {
  status?: number;
  headers?: http.OutgoingHttpHeaders;
  body?: Buffer;
}

export type RouteHandler = (input: RouteInput) => RouteOutput | Promise<RouteOutput>;

export const baseUrl = process.env['BASE_URL']!;

export function makeAbsoluteUrl(relativeUrl: string) {
  return new URL(relativeUrl, baseUrl).toString();
}

export function startServer(port: number) {
  const handlers = {
    httpHandler: (req: http.IncomingMessage, res: http.ServerResponse) => { res.end(); },
    wsHandler: (req: http.IncomingMessage, socket: internal.Duplex, head: Buffer) => { },
  };

  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    handlers.httpHandler(req, res);
  });

  server.on('upgrade', (req, socket, head) => {
    handlers.wsHandler(req, socket, head);
  });

  server.listen(port);
  console.log(`Running on http://localhost:${port}`);

  return handlers;
}

export function makeRequestHandler(handler: RouteHandler): http.RequestListener {
  return ((req: http.IncomingMessage, res: http.ServerResponse) => {
    let chunks: Buffer[] = [];
    req.on('data', (data: Buffer) => chunks.push(data));
    req.on('end', async () => {
      const input: RouteInput = {
        url: new URL(req.url ?? '', baseUrl),
        body: Buffer.concat(chunks),
        method: req.method as Uppercase<string>,
        headers: req.headers,
        cookies: Object.fromEntries(
          (req.headers.cookie ?? '')
            .split(';')
            .filter(s => s)
            .map(s => s.trim().split('='))),
      };

      const output = await handler(input);
      const outBody = output.body ?? '';

      res.statusCode = output.status ?? 200;
      for (const [k, v] of Object.entries(output.headers ?? {})) {
        if (typeof v === 'string') {
          res.setHeader(k, v);
        }
      }

      if (input.headers['accept-encoding']?.includes('gzip')) {
        res.setHeader('content-encoding', 'gzip');
        const inStream = Readable.from([outBody]);
        const gzip = createGzip();
        pipeline(inStream, gzip, res, (err) => {
          res.end();
          inStream.destroy();
        });
      }
      else {
        res.end(outBody);
      }
    });
  });
}
