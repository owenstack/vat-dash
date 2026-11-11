import { useState } from "react";
import {
	Bar,
	BarChart,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	YAxis,
} from "recharts";
import { NigeriaMap } from "@/components/nigeria-map";
import {
	bn,
	Chart,
	cfg,
	grid,
	Panel,
	tip,
	xm,
	ym,
	zc,
} from "@/components/sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	growth,
	idx,
	LABELS,
	money,
	NAT,
	natYear,
	pct,
	STATES,
	sum,
	tot,
	V,
	YEARS,
	type Year,
	ZONE_NAMES,
	zoneTot,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type P = {
	st: string;
	yr: Year;
	setSt: (s: string) => void;
	setYr: (y: Year) => void;
};
const gyOf = (yr: Year) =>
	yr === "all" ? (YEARS.at(-1) as number) : Math.max(yr, YEARS[1]);
const cap = (s: string) =>
	s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function Kpi({
	label,
	value,
	badge,
	tone,
}: {
	label: string;
	value: string;
	badge: string;
	tone?: number;
}) {
	return (
		<Card className="gap-2 lg:col-span-3">
			<CardHeader>
				<CardDescription>{label}</CardDescription>
				<CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
			</CardHeader>
			<CardContent>
				<Badge
					variant="outline"
					className={
						tone === undefined
							? ""
							: tone >= 0
								? "text-emerald-600 dark:text-emerald-400"
								: "text-red-600 dark:text-red-400"
					}
				>
					{badge}
				</Badge>
			</CardContent>
		</Card>
	);
}

export function Kpis({ yr }: Pick<P, "yr">) {
	const ix = idx(yr);
	const T = sum(ix.map((i) => NAT[i]));
	const gy = gyOf(yr);
	const g = growth(null, gy);
	const li = ix.at(-1) as number;
	const mom = li > 0 ? (NAT[li] / NAT[li - 1] - 1) * 100 : undefined;
	return (
		<>
			<Kpi
				label="Total VAT"
				value={money(T)}
				badge={`${yr === "all" ? "all years" : yr} · 36 states`}
			/>
			<Kpi
				label="Monthly average"
				value={money(T / ix.length)}
				badge={`over ${ix.length} months`}
			/>
			<Kpi
				label={`Latest month · ${LABELS[li]}`}
				value={money(NAT[li])}
				badge={
					mom === undefined ? "first month" : `${pct(mom)} vs ${LABELS[li - 1]}`
				}
				tone={mom}
			/>
			<Kpi
				label="Growth"
				value={pct(g)}
				badge={`${gy} vs ${gy - 1}`}
				tone={g}
			/>
		</>
	);
}

export function MapCard({ st, yr, setSt }: P) {
	const ix = idx(yr);
	const values = Object.fromEntries(STATES.map((s) => [s, tot(s, ix)]));
	return (
		<Card className="lg:col-span-5">
			<CardHeader>
				<CardTitle>VAT by state</CardTitle>
				<CardDescription>
					Click a state to focus the dashboard on it
				</CardDescription>
			</CardHeader>
			<CardContent>
				<NigeriaMap values={values} selected={st} onSelect={setSt} />
			</CardContent>
		</Card>
	);
}

export function TrendCard({ st, yr }: P) {
	const [top3, setTop3] = useState(true);
	const ix = idx(yr);
	const T = sum(ix.map((i) => NAT[i]));
	const gy = gyOf(yr);
	const ranked = [...STATES].sort((a, b) => tot(b, ix) - tot(a, ix));
	const extra = top3 ? ranked.slice(0, 3).filter((s) => s !== st) : [];
	const keys = [st, ...extra];
	const config: ChartConfig = {
		national: { label: "National", color: "var(--chart-2)" },
	};
	keys.forEach((s, i) => {
		config[`s${i}`] = {
				label: cap(s),
				color: i === 0 ? "var(--chart-1)" : `var(--chart-${i + 2})`,
		};
	});
	const data = ix.map((i) => ({
		m: LABELS[i],
		national: NAT[i],
		...Object.fromEntries(keys.map((s, k) => [`s${k}`, V[s][i]])),
	}));
	const sT = tot(st, ix);
	const sg = growth(st, gy);
	return (
		<Card className="lg:col-span-7">
			<CardHeader>
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="space-y-1.5">
						<CardTitle>Collection trend</CardTitle>
						<CardDescription>
							Monthly VAT, ₦bn · national on the left axis, states on the right
						</CardDescription>
					</div>
					<Button
						size="sm"
						variant={top3 ? "default" : "outline"}
						className="h-8"
						aria-pressed={top3}
						onClick={() => setTop3(!top3)}
					>
						Top 3 states
					</Button>
				</div>
				<div className="flex flex-wrap items-center gap-2 pt-1">
					<span className="font-medium">{cap(st)}</span>
					<Badge variant="outline">{money(sT)}</Badge>
					<Badge variant="outline">
						{((sT / T) * 100).toFixed(1)}% of national
					</Badge>
					<Badge
						variant="outline"
						className={
							sg >= 0
								? "text-emerald-600 dark:text-emerald-400"
								: "text-red-600 dark:text-red-400"
						}
					>
						{pct(sg)} in {gy}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="h-85">
					<Chart config={config}>
						<LineChart data={data}>
							{grid}
							{xm}
							<YAxis
								yAxisId="l"
								tickLine={false}
								axisLine={false}
								width={44}
								tickFormatter={(v) => `${Math.round(v)}`}
							/>
							<YAxis
								yAxisId="r"
								orientation="right"
								tickLine={false}
								axisLine={false}
								width={44}
								tickFormatter={(v) => `${Math.round(v)}`}
							/>
							<ChartTooltip content={tip} />
							<ChartLegend content={<ChartLegendContent />} />
							<Line
								yAxisId="l"
								dataKey="national"
								type="monotone"
								stroke="var(--color-national)"
								strokeWidth={2}
								dot={false}
							/>
							{keys.map((_, k) => (
								<Line
									key={k}
									yAxisId="r"
									dataKey={`s${k}`}
									type="monotone"
									stroke={`var(--color-s${k})`}
									strokeWidth={k === 0 ? 2.5 : 1.5}
									strokeDasharray={k === 0 ? undefined : "4 3"}
									dot={false}
								/>
							))}
						</LineChart>
					</Chart>
				</div>
			</CardContent>
		</Card>
	);
}

