
export const fields = (define) => {
    define("main", {
        email: { type: "email", placeholder: "name@example.com", req: true },
        subject: { type: "text" },
        body: { type: "textarea" }
    });
};

export const format = ({ computed:{ email, subject, body } }) => {
    let uri = `mailto:${encodeURIComponent(email)}`;
    const params = [];
    if (subject) { params.push(`subject=${encodeURIComponent(subject)}`); }
    if (body) { params.push(`body=${encodeURIComponent(body)}`); }
    if (params.length) { uri += `?${params.join("&")}`; }

    return {
        body:uri,
        title:email
    }
};
