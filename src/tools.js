
export const capitalize = str => (str[0].toUpperCase() + str.slice(1));
export const camelcase = (...strs) =>{
  let r = "";
  for (const str of strs) {
    if (str == null || str === "") { continue; }
    r += !r ? str : capitalize(str);
  }
  return r;
};

export const isEmpty = value => value == null || value === "";

export const toStr = (v)=>v != null ? String(v).trim() : "";

export const toNum = (n, min, max)=>{
  n = Number(n);
  if (!Number.isFinite(n)) { return; }
  if (min != null) { n = Math.max(min, n); }
  if (max != null) { n = Math.min(max, n); }
  return n;
}

const _FIX = 1e6;                     // 6 d.p.
export const numFix = n => Math.round(n*_FIX)/_FIX;



export const fnBlank = _=>_;
export const fnPass = v=>v;

export const isFn = fn=>typeof fn === "function";
export const fnOnly = fn=>(isFn(fn) ? fn : null);


export function shortenText(text, maxLength, separator = " ", threshold = 0.1) {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;

  // rezervujeme místo pro "..."
  const ellipsis = "...";
  const allowedLength = maxLength - ellipsis.length;
  if (allowedLength <= 0) return ellipsis;

  // první tvrdé oříznutí
  let cut = text.slice(0, allowedLength);

  // maximální povolená vzdálenost hledání zpět
  const maxBacktrack = Math.floor(allowedLength * threshold);

  // hledáme separator směrem zpět,
  // ale jen pokud není dál než threshold
  const lastSeparatorIndex = cut.lastIndexOf(separator);

  if (
    lastSeparatorIndex !== -1 &&
    allowedLength - lastSeparatorIndex <= maxBacktrack &&
    lastSeparatorIndex > 0
  ) {
    cut = cut.slice(0, lastSeparatorIndex);
  }

  return cut + ellipsis;
}