declare module 'node:fs' {
  const fs: any;
  export = fs;
}

declare module 'node:path' {
  const path: any;
  export = path;
}

declare module 'node:zlib' {
  export function deflateRawSync(input: any): any;
}

declare module 'node:test' {
  const test: any;
  export default test;
}

declare module 'node:assert/strict' {
  const assert: any;
  export default assert;
}

declare const process: any;

type Buffer = any;
declare const Buffer: any;
