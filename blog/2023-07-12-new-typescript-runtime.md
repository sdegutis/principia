# New TypeScript runtime

In one sense, principia isn't a new runtime. It runs on top of Node.js's own runtime, and that's all it does.

But practically, it's an entirely new runtime. Some evidence is the fact that I can use `__file` and `__dir` and get these types:

```typescript
class FsDir extends FsNode {
    children: (FsFile | FsDir)[];
    get root(): FsDir;
    get files(): FsFile[];
    get dirs(): FsDir[];
    get childrenByName(): { [k: string]: FsDir | FsFile };
    get filesByName(): { [k: string]: FsFile };
    get dirsByName(): { [k: string]: FsDir };
    createFile(name: string, buffer: Buffer): FsFile;
    find(toPath: string): FsDir | FsFile | null;
}

class FsFile extends FsNode {
    parent: FsDir;
    buffer: Buffer;
    transformedJs?: string; // useful for writing client-side js in ts
    replace(newBuffer: Buffer): void;
    get root(): FsDir;
    get text(): string;
}

declare class FsNode {
    name: string;
    parent: FsDir | null;
    get path(): string;
    get realPath(): string;
    rename(newName: string): void;
    isFile(): this is FsFile;
    isDir(): this is FsDir;
}
```

So how does it work?

It's really simple:

* Read a file tree using `node:fs`
* Compile any TypeScript files to JavaScript via `sucrase` (it's lightning quick)
* Run these in a virtual module via `node:vm`

That's it.

Some more benefits (besides `__file` and `__dir`):

* Your TypeScript code can be debugged via VS Code like normal
* You can import dirs and non-code files directly with `import`
* Hot-reloading is cleanly built-in (with `persisted` global object)
* Prod site doesn't need TypeScript installed since it compiles at runtime
* Prod site's hot-reloading works exactly the same as at dev time

This effectively allows me to write very fast websites very quickly. It can load thousands of static files (markdown, images, etc) and rebuild a website site nearly instantaneously. I haven't measured, but it's definitely well under a second, almost zero seconds.
