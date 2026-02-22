
import { DefField } from "./DefField.js";
import { Types } from "./Types.js";


export class Fields extends Map {
    constructor(defineTypes, defineFields) {
        super();
        
        this.types = new Types(defineTypes);

        if (typeof defineFields === "function") {
            defineFields(this.define.bind(this));
        }

    }

    define(group, fieldDefs = {}) {
        const { types } = this;
        const r = {}

        for (const id in fieldDefs) {
            if (this.has(id)) { throw new Error(`Field '${id}' already defined`); }
            const fieldDef = fieldDefs[id];
            const { type } = fieldDef;
            if (!types.has(type)) { throw new Error(`Type '${type}' not found`); }
            const f = r[id] = new DefField(group, id, types.get(type), fieldDef);
            this.set(id, f);
        }

        return r;
    }


}
