// Khanh Hoa: khong xay dung du lieu ranh gioi xa/phuong (theo yeu cau).
// WARDS de rong co chu dich -- moi ham ben duoi van giu nguyen logic goc
// tu wards.js goc vi cac noi goi toi (App.jsx, MapView.jsx,
// excelExport.js, populationStats.js) DA tu xu ly an toan truong hop
// findWard()/getNearbyWards() tra ve null / mang rong (da kiem tra ca 4
// file, deu co san `ward ? ... : "N/A"` hoac tuong duong) -- nen khong
// can sua gi noi khac, app se tu dong hien "N/A" / bo qua polygon phuong
// tren ban do thay vi bi loi.
export const WARDS = [];

// ---- Cac ham ben duoi giu nguyen 100% tu wards.js goc (khong doi logic) ----

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng, lat, polygon) {
  if (!pointInRing(lng, lat, polygon[0])) return false; // outside outer ring
  for (let k = 1; k < polygon.length; k++) {
    if (pointInRing(lng, lat, polygon[k])) return false; // inside a hole
  }
  return true;
}

// Test whether (lat,lng) falls inside a specific already-known ward object
// (skips the bbox search across all wards that findWard() does).
export function pointInWardPolygon(lat, lng, ward) {
  for (const polygon of ward.polygons) {
    if (pointInPolygon(lng, lat, polygon)) return true;
  }
  return false;
}

// Find which ward (phường/xã) a coordinate falls in. Returns ward object or
// null. WARDS rong -> luon tra ve null (dung nhu khi khong tim thay phuong
// nao chua diem do).
export function findWard(lat, lng) {
  for (const ward of WARDS) {
    const [minLng, minLat, maxLng, maxLat] = ward.bbox;
    if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) continue;
    for (const polygon of ward.polygons) {
      if (pointInPolygon(lng, lat, polygon)) return ward;
    }
  }
  return null;
}

// Return all wards whose bbox overlaps a padded box around (lat,lng).
// WARDS rong -> luon tra ve mang rong (App.jsx/MapView.jsx da xu ly: khong
// ve polygon phuong nao tren ban do, khong loi).
export function getNearbyWards(lat, lng, paddingDeg = 0.02) {
  const minLng = lng - paddingDeg,
    maxLng = lng + paddingDeg;
  const minLat = lat - paddingDeg,
    maxLat = lat + paddingDeg;
  return WARDS.filter((ward) => {
    const [wMinLng, wMinLat, wMaxLng, wMaxLat] = ward.bbox;
    return !(wMaxLng < minLng || wMinLng > maxLng || wMaxLat < minLat || wMinLat > maxLat);
  });
}
