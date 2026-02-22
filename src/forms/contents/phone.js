
export const fields = (define) => {
    define("main", {
        phone: { type: "text", placeholder: "+420123456789", req: true }
    });
};

export const format = ({ computed:{ phone } }) => {
    return {
        body:`TEL:${phone}`,
        title:phone
    }
};
