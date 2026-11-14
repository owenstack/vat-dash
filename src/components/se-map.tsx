import { useMemo, useState } from "react";
import geo from "@/data/ng-states.json";
import { money } from "@/lib/data";

type Props = {
	values: Record<string, number>;
	selected: string;
	onSelect: (id: string) => void;
};

// The geo file covers all of Nigeria; the dashboard only shows the South East.
const SE = new Set(["ABIA", "ANAMBRA", "EBONYI", "ENUGU", "IMO"]);

// Paths are "M x y L x y ... Z" chains, so every number is a coordinate pair.
function bbox(d: string) {
	const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
	let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
	for (let i = 0; i < n.length; i += 2) {
		x0 = Math.min(x0, n[i]);
		x1 = Math.max(x1, n[i]);
		y0 = Math.min(y0, n[i + 1]);
		y1 = Math.max(y1, n[i + 1]);
	}
	return [x0, y0, x1, y1] as const;
}

/** Choropleth of the five South East states, zoomed to the region. Boundaries: Natural Earth (public domain). */
export function SeMap({ values, selected, onSelect }: Props) {
	const [hover, setHover] = useState<string | null>(null);
	const states = useMemo(() => geo.states.filter((s) => SE.has(s.id)), []);
	const view = useMemo(() => {
		const [x0, y0, x1, y1] = states
			.map((s) => bbox(s.d))
			.reduce(
				(a, b) => [
					Math.min(a[0], b[0]),
					Math.min(a[1], b[1]),
					Math.max(a[2], b[2]),
					Math.max(a[3], b[3]),
				],
				[Infinity, Infinity, -Infinity, -Infinity],
			);
		const pad = 4;
		const w = x1 - x0 + pad * 2;
		const h = y1 - y0 + pad * 2;
		return { w, h, vb: `${x0 - pad} ${y0 - pad} ${w} ${h}` };
	}, [states]);
	const { min, max, total } = useMemo(() => {
		const v = Object.values(values);
		return {
			min: Math.min(...v),
			max: Math.max(...v),
			total: v.reduce((a, b) => a + b, 0),
		};
	}, [values]);
	const shade = (v: number) =>
		Math.round(12 + 82 * Math.sqrt((v - min) / (max - min || 1)));
	const active = hover ?? selected;
	const order = [...states].sort(
		(a, b) => Number(a.id === selected) - Number(b.id === selected),
	);
	return (
		<div className="space-y-3">
			<svg
				viewBox={view.vb}
				className="mx-auto w-full max-w-100"
				role="group"
				aria-label="Map of VAT by South East state"
			>
				{order.map((s) => {
					const v = values[s.id];
					const isSel = s.id === selected;
					return (
						<path
							key={s.id}
							d={s.d}
							fill={`color-mix(in oklab, var(--chart-2) ${shade(v)}, var(--muted))`}
							stroke={isSel ? "var(--foreground)" : "var(--background)"}
							strokeWidth={isSel ? 1.4 : 0.8}
							strokeLinejoin="round"
							className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
							tabIndex={0}
							role="button"
							aria-label={`${s.id}, ${money(v)}`}
							aria-pressed={isSel}
							onMouseEnter={() => setHover(s.id)}
							onMouseLeave={() => setHover(null)}
							onFocus={() => setHover(s.id)}
							onBlur={() => setHover(null)}
							onClick={() => onSelect(s.id)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") && onSelect(s.id)
							}
						/>
					);
				})}
			</svg>
			<div className="flex items-center justify-between gap-3 text-sm">
				<div>
					<div className="font-medium">{active}</div>
					<div className="text-muted-foreground text-xs tabular-nums">
						{money(values[active])} ·{" "}
						{((values[active] / total) * 100).toFixed(1)}% of the region
					</div>
				</div>
				<div className="text-muted-foreground flex items-center gap-2 text-xs">
					Low
					<span
						className="h-2 w-20 rounded-full"
						style={{
							background:
								"linear-gradient(90deg, color-mix(in oklab, var(--chart-2) 12%, var(--muted)), var(--chart-2))",
						}}
					/>
					High
				</div>
			</div>
		</div>
	);
}
