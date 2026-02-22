
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