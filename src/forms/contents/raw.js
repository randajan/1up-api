export const fields = (define) => {
    define("main", {
        content: {
            type: "textarea",
            placeholder: "Text",
            req: true,
        }
    });
};

export const normalize = (values) => {
    if (values == null) { return { content: values }; }
    if (typeof values === "object" && !Array.isArray(values)) { return values; }
    return { content: values };
};

export const format = ({ computed:values }) => {

    return {
        body:values.content,
        title:values.content
    }
};
