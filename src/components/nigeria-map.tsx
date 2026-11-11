import { useMemo, useState } from "react";
import geo from "@/data/ng-states.json";
import { money } from "@/lib/data";

type Props = {
	values: Record<string, number>;
	selected: string;
	onSelect: (id: string) => void;
};

/** Choropleth of the 36 states. Boundaries: Natural Earth (public domain). FCT has no data in the CSV. */
export function NigeriaMap({ values, selected, onSelect }: Props) {
	const [hover, setHover] = useState<string | null>(null);
	const { min, max, total } = useMemo(() => {
		const v = Object.values(values);
		return {
			min: Math.min(...v),
			max: Math.max(...v),
			total: v.reduce((a, b) => a + b, 0),
		};
	}, [values]);
	// sqrt scale so Lagos does not wash out every other state
	const shade = (v: number) =>
		Math.round(12 + 82 * Math.sqrt((v - min) / (max - min || 1)));
	const active = hover ?? selected;
	const order = [...geo.states].sort(
		(a, b) => Number(a.id === selected) - Number(b.id === selected),
	);
	return (
		<div className="space-y-3">
			<svg
				viewBox={`0 0 ${geo.w} ${geo.h}`}
				className="mx-auto w-full max-w-140"
				role="group"
				aria-label="Map of VAT by state"
			>
				<defs>
					<pattern
						id="nodata"
						width="6"
						height="6"
						patternUnits="userSpaceOnUse"
						patternTransform="rotate(45)"
					>
						<rect width="6" height="6" fill="var(--muted)" />
						<line
							x1="0"
							y1="0"
							x2="0"
							y2="6"
							stroke="var(--border)"
							strokeWidth="2"
						/>
					</pattern>
				</defs>
				{order.map((s) => {
					const v = values[s.id];
					const isSel = s.id === selected;
					return (
						<path
							key={s.id}
							d={s.d}
							fill={
								v === undefined
									? "url(#nodata)"
									: `color-mix(in oklab, var(--chart-2) ${shade(v)}%, var(--muted))`
							}
							stroke={isSel ? "var(--foreground)" : "var(--background)"}
							strokeWidth={isSel ? 2.2 : 0.8}
							strokeLinejoin="round"
							className={
								v === undefined
									? ""
									: "cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
							}
							tabIndex={v === undefined ? -1 : 0}
							role={v === undefined ? undefined : "button"}
							aria-label={
								v === undefined ? `${s.id}, no data` : `${s.id}, ${money(v)}`
							}
							aria-pressed={v === undefined ? undefined : isSel}
							onMouseEnter={() => setHover(s.id)}
							onMouseLeave={() => setHover(null)}
							onFocus={() => setHover(s.id)}
							onBlur={() => setHover(null)}
							onClick={() => v !== undefined && onSelect(s.id)}
							onKeyDown={(e) =>
								(e.key === "Enter" || e.key === " ") &&
								v !== undefined &&
								onSelect(s.id)
							}
						/>
					);
				})}
			</svg>
			<div className="flex items-center justify-between gap-3 text-sm">
				<div>
					<div className="font-medium">{active === "FCT" ? "FCT" : active}</div>
					<div className="text-muted-foreground text-xs tabular-nums">
						{values[active] === undefined
							? "No data in the CSV"
							: `${money(values[active])} · ${((values[active] / total) * 100).toFixed(1)}% of national`}
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
					<span
						className="ml-1 size-3 rounded-sm border"
						style={{
							background: "url(#nodata)",
							backgroundColor: "var(--muted)",
						}}
					/>
					No data
				</div>
			</div>
		</div>
	);
}
