# Server-side JSX

A big motivation for writing Principia is that I wanted to write a server-side Node.js app, but didn't want to have to deal with either traditional template languages, or excessively complicated React setups (or even have to use React).

To me, writing JSX felt like a natural way to express intended HTML, and Node.js & JavaScript already provided almost all of what a template language needed, from expressions to function calls, from reusable components to imports.

So Principia was designed to natively support allowing JSX on the backend. At runtime, it just translates a JSX expression to a function call of `(tag: string, attrs: Record<string, any>, children: any[])`.

Here's a very basic hello world app in Principia. Note: none of the functions imported from `./core` are strictly necessary for Principia, those are just there as a demo or a baseline server, extracted from what I use on 3-4 personal websites that are built on top of Principia.

```typescript
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
```
