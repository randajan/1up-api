import { numFix, toNum, toStr } from "../../tools.js";
import { DefType } from "./DefType.js";

const defineDefaultTypes = () => {
    const types = new Map();

    types.set("boolean", DefType.create("boolean", {
        format: (_field, value) => {
            if (value === "false" || value === "0") { return false; }
            if (value === "true" || value === "1") { return true; }
            return Boolean(value);
        },
        defs: {
            fb:false
        }
    }));

    const number = DefType.create("number", {
        format: ({min, max}, value, pushIssue) => {
            if (value == null || value === "") { return; }
            let out = Number(value);
            if (!Number.isFinite(out)) {
                pushIssue(1, "invalid");
                return;
            }

            if (min != null && out < min) {
                pushIssue(1, "min", min);
                out = Math.max(min, out);
            }
            if (max != null && out > max) {
                pushIssue(1, "max", max);
                out = Math.min(max, out);
            }

            return numFix(out);
        }
    })
    
    types.set("number", number);
    types.set("range", DefType.extend(number, "range", { defs: { min:0, max:1, step:0.05 } }));

    types.set("object", DefType.create("object", {
        format:(field, value, pushIssue, computed)=>{
            if (typeof value !== "object") {
                pushIssue(1, "invalid");
            } else if (Array.isArray(value)) {
                pushIssue(1, "invalid");
            } else {
                return value;
            }
        }
    }));

    types.set("function", DefType.create("function", {
        format:(field, value, pushIssue)=>{
            if (value == null) { return value; }
            if (typeof value === "function") { return value; }
            pushIssue(2, "invalid");
        }
    }));

    types.set("enum", DefType.create("enum", {
        format: (field, value, pushIssue, computed) => {
            const enm = field.enm(computed) || [];
            if (!Array.isArray(enm) || !enm.length) {
                if (value != null) { pushIssue(1, "invalid", []); }
                return;
            }

            if (enm.includes(value)) { return value; }

            const num = toNum(value);
            if (num != null && enm.includes(num)) { return num; }
            pushIssue(1, "invalid", [...enm]);
        },
        defs: (opt) => {
            const { enm } = opt;
            const isArray = Array.isArray(enm);

            if (isArray) { opt.enm = () => enm; }
            //if (!opt.enm) { console.log(opt); }
            if (opt.fb == null) { opt.fb = isArray ? enm[0] : c => (opt.enm(c)?.[0]); }
        }
    }));

    const textType = DefType.create("text", {
        format: ({ max, min }, value, pushIssue) => {
            if (value == null) { return; }

            let out = toStr(value);

            if (min > 0 && out.length < min) {
                pushIssue(2, "min", min);
                return;
            }

            if (max > 0 && out.length > max) {
                pushIssue(1, "max", max);
                out = out.slice(0, max);
            }

            if (value !== out) {
                pushIssue(0, "normalized");
            }

            return out;
        },
        defs: { max:255 }
    });

    types.set("text", textType);
    types.set("textarea", DefType.extend(textType, "textarea", { defs: { max:12000 } }));
    types.set("date", DefType.extend(textType, "date", { defs: { max:10 } }));
    types.set("color", DefType.extend(textType, "color", { defs: { max:9 } }));
    types.set("file", DefType.extend(textType, "file", { defs: { max:0 } }));
    types.set("phone", DefType.extend(textType, "phone", { defs: { max: 32 } }))

    types.set("url", DefType.extend(textType, "url", {
        format: (_field, value, pushIssue) => {
            try { return new URL(value); } catch(err) {
                pushIssue(2, "invalid");
            }
        },
        defs: { max:2048 }
    }));

    types.set("email", DefType.extend(textType, "email", {
        format: (_field, value, pushIssue) => {
            if (!value || value.includes("@")) { return value; }
            pushIssue(2, "invalid");
        },
        defs: { max:320 }
    }));

    types.set("symbol", DefType.extend(textType, "symbol", {
        format: (_field, value, pushIssue) => {
            if (!value || /^\d+$/.test(value)) { return value; }
            pushIssue(2, "invalid");
        }
    }));


    return types;
};

let _defaultTypes;
export const getDefaultTypes = () =>(_defaultTypes || (_defaultTypes = defineDefaultTypes()));
