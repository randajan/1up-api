import { getDefaultTypes } from "./defaultTypes";
import { DefType } from "./DefType";


export class Types extends Map {
    constructor(defineTypes) {
        super(getDefaultTypes());

        if (typeof defineTypes === "function") { defineTypes(this.define.bind(this)); }
    }

    define (subtypes = {}) {
        for (const id in subtypes) {
            if (this.has(id)) { throw new Error(`Type '${id}' already defined`); }
            const opt = subtypes[id];
            const parent = this.get(opt.type);
            if (!parent) { throw new Error(`Type'${opt.type}' not found`); }
            this.set(id, DefType.extend(parent, id, opt));
        }
        return subtypes;
    }
}
