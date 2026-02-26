import { info } from "@randajan/simple-lib/info";

const _detected = new Set();

export const checkVersion = (url, version)=>{
    if (version.startsWith("^")) { version = version.slice(1); }
    if (version === info.version) { return; }
    if (_detected.has(url)) { return; }
    _detected.add(url);
    console.warn(`Version of @randajan/1up-api mismatched ${info.version}(local) vs. ${version}(remote) at '${url}'`);
}