export function RankCard({ st, yr, setSt }: P) {
	const ix = idx(yr);
	const T = sum(ix.map((i) => NAT[i]));
	const rank = STATES.map((s) => [s, tot(s, ix)] as const).sort(
		(a, b) => b[1] - a[1],
	);
	const top = rank.slice(0, 10);
	const selRank = rank.findIndex(([s]) => s === st);
	return (
		<Card className="lg:col-span-4">
			<CardHeader>
				<CardTitle>Top states</CardTitle>
				<CardDescription>
					Ranked by VAT in period · click to focus
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-1">
				{top.map(([s, v], i) => (
					<button
						key={s}
						type="button"
						onClick={() => setSt(s)}
						aria-pressed={s === st}
						className={cn(
							"hover:bg-accent focus-visible:ring-ring/50 grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 rounded-md px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-[3px]",
							s === st && "bg-accent",
						)}
					>
						<span className="text-muted-foreground tabular-nums">{i + 1}</span>
						<span>
							<span className="font-medium">{cap(s)}</span>
							<span className="bg-muted mt-1 block h-1.5 rounded-full">
								<span
									className="bg-primary block h-full rounded-full"
									style={{ width: `${(v / top[0][1]) * 100}%` }}
								/>
							</span>
						</span>
						<span className="text-right tabular-nums">
							{money(v)}
							<span className="text-muted-foreground block text-xs">
								{((v / T) * 100).toFixed(1)}%
							</span>
						</span>
					</button>
				))}
				{selRank >= 10 && (
					<div className="text-muted-foreground border-t px-2 pt-2 text-xs">
						{cap(st)} ranks {selRank + 1} of {STATES.length} ·{" "}
						{money(rank[selRank][1])}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export function AnnualCard({ yr, setYr }: P) {
	return (
		<Panel
			title="VAT by year"
			desc="National totals, ₦bn · click a bar to filter"
			span="lg:col-span-4"
		>
			<Chart config={cfg(["total", "Total"])}>
				<BarChart
					data={YEARS.map((y) => ({ m: String(y), total: natYear(y) }))}
				>
					{grid}
					{xm}
					{ym}
					<ChartTooltip cursor={false} content={tip} />
					<Bar
						dataKey="total"
						radius={6}
						className="cursor-pointer"
						onClick={(_: unknown, i: number) =>
							setYr(yr === YEARS[i] ? "all" : YEARS[i])
						}
					>
						{YEARS.map((y) => (
							<Cell
								key={y}
								fill={
									yr === "all" || y === yr ? "var(--chart-2)" : "var(--chart-2)"
								}
								fillOpacity={yr === "all" || y === yr ? 1 : 0.35}
							/>
						))}
					</Bar>
				</BarChart>
			</Chart>
		</Panel>
	);
}

export function ZoneCard({ yr }: P) {
	const ix = idx(yr);
	return (
		<Panel title="Zones" desc="Share of total in period" span="lg:col-span-4">
			<Chart config={{}}>
				<PieChart>
					<ChartTooltip
						content={<ChartTooltipContent formatter={(value) => bn(Number(value))} />}
					/>
					<Pie
						data={ZONE_NAMES.map((z, i) => ({
							name: z,
							value: zoneTot(z, ix),
							fill: zc(i),
						}))}
						dataKey="value"
						nameKey="name"
						innerRadius={55}
						outerRadius={90}
						strokeWidth={2}
					/>
					<ChartLegend content={<ChartLegendContent />} />
				</PieChart>
			</Chart>
		</Panel>
	);
}
