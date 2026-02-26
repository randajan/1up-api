const formatBtcAmount = (value) => {
    if (value == null || value === "") { return ""; }
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) { return ""; }
    return num.toFixed(8).replace(/\.?0+$/, "");
};

const encodeParam = (key, value) => `${key}=${encodeURIComponent(String(value))}`;

export const types = (define) => {
    define({
        btcAmount: { type: "number", min: 0.00000001, max: 21000000, step: 0.00000001 }
    });
};

export const fields = (define) => {
    define("main", {
        address: { type: "text", placeholder: "bc1q...", min: 14, max: 120, req: true },
        amount: { type: "btcAmount" },
        label: { type: "text", max: 64 },
        message: { type: "textarea", max: 280 }
    });
};

export const format = ({ computed:{ address, amount, label, message } }) => {
    const query = [];
    const btcAmount = formatBtcAmount(amount);

    if (btcAmount) { query.push(encodeParam("amount", btcAmount)); }
    if (label) { query.push(encodeParam("label", label)); }
    if (message) { query.push(encodeParam("message", message)); }

    const body = `bitcoin:${address}${query.length ? `?${query.join("&")}` : ""}`;
    const title = label || (btcAmount ? `${btcAmount} BTC` : `BTC: ${address}`);

    return { body, title };
};
