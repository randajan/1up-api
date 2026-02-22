import { Form } from "../reforms/index.js";
import * as contents from "./contents/*.js";

const _modulesPrefix = "./contents/";
const _modulesSuffix = ".js";

const _modules = new Map(contents.filenames.map((f, i)=>{
    const def = contents.default[i];
    const n = f.slice(_modulesPrefix.length).slice(0, -(_modulesSuffix.length));
    return [n, { def }];
}));

const buildModule = (id, def) => {
    if (!id) { throw new Error("ContentModule requires 'id'"); }

    const { types, fields, normalize, format, entitle } = def;
    if (typeof format !== "function") { throw new Error(`ContentModule '${id}' requires 'format' function`); }
 
    return new Form(id, !entitle ? def : {
        types, fields, normalize, 
        format:(values, opt={})=>{
            const body = format(values, opt);
            const title = entitle(values, opt);
            return { body, title };
        }
    });
};

const lazyBuild = id=>{
    const m = _modules.get(id);
    if (m) { return m.build || (m.build = buildModule(id, m.def)); }
}

export const getContentForm = (id = "raw", throwError=false) =>{
    const m = lazyBuild(id);
    if (m) { return m; }
    if (!throwError) { return lazyBuild("raw"); }
    throw new Error(`ContentModule '${id}' not found`);
}

export const listContentForms = ()=>Array.from(_modules.keys());