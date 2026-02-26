

import { cached, solid } from "@randajan/props";
import { _privs } from "../vault.js";
import { Fields } from "./Fields.js";
import { fnPass } from "../../tools.js";
import { issuesValidate } from "./Issue.js";

export class Form {
    constructor(id, opt = {}) {
        const { normalize, format, types, fields } = opt;

        const _p = {};

        _p.normalize = typeof normalize == "function" ? normalize : fnPass;
        _p.format = typeof format == "function" ? format : ({computed})=>computed;

        solid(this, "id", id);
        cached(_p, {}, "fields", _=>new Fields(types, fields));

        _privs.set(this, _p);
    }

    normalize(input) {
        const { normalize } = _privs.get(this);
        const v = normalize(input);
        if (v && typeof v == "object" && !Array.isArray(v)) { return v; }
        throw new Error(`Form '${this.id}' expects object input`);
    }

    format(input = {}, opt={}) {
        const { format, fields } = _privs.get(this);
        const { collector, collect, issues=[], tag, issueTreshold } = opt;
        const out = { computed:{}, issues:issues, input, collector, tag };

        const normalized = this.normalize(input);
        for (const field of fields.values()) {
            const r = field.collect(normalized[field.id], out, opt);
            if (collect) { collect(collector, r); }
        }

        issuesValidate(out.issues, issueTreshold);

        if (!(out.issues.maxLevel >= 2)) {
            out.result = format(out, opt);
        }
        
        return out;
    };

    getField(id) {
        const { fields } = _privs.get(this);
        return fields.get(id);
    }

    listFields() {
        const { fields } = _privs.get(this);
        return Array.from(fields.values());
    }

}