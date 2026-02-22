
const cleanIban = (value) => value?.replace(/\s+/g, "").toUpperCase();
const cleanBic = (value) => value?.replace(/\s+/g, "").toUpperCase();

const formatAmount = (value) => {
    if (value == null || value === "") { return ""; }
    const num = Number(value);
    if (!Number.isFinite(num)) { return ""; }
    return String(num.toFixed(2)).replace(/\.?0+$/, "");
};

const formatDate = (value) => {
    if (!value) { return ""; }
    if (/^\d{8}$/.test(value)) { return value; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) { return value.replaceAll("-", ""); }
    return "";
};

export const types = (define)=>{
    define({
        "money": { type: "number", min: 0, step: 0.01 },
        "isoDate": { type: "date", placeholder: "YYYY-MM-DD" }
    });
}

export const fields = (define) => {

    define("main", {
        iban: { type: "text", placeholder: "CZ6508000000192000145399", req: true },
        bic: { type: "text", placeholder: "GIBACZPX" },
        amount: { type: "money", req:true },
        currency: { type: "enum", enm: ["CZK", "EUR", "USD"], fb: "CZK" },
        message: { type: "text", max:32 }
    });

    define("symbols", {
        vs: { type: "symbol", max:10 },
        ss: { type: "symbol", max:10 },
        ks: { type: "symbol", max:4 }
    });

    define("recipient", {
        name: { type: "text" },
        dueDate: { type: "isoDate" }
    });
};

export const format = ({ computed:{ iban, bic, amount, currency, name, message, vs, ss, ks, dueDate } }) => {
    const parts = ["SPD", "1.0"];
    const push = (k, v) => {
        if (v) { parts.push(`${k}:${v}`); }
    };

    push("ACC", cleanIban(iban));
    push("BIC", cleanBic(bic));
    push("AM", formatAmount(amount));
    push("CC", currency?.toUpperCase());
    push("RN", name);
    push("MSG", message);
    push("X-VS", vs);
    push("X-SS", ss);
    push("X-KS", ks);
    push("DT", formatDate(dueDate));

    return {
        body:parts.join("*"),
        title:!amount ? "" : `${amount} ${currency}`
    }
}
