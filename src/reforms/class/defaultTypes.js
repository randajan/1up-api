import { toNum, toStr } from "../../tools.js";
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
            if (value === "") { return; }
            let out = Number(value);
            if (!Number.isFinite(out)) {
                pushIssue("invalid", "critical");
                return;
            }

            if (min != null && out < min) {
                pushIssue("min", "major", min);
                out = Math.max(min, out);
            }
            if (max != null && out > max) {
                pushIssue("max", "major", max);
                out = Math.min(max, out);
            }
            return out;
        }
    })
    
    types.set("number", number);
    types.set("range", DefType.extend(number, "range", { defs: { min:0, max:1, step:0.05 } }));

    types.set("enum", DefType.create("enum", {
        format: (field, value, pushIssue, computed) => {
            const enm = field.enm(computed) || [];
            if (!Array.isArray(enm) || !enm.length) {
                pushIssue("invalid", "major");
                return;
            }

            if (enm.includes(value)) { return value; }

            const num = toNum(value);
            if (num != null && enm.includes(num)) { return num; }
            pushIssue("invalid", "major", [...enm]);
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
            let out = toStr(value);

            if (min > 0 && min.length < min) {
                pushIssue("max", "major", min);
                return;
            }

            if (max > 0 && out.length > max) {
                pushIssue("max", "major", max);
                out = out.slice(0, field.max);
            }

            if (value !== out) {
                pushIssue("normalized", "minor");
            }

            return out;
        },
        defs: { max:255 }
    });

    types.set("text", textType);
    types.set("textarea", DefType.extend(textType, "textarea", { defs: { max:12000 } }));
    types.set("date", DefType.extend(textType, "date", { defs: { max:10 } }));
    types.set("color", DefType.extend(textType, "color", { defs: { max:9 } }));
    types.set("file", DefType.extend(textType, "file", { defs: { max:-1 } }));

    types.set("url", DefType.extend(textType, "url", {
        format: (_field, value, pushIssue) => {
            try { return new URL(value); } catch(err) {
                pushIssue("invalid", "critical");
            }
        },
        defs: { max:2048 }
    }));

    types.set("email", DefType.extend(textType, "email", {
        format: (_field, value, pushIssue) => {
            if (!value || value.includes("@")) { return value; }
            pushIssue("invalid", "critical");
        },
        defs: { max:320 }
    }));

    types.set("symbol", DefType.extend(textType, "symbol", {
        format: (_field, value, pushIssue) => {
            if (!value || /^\d+$/.test(value)) { return value; }
            pushIssue("invalid", "critical");
        }
    }));


    return types;
};

let _defaultTypes;
export const getDefaultTypes = () =>(_defaultTypes || (_defaultTypes = defineDefaultTypes()));
