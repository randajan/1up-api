import { ECCS_LEVELS } from "../consts";
import { Form } from "../reforms";
import { getContentForm, listContentForms } from "./contentForms";


const IF = (key, t, f)=>((_, o)=>o[key] ? t : f);
const IFN = (key, t, f)=>((_, o)=>o[key] ? f : t);

export const configForm = new Form("config", {
    format:(ctx, opt = {})=>{
        const { input, computed, issues } = ctx;
        const { collector, collect } = opt;

        const contentFormatted = getContentForm(computed.contentType, true).format(input, {
            ...opt,
            issues,
            collector,
            collect,
            tag:"content"
        });

        computed.content = contentFormatted.result;

        return computed;
    }, fields:define=>{
        define("config", {
            ecc: { type: "enum", enm: ECCS_LEVELS, fb:IFN("isApi", "M"), def:"M", req:IFN("isApi", true) },
            size: { type: "number", type: "number", min: 128, max: 8196, fb:IFN("isApi", 1024), def:1024, step: 1, showIf:IFN("isEditor", true) },
            label: { type: "text", showIf:IFN("isEditor", true) },
            contentType: { type: "enum", enm: listContentForms(), fb:"url" }
        });
    }
});


