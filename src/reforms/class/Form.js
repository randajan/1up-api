

import { cached, solid } from "@randajan/props";
import { _privs } from "../vault.js";
import { Fields } from "./Fields.js";
import { fnPass } from "../../tools.js";

export class Form {
    constructor(id, opt = {}) {
        const { normalize, format, types, fields } = opt;

        const _p = {};

        _p.normalize = typeof normalize == "function" ? normalize : fnPass;
        _p.format = typeof format == "function" ? format : fnPass;

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
        const { collector, collect } = opt;
        const out = { computed:{}, issues:{}, input, collector };

        const normalized = this.normalize(input);
        for (const field of fields.values()) {
            const r = field.collect(normalized[field.id], out, opt);
            if (collect) { collect(collector, r); }
        }

        if (!out.issues.critical?.length) {
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