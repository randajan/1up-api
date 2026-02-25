
import { configForm } from "../../forms/configForm";
import { _privs } from "../vault";
import { apiForm } from "../../forms/apiForm";
import { issuesDeserialize } from "../../reforms";

/**
 * @typedef {Object} Qr1upOptions
 * @property {(url:string, init?:object)=>Promise<Response>} fetch HTTP fetch implementation.
 * @property {string} token API token from 1up.cz.
 * @property {string} [rootUrl="https://1up.cz/api/qr/gen"] API root URL.
 * @property {string} [filename="qr"] Target output filename on API side.
 * @property {object} [defaults={}] Default request input merged into every call.
 */

/**
 * @typedef {Object} QrSuccessText
 * @property {Array} issues Parsed API issues.
 * @property {string} body Response body as text.
 */

/**
 * @typedef {Object} QrSuccessBuffer
 * @property {Array} issues Parsed API issues.
 * @property {Buffer} body Response body as buffer.
 */

/**
 * @typedef {Object} QrIssuesOnly
 * @property {Array} issues Validation/API issues when generation is blocked.
 */

/**
 * @typedef {Object} QrErrorResult
 * @property {Error} error Caught error when `throwError=false`.
 */

/**
 * 1up.cz QR API client.
 */
export class Qr1up {
    /**
     * @param {Qr1upOptions} [options={}]
     */
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

    /**
     * Validates and formats input by shared config form.
     * @param {object} input
     * @returns {{issues:Array, result?:object}}
     */
    _format(input) {
        return configForm.format(input, { isApi:true });
    }

    /**
     * Internal request executor for both text and buffer outputs.
     * @param {"svg"|"png"} mimeType
     * @param {object} [input={}]
     * @param {boolean} [returnBuffer=false]
     * @param {boolean} [throwError=true]
     * @returns {Promise<QrSuccessText|QrSuccessBuffer|QrIssuesOnly|QrErrorResult>}
     */
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

            if (!res.ok) {
                const errBody = res.status == 404 ? "Not found" : await res.text();
                throw new Error(`API ${errBody || "fetch failed"} (${res.status})`);
            }

            const issues = issuesDeserialize("x-qr-issues-", Object.fromEntries(res.headers.entries()));
            if (issues.maxLevel > 1) { return { issues }; }

            if (!returnBuffer) { return { issues, body:await res.text() }; }

            const body = (mimeType === "png")
                ? Buffer.from(await res.arrayBuffer())
                : Buffer.from(await res.text(), "utf8");
                
            return { issues, body };
        } catch(error) {
            if (throwError) { throw error; }
            return { error }
        }
    }

    /**
     * Generates SVG and returns text payload.
     * @param {object} [input={}]
     * @param {boolean} [throwError=true]
     * @returns {Promise<QrSuccessText|QrIssuesOnly|QrErrorResult>}
     */
    svg(input={}, throwError=true) { return this._fetch("svg", input, false, throwError); }

    /**
     * Generates PNG and returns text payload from API.
     * For binary PNG data prefer `pngBuffer`.
     * @param {object} [input={}]
     * @param {boolean} [throwError=true]
     * @returns {Promise<QrSuccessText|QrIssuesOnly|QrErrorResult>}
     */
    png(input={}, throwError=true) { return this._fetch("png", input, false, throwError); }

    /**
     * Generates SVG and returns UTF-8 buffer payload.
     * @param {object} [input={}]
     * @param {boolean} [throwError=true]
     * @returns {Promise<QrSuccessBuffer|QrIssuesOnly|QrErrorResult>}
     */
    svgBuffer(input={}, throwError=true) { return this._fetch("svg", input, true, throwError); }

    /**
     * Generates PNG and returns binary buffer payload.
     * @param {object} [input={}]
     * @param {boolean} [throwError=true]
     * @returns {Promise<QrSuccessBuffer|QrIssuesOnly|QrErrorResult>}
     */
    pngBuffer(input={}, throwError=true) { return this._fetch("png", input, true, throwError); }
}
