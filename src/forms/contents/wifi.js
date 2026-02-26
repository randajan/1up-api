
const escapeWifi = (value) => value?.replace(/([\\;,:"])/g, "\\$1");

export const fields = (define) => {
    define("main", {
        ssid: { type: "text", req: true, max:64 },
        encryption: { type: "enum", enm: ["WPA", "WEP", "nopass"], fb: "WPA" },
        password: {
            type: "text",
            max:64, 
            showIf: ({ encryption }) => encryption !== "nopass",
            req: ({ encryption }) => encryption !== "nopass"
        },
        hidden: { type: "boolean", fb: false }
    });
};

export const format = ({ computed:{ ssid, encryption, hidden, password }}) => {
    ssid = escapeWifi(ssid);
    hidden = hidden ? "true" : "";
    password = encryption === "nopass" ? "" : escapeWifi(password);

    const parts = [
        "WIFI:",
        `T:${encryption};`,
        `S:${ssid};`,
        password ? `P:${password};` : "",
        hidden ? `H:${hidden};` : "",
        ";"
    ];

    return {
        body:parts.join(""),
        title:`WiFi: ${ssid}`
    }
};
