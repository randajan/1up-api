import { solids } from "@randajan/props";
import { ISSUES_LEVEL } from "../../consts";
import { shortenText } from "../../tools";


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

export const issuesDeserialize = (prefix, headers, treshold)=>{
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

    issuesValidate(issues, treshold);

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

const issuesError = (msg, issues)=>{
    const err = new Error(msg);
    Object.defineProperty(err, "issues", {value:issues, enumerable:false});
    return err;
}

export const issuesValidate = (issues, treshold)=>{
    if (!(issues.maxLevel >= treshold)) { return; }
    const isf = issues.filter(s=>s.level >= treshold);
    if (isf.length === 1) { throw issuesError(`Failed due to issue: ${isf[0].simplify()}`, issues); }
    const isl = isf.sort((a, b)=>b.level-a.level).map(((s, k)=>(` Issue[${k}]: ${s.simplify()}`))).join("\n");
    throw issuesError(`Failed due to multiple issues:\n${isl}`, issues);
}

const detailToStr = (detail, separator)=>{
    const isArray = Array.isArray(detail);
    const s = isArray ? detail.join(separator) : detail;
    return shortenText(s, 32, isArray ? separator : " ", 0.1);
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
        
        return `${s.toUpperCase()} - ${id} ${c} ${!d ? "" : `(${detailToStr(d, ",")})`}`;
    }

    serialize() {
        const { id, level:l, severity:s, code:c, detail:d } = this;
        return `${id}:${c}${!d ? "" : `:${detailToStr(d, "|")}`}`;
    }
    
}
