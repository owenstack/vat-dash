import type { ReactNode } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	Scatter,
	ScatterChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	growth,
	idx,
	LABELS,
	MONTHS,
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
	yearTot,
	ZONE_NAMES,
	ZONES,
	zoneTot,
} from "@/lib/data";

type P = { st: string; yr: Year };
// Reuse the dashboard chart palette; tint the sixth zone because the palette has five colors.
export const zc = (i: number) =>
	i < 5
		? `var(--chart-${i + 1})`
		: "color-mix(in oklab, var(--chart-1) 55%, var(--background))";
export const bn = (v: number) => `₦${Number(v).toFixed(1)}bn`;
export const tip = <ChartTooltipContent formatter={value => bn(Number(value))} />;
export const grid = <CartesianGrid vertical={false} />;
export const xm = (
	<XAxis
		dataKey="m"
		tickLine={false}
		axisLine={false}
		tickMargin={8}
		minTickGap={28}
	/>
);
export const ym = (
	<YAxis
		tickLine={false}
		axisLine={false}
		width={44}
		tickFormatter={(v) => `${Math.round(v)}`}
	/>
);
export const cfg = (...k: [string, string, string?][]): ChartConfig =>
	Object.fromEntries(
		k.map(([key, label, color], i) => [
			key,
			{ label, color: color ?? `var(--chart-${i + 1})` },
		]),
	);

