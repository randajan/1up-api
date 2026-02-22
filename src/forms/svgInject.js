const stripXml = (value) => value.trim().replace(/^\s*<\?xml[^>]*\?>\s*/i, "");

const stripInjectedStyles = (value) => String(value ?? "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\sstyle\s*=\s*(".*?"|'.*?')/gi, "");

const parseNumber = (value) => {
    if (!value) { return null; }
    const num = Number(String(value).replace(/[^0-9.]/g, ""));
    return Number.isFinite(num) && num > 0 ? num : null;
};

const decodeBase64 = (value) => {
    if (!value) { return ""; }
    if (typeof atob === "function") { return atob(value); }
    if (typeof Buffer !== "undefined") { return Buffer.from(value, "base64").toString("utf8"); }
    return "";
};

const parseDataUrl = (value) => {
    const match = String(value).match(/^data:([^,]*),(.*)$/i);
    if (!match) { return null; }
    const meta = match[1] || "";
    const data = match[2] || "";
    if (!/image\/svg\+xml/i.test(meta)) { return null; }
    if (/;base64/i.test(meta)) { return decodeBase64(data); }
    try { return decodeURIComponent(data.replace(/\+/g, "%20")); } catch { return data; }
};

const extractSvg = (svgText) => {
    const cleaned = stripXml(svgText);
    const match = cleaned.match(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/i);
    if (!match) { return null; }
    const attrs = match[1] || "";
    const inner = match[2] || "";
    const viewBoxMatch = attrs.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
    const viewBox = viewBoxMatch?.[1];
    const width = parseNumber(attrs.match(/\bwidth\s*=\s*["']([^"']+)["']/i)?.[1]);
    const height = parseNumber(attrs.match(/\bheight\s*=\s*["']([^"']+)["']/i)?.[1]);
    const fallbackViewBox = width && height ? `0 0 ${width} ${height}` : null;
    return { inner, viewBox: viewBox || fallbackViewBox };
};

export const buildSvgInjection = (rawSvg, sanitizeSvgForInjection, symbolId = "midSvg") => {
    if (!rawSvg || typeof rawSvg !== "string") { return null; }
    if (typeof sanitizeSvgForInjection !== "function") { sanitizeSvgForInjection = v=>v; }

    const decoded = rawSvg.trim().startsWith("data:") ? parseDataUrl(rawSvg) : rawSvg;
    if (!decoded) { return null; }

    const sanitized = sanitizeSvgForInjection(decoded);
    if (!sanitized || typeof sanitized !== "string") { return null; }

    const extracted = extractSvg(stripInjectedStyles(sanitized));
    if (!extracted) { return null; }

    const { inner, viewBox } = extracted;
    const viewBoxAttr = viewBox ? ` viewBox="${viewBox}"` : "";
    return `<symbol id="${symbolId}"${viewBoxAttr}>${inner}</symbol>`;
};