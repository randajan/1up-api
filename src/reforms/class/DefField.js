import { DefType } from "./DefType.js";
import { isEmpty, isFn } from "../../tools.js";
import { solids } from "@randajan/props";
import { issuesFactory } from "./Issue.js";


export class DefField {
    constructor(group, id, type, fieldDef={}) {
        if (!(type instanceof DefType)) { throw new Error("DefField requires valid DefType"); }

        const d = type.defs({...fieldDef});

        d.id = id;
        d.group = group;
        d.type = type;

        d.showIf = d.showIf ?? (_ => true);

        if (!isFn(d.fb)) {
            const fallback = d.fb;
            d.fb = (_ => fallback);
            d.def = fallback;
        }

        if (!isFn(d.req)) {
            const required = d.req;
            d.req = (_ => Boolean(required));
        }

        solids(this, d);
    }

    collect(value, context, opt={}) {
        const { id, type, showIf, fb, req } = this;
        const { computed } = context;
        
        const isc = issuesFactory(id, context);
        const { pushIssue } = isc;

        const rawValue = value;
        const isShown = showIf(computed, opt);

        if (!isShown) {
            if (value != null) { pushIssue(0, "hidden"); }
            value = undefined;
        } else if (value != null) {
            value = type.format(this, value, pushIssue, computed);
        }

        if (value == null) {
            value = fb(computed, opt);
            if (value != null) { pushIssue(0, "fallback", value); }
        }

        computed[id] = value;
        if (isShown) {
            const required = req(computed, opt);
            if (required && isEmpty(computed[id])) { pushIssue(2, "required"); }
        }

        return { field:this, rawValue, value, isShown, computed, issues:isc.issues };
    }
}