export function Panel({
	title,
	desc,
	span = "lg:col-span-4",
	tall,
	children,
}: {
	title: string;
	desc?: string;
	span?: string;
	tall?: boolean;
	children: ReactNode;
}) {
	return (
		<Card className={span}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{desc && <CardDescription>{desc}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className={tall ? "h-[320px]" : "h-[250px]"}>{children}</div>
			</CardContent>
		</Card>
	);
}
export const Chart = ({
	config,
	children,
}: {
	config: ChartConfig;
	children: any;
}) => (
	<ChartContainer config={config} className="aspect-auto h-full w-full">
		{children}
	</ChartContainer>
);
export const grid12 = "grid grid-cols-1 gap-4 lg:grid-cols-12";

export function Timing({ yr }: P) {
	const gy = yr === "all" ? (YEARS.at(-1) as number) : Math.max(yr, YEARS[1]);
	const roll = NAT.map((_, i) =>
		i < 11 ? null : sum(NAT.slice(i - 11, i + 1)),
	);
	const prev = idx(gy - 1),
		curr = idx(gy);
	return (
		<div className={grid12}>
			<Panel
				title="Year on year"
				desc={`National, ${gy} vs ${gy - 1}, ₦bn`}
				span="lg:col-span-6"
			>
				<Chart
					config={cfg(
						["prev", String(gy - 1), "var(--chart-2)"],
						["curr", String(gy), "var(--chart-1)"],
					)}
				>
					<BarChart
						data={MONTHS.map((m, k) => ({
							m,
							prev: NAT[prev[k]],
							curr: NAT[curr[k]],
						}))}
					>
						{grid}
						{xm}
						{ym}
						<ChartTooltip cursor={false} content={tip} />
						<Bar dataKey="prev" fill="var(--color-prev)" radius={3} />
						<Bar dataKey="curr" fill="var(--color-curr)" radius={3} />
					</BarChart>
				</Chart>
			</Panel>
			<Panel
				title="Rolling 12-month total"
				desc="National, ₦bn"
				span="lg:col-span-6"
			>
				<Chart config={cfg(["roll", "12-month total", "var(--chart-3)"])}>
					<AreaChart data={LABELS.map((m, i) => ({ m, roll: roll[i] }))}>
						{grid}
						{xm}
						{ym}
						<ChartTooltip content={tip} />
						<Area
							dataKey="roll"
							type="monotone"
							stroke="var(--color-roll)"
							fill="var(--color-roll)"
							fillOpacity={0.15}
							strokeWidth={2}
						/>
					</AreaChart>
				</Chart>
			</Panel>
		</div>
	);
}

export function States({ st, yr }: P) {
	const ix = idx(yr);
	const gy = yr === "all" ? (YEARS.at(-1) as number) : Math.max(yr, YEARS[1]);
	const gr = STATES.map((s) => ({ m: s, g: growth(s, gy) })).sort(
		(a, b) => b.g - a.g,
	);
	const pick = [...gr.slice(0, 6), ...gr.slice(-6)];
	const first = YEARS[0],
		last = YEARS.at(-1) as number,
		n = last - first;
	const pts = STATES.map((s) => ({
		name: s,
		x: yearTot(s, last),
		y: ((yearTot(s, last) / yearTot(s, first)) ** (1 / n) - 1) * 100,
	}));
	const top12 = [...STATES]
		.sort((a, b) => tot(b, idx("all")) - tot(a, idx("all")))
		.slice(0, 12);
	const share = top12.map((s) =>
		YEARS.map((y) => (yearTot(s, y) / natYear(y)) * 100),
	);
	const hx = Math.max(...share.flat());
	const avg = ix.map((i) => sum(STATES.map((s) => V[s][i])) / STATES.length);
	return (
		<div className={grid12}>
			<Panel
				title={st}
				desc="Monthly allocation vs the average state, ₦bn"
				span="lg:col-span-6"
			>
				<Chart
					config={cfg(
						["state", st],
						["avg", "Average state", "var(--chart-2)"],
					)}
				>
					<AreaChart
						data={ix.map((i, k) => ({
							m: LABELS[i],
							state: V[st][i],
							avg: avg[k],
						}))}
					>
						{grid}
						{xm}
						{ym}
						<ChartTooltip content={tip} />
						<ChartLegend content={<ChartLegendContent />} />
						<Area
							dataKey="state"
							type="monotone"
							stroke="var(--color-state)"
							fill="var(--color-state)"
							fillOpacity={0.15}
							strokeWidth={2}
						/>
						<Area
							dataKey="avg"
							type="monotone"
							stroke="var(--color-avg)"
							fill="none"
							strokeDasharray="5 4"
							strokeWidth={2}
						/>
					</AreaChart>
				</Chart>
			</Panel>
			<Panel
				title="Fastest and slowest growth"
				desc={`Top 6 and bottom 6, ${gy} vs ${gy - 1}, %`}
				span="lg:col-span-6"
				tall
			>
				<Chart config={cfg(["g", "Growth"])}>
					<BarChart data={pick} layout="vertical" margin={{ left: 20 }}>
						<CartesianGrid horizontal={false} />
						<XAxis
							type="number"
							tickLine={false}
							axisLine={false}
							tickFormatter={(v) => `${v}%`}
						/>
						<YAxis
							type="category"
							dataKey="m"
							tickLine={false}
							axisLine={false}
							width={90}
							fontSize={10}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent formatter={v => pct(Number(v))} />
							}
						/>
						<Bar dataKey="g" radius={4}>
							{pick.map((p) => (
								<Cell
									key={p.m}
									fill={p.g >= 0 ? "var(--chart-2)" : "var(--chart-1)"}
								/>
							))}
						</Bar>
					</BarChart>
				</Chart>
			</Panel>
			<Panel
				title="Size vs growth"
				desc={`Each dot is a state: ${last} total (x, ₦bn) vs ${first}–${last} annual growth (y, %)`}
				span="lg:col-span-6"
				tall
			>
				<Chart config={{}}>
					<ScatterChart margin={{ left: 0, right: 12 }}>
						<CartesianGrid />
						<XAxis
							type="number"
							dataKey="x"
							name="Total"
							tickLine={false}
							axisLine={false}
							tickFormatter={(v) => `${Math.round(v)}`}
						/>
						<YAxis
							type="number"
							dataKey="y"
							name="Growth"
							tickLine={false}
							axisLine={false}
							width={40}
							tickFormatter={(v) => `${Math.round(v)}%`}
						/>
						<ChartTooltip
							cursor={false}
							content={({ active, payload }: any) =>
								active && payload?.length ? (
									<div className="bg-background rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
										<div className="font-medium">{payload[0].payload.name}</div>
										₦{payload[0].payload.x.toFixed(1)}bn ·{" "}
										{payload[0].payload.y.toFixed(1)}% a year
									</div>
								) : null
							}
						/>
						<Scatter
							data={pts.filter((p) => p.name !== st)}
							fill="var(--chart-2)"
						/>
						<Scatter
							data={pts.filter((p) => p.name === st)}
							fill="var(--chart-1)"
							shape="diamond"
						/>
					</ScatterChart>
				</Chart>
			</Panel>
			<Card className="lg:col-span-6">
				<CardHeader>
					<CardTitle>Share of national VAT by year</CardTitle>
					<CardDescription>
						Top 12 states; darker means a larger share
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>State</TableHead>
								{YEARS.map((y) => (
									<TableHead key={y} className="text-center">
										{y}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{top12.map((s, i) => (
								<TableRow key={s} className="hover:bg-transparent">
									<TableCell className="font-medium">{s}</TableCell>
									{share[i].map((v, k) => (
										<TableCell
											key={k}
											className="text-center tabular-nums"
											style={{
												background: `color-mix(in oklab, var(--chart-2) ${Math.round((v / hx) * 80 + 6)}%, transparent)`,
											}}
										>
											{v.toFixed(1)}%
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export function Zones({ yr }: P) {
	const ix = idx(yr);
	const zcfg = Object.fromEntries(
		ZONE_NAMES.map((z, i) => [z, { label: z, color: zc(i) }]),
	) as ChartConfig;
	return (
		<div className={grid12}>
			<Panel
				title="Total by zone"
				desc="₦bn in period"
				span="lg:col-span-4"
				tall
			>
				<Chart config={{}}>
					<BarChart
						data={ZONE_NAMES.map((z, i) => ({
							m: z,
							v: zoneTot(z, ix),
							fill: zc(i),
						}))}
						layout="vertical"
						margin={{ left: 20 }}
					>
						<CartesianGrid horizontal={false} />
						<XAxis type="number" tickLine={false} axisLine={false} />
						<YAxis
							type="category"
							dataKey="m"
							tickLine={false}
							axisLine={false}
							width={90}
							fontSize={11}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent formatter={value => bn(Number(value))} />}
						/>
						<Bar dataKey="v" radius={5}>
							{ZONE_NAMES.map((z, i) => (
								<Cell key={z} fill={zc(i)} />
							))}
						</Bar>
					</BarChart>
				</Chart>
			</Panel>
			<Panel
				title="Zone mix by year"
				desc="₦bn, stacked"
				span="lg:col-span-8"
				tall
			>
				<Chart config={zcfg}>
					<BarChart
						data={YEARS.map((y) => ({
							m: String(y),
							...Object.fromEntries(
								ZONE_NAMES.map((z) => [z, zoneTot(z, idx(y))]),
							),
						}))}
						margin={{ top: 8, right: 12, bottom: 4, left: 4 }}
						barCategoryGap="24%"
					>
						{grid}
						{xm}
						{ym}
						<ChartTooltip cursor={false} content={tip} />
						<ChartLegend content={<ChartLegendContent />} />
						{ZONE_NAMES.map((z, i) => (
							<Bar
								key={z}
								dataKey={z}
								stackId="a"
								fill={zc(i)}
							/>
						))}
					</BarChart>
				</Chart>
			</Panel>
			<Panel title="Zone monthly trend" desc="₦bn" span="lg:col-span-12" tall>
				<Chart config={zcfg}>
					<LineChart
						data={LABELS.map((m, i) => ({
							m,
							...Object.fromEntries(
								ZONE_NAMES.map((z) => [z, sum(ZONES[z].map((s) => V[s][i]))]),
							),
						}))}
					>
						{grid}
						{xm}
						{ym}
						<ChartTooltip content={tip} />
						<ChartLegend content={<ChartLegendContent />} />
						{ZONE_NAMES.map((z, i) => (
							<Line
								key={z}
								dataKey={z}
								type="monotone"
								stroke={zc(i)}
								strokeWidth={2}
								dot={false}
							/>
						))}
					</LineChart>
				</Chart>
			</Panel>
		</div>
	);
}

export function Seasonality() {
	const si = MONTHS.map((m, k) => ({
		m,
		v:
			(YEARS.reduce((a, y) => a + NAT[idx(y)[k]] / (natYear(y) / 12), 0) /
				YEARS.length) *
			100,
	}));
	const mm = NAT.map((v, i) => ({
		m: LABELS[i],
		v: i ? (v / NAT[i - 1] - 1) * 100 : 0,
	})).slice(1);
	return (
		<div className={grid12}>
			<Panel
				title="Seasonality"
				desc="Average calendar month vs the year's mean (100 = average)"
				span="lg:col-span-5"
				tall
			>
				<Chart config={cfg(["v", "Index"])}>
					<RadarChart data={si}>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={v => Number(v).toFixed(0)}
								/>
							}
						/>
						<PolarGrid />
						<PolarAngleAxis dataKey="m" />
						<PolarRadiusAxis
							domain={[80, "auto"]}
							tick={false}
							axisLine={false}
						/>
						<Radar
							dataKey="v"
							stroke="var(--color-v)"
							fill="var(--color-v)"
							fillOpacity={0.25}
						/>
					</RadarChart>
				</Chart>
			</Panel>
			<Panel
				title="Month-on-month change"
				desc="National, %"
				span="lg:col-span-7"
				tall
			>
				<Chart config={cfg(["v", "Change"])}>
					<BarChart data={mm}>
						{grid}
						{xm}
						<YAxis
							tickLine={false}
							axisLine={false}
							width={44}
							tickFormatter={(v) => `${Math.round(v)}%`}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent formatter={v => pct(Number(v))} />
							}
						/>
						<Bar dataKey="v">
							{mm.map((p, i) => (
								<Cell
									key={i}
									fill={p.v >= 0 ? "var(--chart-2)" : "var(--chart-1)"}
								/>
							))}
						</Bar>
					</BarChart>
				</Chart>
			</Panel>
		</div>
	);
}
