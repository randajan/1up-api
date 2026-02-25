import { solids } from "@randajan/props";
import { ISSUES_LEVEL } from "../../consts";


const riseMaxLevel = (issues, level)=>{
    const { maxLevel } = issues;
    if (maxLevel >= level) { return; }
    
    Object.defineProperty(issues, "maxLevel", {
        value:level,
        enumerable:false,
        writable:true,
        configurable:true
    });
}

const pushIssue = (ctx, issue)=>{
    if (Array.isArray(ctx.issues)) { ctx.issues.push(issue); }
    else { ctx.issues = [issue]; }
    riseMaxLevel(ctx.issues, issue.level);
}

export const issuesFactory = (id, ctx)=>{
    const r = {};

    r.pushIssue = (level, code, detail)=>{
        const issue = new Issue(id, level, code, detail);
        pushIssue(r, issue);
        pushIssue(ctx, issue);
    };

    return r;
}

export const issuesDeserialize = (prefix, headers)=>{
    const issues = [];

    for (const hid in headers) {
        if (!hid.startsWith(prefix)) { continue; }
        const severity = hid.slice(prefix.length);
        const level = ISSUES_LEVEL.indexOf(severity);
        if (level < 0) { continue; }
        const raws = (headers[hid]).split(",");
        for (const raw of raws) {
            const issue = Issue.deserialize(level, raw);
            issues.push(issue);
            riseMaxLevel(issues, issue.level);
        }
    }

    return issues;
}

export const issuesSerialize = (prefix, issues)=>{
    const r = {};
    if (!Array.isArray(issues)) { return r; }

    for (const issue of issues) {
        if (!(issue instanceof Issue)) { continue; }
        const { severity } = issue;

        const headerId = `${prefix}${severity}`;
        (r[headerId] || (r[headerId] = [])).push(issue.serialize());
    }

    return r;
}

class Issue {

    static deserialize(level, serialized="") {
        const [ id, code, detail ] = serialized.split(":");
        return new Issue(id, level, code, detail);
    }

    constructor(id, level, code, detail) {
        const severity = ISSUES_LEVEL[level];

        if (!severity) { throw new Error(`Invallid issue level '${level}' at ${id} ${code}`); }

        solids(this, {
            id,
            level,
            severity,
            code,
            detail
        });
    }

    simplify() {
        const { id, level:l, severity:s, code:c, detail:d } = this;
        return `${s.toUpperCase()} - ${id} ${c} ${!d ? "" : `(${d})`}`;
    }

    serialize() {
        const { id, level:l, severity:s, code:c, detail:d } = this;
        return `${id}:${c}${!d ? "" : `:${Array.isArray(d) ? d.join("|") : d}`}`;
    }
    
}
