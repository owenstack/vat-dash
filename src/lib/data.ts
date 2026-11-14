import raw from "@/data/vat_corrected_wide.csv?raw";

// Values in the CSV are naira; everything here is in ₦ billions.
const [head, ...rows] = raw.trim().split(/\r?\n/);
// The dashboard covers the South East zone only, not all of Nigeria.
const SE = new Set(["ABIA", "ANAMBRA", "EBONYI", "ENUGU", "IMO"]);
export const DATES = rows.map((r) => r.split(",")[0]);
const names = head.split(",").slice(1);
const cells = rows.map((r) =>
	r
		.split(",")
		.slice(1)
		.map((v) => Number(v) / 1e9),
);
// Keep each state's original CSV column; only the South East states are exposed.
export const V: Record<string, number[]> = Object.fromEntries(
	names
		.map((s, i) => [s, cells.map((r) => r[i])] as const)
		.filter(([s]) => SE.has(s)),
);
export const STATES = Object.keys(V);
export const M = DATES.length;
export const YEARS = [...new Set(DATES.map((d) => Number(d.slice(0, 4))))];
export const MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
export const LABELS = DATES.map(
	(d) => `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(2, 4)}`,
);

export type Year = "all" | number;
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
export const NAT = Array.from({ length: M }, (_, i) =>
	sum(STATES.map((s) => V[s][i])),
);
export const idx = (y: Year) =>
	DATES.map((d, i) =>
		y === "all" || Number(d.slice(0, 4)) === y ? i : -1,
	).filter((i) => i >= 0);
export const tot = (s: string, ix: number[]) => sum(ix.map((i) => V[s][i]));
export const yearTot = (s: string, y: number) => tot(s, idx(y));
export const natYear = (y: number) => sum(idx(y).map((i) => NAT[i]));
export const growth = (s: string | null, y: number) =>
	((s ? yearTot(s, y) / yearTot(s, y - 1) : natYear(y) / natYear(y - 1)) - 1) *
	100;

export const money = (n: number) =>
	n >= 1000 ? `₦${(n / 1000).toFixed(2)}tn` : `₦${n.toFixed(1)}bn`;
export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
