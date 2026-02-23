
import { configForm } from "../../forms/configForm";
import { solids } from "@randajan/props";


export class Qr1up {
    constructor(opt={}) {
        const { fetch, token } = opt;
        solids(this, {
            fetch, token
        })
    }

    formatConfig(input) {
        return configForm.format(input, { isApi:true });
    }

    fetch() {
        
    }
}

console.log((new Qr1up({})).formatConfig({token:"a1d96ed450c56810296517a76a4527f8", ecc:"Q", url:"https://fkdgf"}).issues);


export const qrbFetchSvg = async (content, level = 2, size=100) => {
    try {
        const res = await fetch(`${url}/${token}/qr.svg`, {
            method:"POST",
            body:JSON.stringify({level, content, size}),
            headers:{ "Content-Type": "application/json" },
            redirect:"follow"
        });
        if (res.ok) { return await res.text(); }
    } catch { }
};

export const qrbFetchBuffer = async (content, level = 2, size=100) => {
    const svg = await qrbFetchSvg(content, level, size);
    if (svg) { return Buffer.from(svg, "utf8"); }
}

export const qrbSpayd = ({ iban, currency, amount, vs, ks, ss, msg } = {}) => {
    if (!iban) { throw new Error("Chybí IBAN"); }
    if (!currency) { throw new Error("Chybí měna") };
    if (typeof amount !== "number") { throw new Error("Chybí částka") };

    const acc = String(iban).replace(/\s+/g, "").toUpperCase();
    const cc = String(currency).toUpperCase();
    const am = amount.toFixed(2);
    msg = msg ? String(msg).trim() : undefined;

    const x = {};
    if (vs) { x.vs = String(vs).replace(/\s+/g, "");}
    if (ks) { x.ks = String(ks).replace(/\s+/g, ""); }
    if (ss) { x.ss = String(ss).replace(/\s+/g, ""); }

    return createShortPaymentDescriptor( { acc, cc, am, msg, x }, true);
};