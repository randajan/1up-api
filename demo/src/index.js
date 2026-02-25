
import { info, log } from "@randajan/simple-lib/node";
import { Qr1up } from "../../dist/esm/index.mjs";
import fetch from "node-fetch";

const qrApi = new Qr1up({
    token:"a1d96ed450c56810296517a76a4527f8",
    fetch,
});

(async _=>{
    const resp = await qrApi.svg({ contentType:"wifi", ssid:"itcan", password:"731732737" });
    console.log(resp);
})()