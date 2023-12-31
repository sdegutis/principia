import { makeRequestHandler, startServer } from "./core/http-server";
import { renderElement } from './core/jsx';

let server: ReturnType<typeof startServer> = (persisted['server'] ??= startServer(8080));

server.httpHandler = makeRequestHandler(input => {
  return {
    body: Buffer.from(renderElement(<>
      <p><b>Hello</b> world</p>
      <p>You visited <u>{input.url}</u></p>
    </>)),
  };
});
