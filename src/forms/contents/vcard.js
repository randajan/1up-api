const escapeVcard = (value) => String(value ?? "").replace(/\r\n|\r|\n|[\\,;]/g, (match) => {
    if (match === "\r\n" || match === "\r" || match === "\n") { return "\\n"; }
    return `\\${match}`;
});

export const fields = (define) => {
    define("main", {
        firstName: { type: "text", max: 64 },
        lastName:  { type: "text", max: 64 },
        org:       { type: "text", max: 128 },
        title:     { type: "text", max: 128 }
    });

    define("contact", {
        phone: { type: "phone", },   // +420123456789 ext 123
        email: { type: "email" },
        url:   { type: "url" }
    });

    define("extra", {
        note: { type: "textarea", max: 512 }
    });
};

export const format = ({ computed:values }) => {
    const firstName = escapeVcard(values.firstName);
    const lastName = escapeVcard(values.lastName);
    const org = escapeVcard(values.org);
    const title = escapeVcard(values.title);
    const phone = escapeVcard(values.phone);
    const email = escapeVcard(values.email);
    const url = escapeVcard(values.url);
    const note = escapeVcard(values.note);

    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `${(firstName || lastName) ? `FN:${[firstName, lastName].filter(Boolean).join(" ")}` : ""}`,
        org ? `ORG:${org}` : "",
        title ? `TITLE:${title}` : "",
        phone ? `TEL;TYPE=CELL:${phone}` : "",
        email ? `EMAIL:${email}` : "",
        url ? `URL:${url}` : "",
        note ? `NOTE:${note}` : "",
        "END:VCARD"
    ].filter(Boolean);

    return {
        body:lines.join("\n"),
        title:`${firstName} ${lastName}`
    }
};
