import { ECCS_LEVELS } from "../consts";
import { Form } from "../reforms";
import { getContentForm, listContentForms } from "./contentForms";

const mergeIssues = (target = {}, source = {}) => {
    for (const level in source) {
        if (!source[level]?.length) { continue; }
        if (!target[level]) { target[level] = []; }
        target[level].push(...source[level]);
    }
    return target;
};

const IF = (key, t, f)=>((_, o)=>o[key] ? t : f);
const IFN = (key, t, f)=>((_, o)=>o[key] ? f : t);

export const configForm = new Form("config", {
    format:({ input, computed, issues }, opt = {})=>{
        const { collector, collect } = opt;

        const contentFormatted = getContentForm(computed.contentType, true).format(input, {
            ...opt,
            collector,
            collect: collect
                ? (c, collected) => collect(c, { ...collected, section: "content" })
                : undefined
        });

        mergeIssues(issues, contentFormatted.issues);
        computed.content = contentFormatted.result;

        return computed;
    }, fields:define=>{
        define("config", {
            token: { type:"text", min:32, max:64, showIf:IF("isApi", true), req:IF("isApi", true) },
            filename: { type:"text", max:32, showIf:IF("isApi", true), fb:"qr", req:true },
            mimeType: { type: "enum", enm:["svg", "png"], showIf:IF("isApi", true), fb:"svg", req:true },
            ecc: { type: "enum", enm: ECCS_LEVELS, fb:IFN("isApi", "M"), def:"M", req:IFN("isApi", true) },
            size: { type: "number", type: "number", min: 128, max: 8196, fb:IFN("isApi", 1024), def:1024, step: 1, showIf:IFN("isEditor", true) },
            label: { type: "text", showIf:IFN("isEditor", true) },
            contentType: { type: "enum", enm: listContentForms(), fb:"url" }
        });
    }
});


