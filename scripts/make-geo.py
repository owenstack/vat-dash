"""Builds src/data/ng-states.json (SVG paths) from Natural Earth admin-1 (public domain).
Download ne_10m_admin_1_states_provinces.geojson from
https://github.com/nvkelso/natural-earth-vector/tree/master/geojson, then:
  python3 scripts/make-geo.py ne_10m_admin_1_states_provinces.geojson src/data/ng-states.json
"""
import json, math, sys

src, out = sys.argv[1], sys.argv[2]
feats = [f for f in json.load(open(src))["features"] if f["properties"].get("admin") == "Nigeria"]
FIX = {"Nassarawa": "NASARAWA", "Federal Capital Territory": "FCT"}

def rings(g):
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    return [r for p in polys for r in p]

pts = [c for f in feats for r in rings(f["geometry"]) for c in r]
lon0, lon1 = min(p[0] for p in pts), max(p[0] for p in pts)
lat0, lat1 = min(p[1] for p in pts), max(p[1] for p in pts)
k = math.cos(math.radians((lat0 + lat1) / 2))
W = 600.0
s = W / ((lon1 - lon0) * k)
H = (lat1 - lat0) * s

def proj(c):
    return round((c[0] - lon0) * k * s, 1), round((lat1 - c[1]) * s, 1)

states = []
for f in feats:
    name = f["properties"]["name"]
    d = []
    for r in rings(f["geometry"]):
        q, last = [], None
        for c in r:
            p = proj(c)
            if p != last:
                q.append(p)
            last = p
        if len(q) > 2:
            d.append("M" + "L".join(f"{x} {y}" for x, y in q) + "Z")
    states.append({"id": FIX.get(name, name.upper()), "d": "".join(d)})

json.dump({"w": W, "h": round(H, 1), "states": states}, open(out, "w"), separators=(",", ":"))
print(len(states), "states", round(H, 1))
