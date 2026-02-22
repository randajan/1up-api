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
            ecc: { type: "enum", enm: ECCS_LEVELS, fb: "M", req:true },
            size: { type: "number", type: "number", min: 128, max: 8196, fb:1024, step: 1, isBackground:true },
            label: { type: "text", isBackground:true },
            contentType: { type: "enum", enm: listContentForms(), fb:"url" }
        });
    }
});


