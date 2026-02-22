
import { _privs } from "../vault";
import { configForm } from "../../forms/configForm";

console.log(configForm.format({}));


export class Qr1up {
    constructor(opt={}) {
        _privs.set(this, opt)
    }

    fetch() {
        
    }
}


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