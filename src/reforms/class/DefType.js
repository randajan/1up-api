import { solids } from "@randajan/props";
import { fnOnly, fnPass, isFn } from "../../tools";

const formatDef = (def, parentDef)=>{
    const t = typeof def;
    if (t === "function") { return (opt=>{ def(opt); parentDef?.(opt); return opt; }); }
    if (t !== "object") { return parentDef || fnPass; }

    return opt=>{
        for (const i in def) {
            if (opt[i] == null) { opt[i] = def[i]; }
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
        const { def, format } = opt;
        if (!id) { throw new Error("Type requires 'id'"); }

        solids(this, {
            id,
            parent,
            root:parent?.root || this,
            def:formatDef(def, parent?.def),
            format:formatFormat(format, parent?.format)
        });

    }

    toString() {
        return this.id;
    }
}
