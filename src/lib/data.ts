import raw from "@/data/vat_corrected_wide.csv?raw";

// Values in the CSV are naira; everything here is in ₦ billions.
const [head, ...rows] = raw.trim().split(/\r?\n/);
export const STATES = head.split(",").slice(1);
export const DATES = rows.map((r) => r.split(",")[0]);
const cells = rows.map((r) =>
	r
		.split(",")
		.slice(1)
		.map((v) => Number(v) / 1e9),
);
export const V: Record<string, number[]> = Object.fromEntries(
	STATES.map((s, i) => [s, cells.map((r) => r[i])]),
);
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

export const ZONES: Record<string, string[]> = {
	"North Central": ["BENUE", "KOGI", "KWARA", "NASARAWA", "NIGER", "PLATEAU"],
	"North East": ["ADAMAWA", "BAUCHI", "BORNO", "GOMBE", "TARABA", "YOBE"],
	"North West": [
		"JIGAWA",
		"KADUNA",
		"KANO",
		"KATSINA",
		"KEBBI",
		"SOKOTO",
		"ZAMFARA",
	],
	"South East": ["ABIA", "ANAMBRA", "EBONYI", "ENUGU", "IMO"],
	"South South": [
		"AKWA IBOM",
		"BAYELSA",
		"CROSS RIVER",
		"DELTA",
		"EDO",
		"RIVERS",
	],
	"South West": ["EKITI", "LAGOS", "OGUN", "ONDO", "OSUN", "OYO"],
};
export const ZONE_NAMES = Object.keys(ZONES);

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
export const zoneTot = (z: string, ix: number[]) =>
	sum(ZONES[z].map((s) => tot(s, ix)));
export const yearTot = (s: string, y: number) => tot(s, idx(y));
export const natYear = (y: number) => sum(idx(y).map((i) => NAT[i]));
export const growth = (s: string | null, y: number) =>
	((s ? yearTot(s, y) / yearTot(s, y - 1) : natYear(y) / natYear(y - 1)) - 1) *
	100;

export const money = (n: number) =>
	n >= 1000 ? `₦${(n / 1000).toFixed(2)}tn` : `₦${n.toFixed(1)}bn`;
export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
