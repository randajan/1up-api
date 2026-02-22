import { DefType } from "./DefType.js";
import { isEmpty, isFn } from "../../tools.js";
import { solids } from "@randajan/props";

const issuesFactory = (id, iss)=>{
    const issues = [];
    const pushIssue = (code, level, detail)=>{
        const issue = {id, code, level, detail};
        issues.push(issue); //local
        (iss[level] || (iss[level] = [])).push(issue); //together
    };
    return [issues, pushIssue];
}

export class DefField {
    constructor(group, id, type, fieldDef={}) {
        if (!(type instanceof DefType)) { throw new Error("DefField requires valid DefType"); }

        const d = type.def({...fieldDef});

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

    collect(value, { computed, issues:iss }, opt={}) {
        const { id, type, showIf, fb, req } = this;
        const [ issues, pushIssue ] = issuesFactory(id, iss);

        const rawValue = value;
        const isShown = showIf(computed, opt);

        if (!isShown) {
            if (value != null) { pushIssue("hidden", "minor"); }
            value = undefined;
        } else if (value != null) {
            value = type.format(this, value, pushIssue, computed);
        }

        if (value == null) {
            value = fb(computed, opt);
            if (value != null) { pushIssue("fallback", "minor", value); }
        }

        computed[id] = value;
        if (isShown) {
            const required = req(computed);
            if (required && isEmpty(computed[id])) { pushIssue("required", "critical"); }
        }

        return { field:this, rawValue, value, isShown, issues, computed };
    }
}
