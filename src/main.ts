import chokidar from 'chokidar';
import 'dotenv/config';
import * as path from 'path';
import 'source-map-support/register';
import { App } from './site';

addTimestampToConsoleMethods();

const site = new App('app');
onFsChanges('app', 100, (path) => site.fileChanged(path));

function onFsChanges(fromPath: string, msTimeout: number, fn: (path: string) => void) {
  let timeout: NodeJS.Timeout | null = null;
  chokidar.watch(fromPath, { ignoreInitial: true }).on('all', (e, p) => {
    const updatedPath = p.split(path.win32.sep).join(path.posix.sep);
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(updatedPath), msTimeout);
  });
}

function addTimestampToConsoleMethods() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: '2-digit',
    year: 'numeric',
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h12',
    fractionalSecondDigits: 3,
  } as Intl.DateTimeFormatOptions & { fractionalSecondDigits?: 0 | 1 | 2 | 3 });

  for (const key of ['log', 'error'] as const) {
    const realFn = console[key];
    console[key] = (...args: any) => {
      realFn(formatter.format(), '-', ...args);
    };
  }
}
