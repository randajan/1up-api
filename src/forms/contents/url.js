

export const fields = (define) => {
    define("main", {
        url: { type: "url", placeholder: "https://example.com", req: true }
    });
};

export const format = ({ computed: { url }}) =>{
    return {
        body:url.href,
        title:url.hostname
    }
};
