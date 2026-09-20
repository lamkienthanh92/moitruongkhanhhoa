// Loads the One Health environmental grids from 13 SEPARATE files.
// QUAN TRONG: cac file nay nam trong thu muc grid-data/ o GOC repo,
// KHONG nam trong public/ -- ly do: CRA (react-scripts build) tu dong
// quet toan bo public/ de tao "service worker precache manifest" (tinh
// checksum tung file) ngay ca khi app khong dung service worker, va
// 52MB du lieu trong public/ nhieu kha nang gay OOM luc build tren
// Netlify (build bi kill giua chung, khong in loi gi). Dat ngoai
// public/ thi CRA hoan toan khong dung toi cac file nay luc build,
// tranh het rui ro do -- ta fetch truc tiep tu GitHub raw content.
//
// Sau khi day code nay len GitHub, SUA lai GITHUB_RAW_BASE ben duoi cho
// dung ten user/repo/branch cua ban neu khac.

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/lamkienthanh92/Onehealthkhanhhoa/main/grid-data";

const LAYER_KEYS = [
  "no2", "so2", "co", "o3", "lst", "nightlights",
  "builtup", "water", "population", "elevation",
  "landcover", "treecover", "forestloss",
];

let _grids = null;
let _loadPromise = null;
let _error = null;

export function loadGrids() {
  if (_loadPromise) return _loadPromise;

  _loadPromise = Promise.all(
    LAYER_KEYS.map((key) =>
      fetch(`${GITHUB_RAW_BASE}/grid_${key}.json`).then((res) => {
        if (!res.ok) {
          throw new Error(`grid_${key}.json fetch failed: HTTP ${res.status}`);
        }
        return res.json().then((data) => [key, data]);
      })
    )
  )
    .then((entries) => {
      const merged = {};
      for (const [key, data] of entries) merged[key] = data;
      _grids = merged;
      return merged;
    })
    .catch((err) => {
      _error = err;
      throw err;
    });

  return _loadPromise;
}

// Synchronous accessor -- returns null until loadGrids() has resolved.
// Callers that run after the app-level loading gate (see App.jsx) can
// treat this as always-populated; anything that might run earlier must
// handle null.
export function getGrids() {
  return _grids;
}

export function getGridsError() {
  return _error;
}

export function isGridsLoaded() {
  return _grids !== null;
}
