
import { configForm } from "../../forms/configForm";
import { _privs } from "../vault";
import { apiForm } from "../../forms/apiForm";
import { issuesDeserialize } from "../../reforms";

export class Qr1up {
    constructor({
        fetch,
        token,
        rootUrl,
        filename,
        defaults={}
    }={}) {
        const af = apiForm.format({ fetch, rootUrl, token, filename, defaults }, { issueTreshold:1 });
        _privs.set(this, af.result);
    }

    _format(input) {
        return configForm.format(input, { isApi:true });
    }

    async _fetch(mimeType, input={}, returnBuffer=false, throwError=true) {
        const { fetch, rootUrl, token, filename, defaults } = _privs.get(this);
        input = {...defaults, ...input};
        const cfg = this._format(input);

        //preflight check
        if (cfg.issues.maxLevel > 1) {
            const { issues } = cfg;
            return { issues };
        }


        try {
            const res = await fetch(`${rootUrl}/${token}/${filename}.${mimeType}`, {
                method:"POST",
                body:JSON.stringify(input),
                headers:{ "Content-Type": "application/json" },
                redirect:"follow"
            });

            const { status } = res;
            const body = status == 404 ? "Not found" : await res.text();

            if (!res.ok) {
                throw new Error(`API ${body || "fetch failed"} (${res.status})`);
            }

            const issues = issuesDeserialize("x-qr-issues-", Object.fromEntries(res.headers.entries()));
            if (issues.maxLevel > 1) { return { issues }; }
            if (!returnBuffer) { return { issues, body }; }

            return { issues, body:Buffer.from(body, "utf8") }
        } catch(error) {
            if (throwError) { throw error; }
            return { error }
        }
    }

    svg(input={}, throwError=true) { return this._fetch("svg", input, false, throwError); }
    png(input={}, throwError=true) { return this._fetch("png", input, false, throwError); }

    svgBuffer(input={}, throwError=true) { return this._fetch("svg", input, true, throwError); }
    pngBuffer(input={}, throwError=true) { return this._fetch("png", input, true, throwError); }
}