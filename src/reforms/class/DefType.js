import { solids } from "@randajan/props";
import { fnOnly, fnPass, isFn } from "../../tools";

const formatDefs = (defs, parentDef)=>{
    const t = typeof defs;
    if (t === "function") { return (opt=>{ defs(opt); parentDef?.(opt); return opt; }); }
    if (t !== "object") { return parentDef || fnPass; }

    return opt=>{
        for (const i in defs) {
            if (opt[i] == null) { opt[i] = defs[i]; }
        }
        parentDef?.(opt);
        return opt;
    }
}

const formatFormat = (format, parentFormat)=>{
    if (!parentFormat) { return fnOnly(format) || ((field, value)=>value); }
    if (!isFn(format)) { return parentFormat; }
    return (field, value, pushIssue, computed) => {
        const base = parentFormat(field, value, pushIssue, computed);
        if (base != null) { return format(field, base, pushIssue, computed); }
    };
}

export class DefType {

    static create(id, opt={}) {
        return new DefType(id, opt);
    }

    static extend(parent, id, opt={}) {
        return new DefType(id, opt, parent);
    }

    constructor(id, opt={}, parent) {
        const { defs, format } = opt;
        if (!id) { throw new Error("Type requires 'id'"); }

        solids(this, {
            id,
            parent,
            root:parent?.root || this,
            defs:formatDefs(defs, parent?.defs),
            format:formatFormat(format, parent?.format)
        });

    }

    toString() {
        return this.id;
    }
}
