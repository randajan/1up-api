# @randajan/1up-api

Lightweight JavaScript client for the 1up.cz API used to generate styled QR codes.

## Installation

```bash
npm install @randajan/1up-api
```

## Import

ESM:

```js
import Qr1up from "@randajan/1up-api";
// or:
// import { Qr1up } from "@randajan/1up-api";
```

CommonJS:

```js
const { Qr1up } = require("@randajan/1up-api");
```

## Quick Example

```js
import { Qr1up } from "@randajan/1up-api";
import fetch from "node-fetch";

const qr = new Qr1up({
  fetch,
  token: "YOUR_1UP_TOKEN"
});

// Every method returns a response object.
// It contains `issues` and may contain `body` and `error`.
const response = await qr.svg(
  {
    contentType: "url",
    url: "https://1up.cz"
  },
  false // throwError = false, so errors are returned in response.error
);

if (response.error) {
  console.error(response.error.message);
} else {
  console.log(response.issues); // parsed validation/API issues
  console.log(response.body);   // SVG text
}
```

## Qr1up

### `new Qr1up(options)`

Constructor options:

- `fetch` (`function`, required): Fetch implementation (`globalThis.fetch`, `node-fetch`, ...).
- `token` (`string`, required): API token.
- `rootUrl` (`string`, optional): Defaults to `https://1up.cz/api/qr/gen`.
- `filename` (`string`, optional): Defaults to `qr`.
- `defaults` (`object`, optional): Default request payload merged into every call.

`defaults` are merged as `{...defaults, ...input}`. Values from `input` win.

### Methods

- `svg(input = {}, throwError = true)`
- `png(input = {}, throwError = true)`
- `svgBuffer(input = {}, throwError = true)`
- `pngBuffer(input = {}, throwError = true)`

Shared method arguments:

- `input` (`object`): QR configuration and content fields based on `contentType`.
- `throwError` (`boolean`):
  - `true`: network/API failures throw `Error`
  - `false`: failures are returned as `response.error`

### Response Object

All methods resolve to a response object with this shape:

```ts
type QrResponse = {
  issues?: Array<any>;
  body?: string | Buffer;
  error?: Error;
};
```

Notes:

- `issues` contains validation and API header issues (`x-qr-issues-*`).
- `body` is `string` for `svg` and `png`, `Buffer` for `svgBuffer` and `pngBuffer`.
- If request/processing fails and `throwError = false`, `error` is present.

## License

MIT
