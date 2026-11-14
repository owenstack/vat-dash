import { DownloadIcon, MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import {
	AnnualCard,
	Kpis,
	MapCard,
	RankCard,
	TrendCard,
} from "@/components/hero";
import { Seasonality, States, Timing } from "@/components/sections";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import csvUrl from "@/data/vat_corrected_wide.csv?url";
import { STATES, YEARS, type Year } from "@/lib/data";

const h2 = "text-lg font-semibold tracking-tight";
const grid = "grid grid-cols-1 gap-4 lg:grid-cols-12";

export default function App() {
	const [st, setSt] = useState("ANAMBRA");
	const [yr, setYr] = useState<Year>("all");
	const [dark, setDark] = useState(
		document.documentElement.classList.contains("dark"),
	);
	const toggle = () => {
		const next = !dark;
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
		setDark(next);
	};
	const p = { st, yr, setSt, setYr };
	return (
		<>
			<header className="bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
				<div className="mx-auto flex max-w-340 flex-wrap items-center gap-3 px-5 py-3 md:px-6">
					<div className="min-w-48 flex-1">
						<h1 className="text-xl font-semibold tracking-tight">
							South East VAT monitor
						</h1>
						<p className="text-muted-foreground text-xs">
							Monthly VAT allocation, South East · 5 states ·{" "}
							{yr === "all" ? `${YEARS[0]}–${YEARS.at(-1)}` : yr}
						</p>
					</div>
					<Select value={st} onValueChange={(v) => setSt(v ?? "")}>
						<SelectTrigger aria-label="State" className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATES.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={String(yr)}
						onValueChange={(v) => setYr(v === "all" ? "all" : Number(v))}
					>
						<SelectTrigger aria-label="Year" className="w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">
								{YEARS[0]}–{YEARS.at(-1)}
							</SelectItem>
							{YEARS.map((y) => (
								<SelectItem key={y} value={String(y)}>
									{y}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						render={
							<a href={csvUrl} download="vat_corrected_wide.csv">
								<DownloadIcon /> CSV
							</a>
						}
					/>
					<Button
						variant="outline"
						size="icon"
						onClick={toggle}
						aria-label="Toggle theme"
					>
						{dark ? <SunIcon /> : <MoonIcon />}
					</Button>
				</div>
			</header>
			<main className="mx-auto max-w-340 space-y-10 p-5 md:p-6">
				<section className={grid}>
					<Kpis yr={yr} />
					<MapCard {...p} />
					<TrendCard {...p} />
					<RankCard {...p} />
					<AnnualCard {...p} />
				</section>
				<section className="space-y-4">
					<h2 className={h2}>State analysis</h2>
					<States st={st} yr={yr} />
				</section>
				<section className="space-y-4">
					<h2 className={h2}>Timing</h2>
					<Timing st={st} yr={yr} />
					<Seasonality />
				</section>
				<p className="text-muted-foreground text-xs">
					Source: vat_corrected_wide.csv · scoped to the five South East states
					(ABIA, ANAMBRA, EBONYI, ENUGU, IMO); totals are the sum of those five
					· Map boundaries: Natural Earth (public domain).
				</p>
			</main>
		</>
	);
}
