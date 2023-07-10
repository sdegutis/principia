# Principia

*New first principles for web development*

---

Principia is a small runtime on type of Node.js that allows rapid development in TypeScript, by having hot-reloading built in, generating JavaScript in-memory at each reload from the given TypeScript tree, and running that inside node-vm.

This is all very experimental, so none of it's ready to be distributed via NPM yet. But I've been using it in production for several websites for almost 2 years now.


## Installation

For now, clone this repo, open in VS Code, run with F5, and open localhost:8080 to see the output. Then edit app/main.tsx and refresh the browser.


## Features


### TypeScript runtime exists in memory

Only the /src/ tree needs to be compiled beforehand, both in development and in production. The code under this tree never (rarely) actually changes, and instead the app's code all lives under /app/, which is read by /src/ at runtime, compiled into JavaScript by sucrase, and run in a node vm module.

* Hot-reloading becomes very fast
* Production site doesn't need TypeScript installed
* The disk is spared from constant writes during dev

### JSX support moved to Runtime

Custom TypeScript support allows us to transform JSX into whatever we want. I figured it's most natural and neutral to transform it into `{tag, attrs, children}` and allow it to be further processed at runtime.

* JSX can be written on the backend as naturally as the front-end
* Enables hoisting script/style tags, which supports component encapsulation
* Other pre-processing and examination can be done on a JSX tree

### More flexible importing and pseudoglobals

Another benefit of having a custom runtime is being able to customize the import system and globals like __file and __dir to be much more useful.

* The __file and __dir are FsFile and FsDir instances with practical methods
* Directories can be imported directly and return FsDir instances
* Non-code files can be imported directly and are loaded as FsFile instances


## Example

You can write JSX inside TypeScript server-side:

```typescript
server.httpHandler = makeRequestHandler(input => {
  return {
    body: Buffer.from(renderElement(<>
      <p><b>Hello</b> world</p>
      <p>You visited <u>{input.url}</u></p>
    </>)),
  };
});
```


## Known issues

I haven't yet figured out how to extract common code from /app/ into real NPM modules that can actually be imported properly. It's probably possible, I just haven't done any work towards solving that since I have barely needed it so far.

## License

MIT
