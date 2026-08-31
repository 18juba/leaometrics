<script lang="ts">
	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { PlayerPosition, PositionAnalysis } from '$lib/types/analysis';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type Metric = 'playerCount' | 'averageAge' | 'averageHeight' | 'totalMarketValue';

	interface Props {
		data: PositionAnalysis[];
	}

	let { data }: Props = $props();

	let metric = $state<Metric>('averageAge');
	let selectedPosition = $state<PlayerPosition | null>(null);

	interface PositionPlacement {
		label: string;
		shortLabel: string;
		x: number;
		y: number;
	}

	const positions = {
		Goalkeeper: {
			label: 'Goleiros',
			shortLabel: 'GOL',
			x: 7,
			y: 50
		},

		'Centre-Back': {
			label: 'Zagueiros',
			shortLabel: 'ZAG',
			x: 21,
			y: 50
		},

		'Right-Back': {
			label: 'Laterais-direitos',
			shortLabel: 'LD',
			x: 26,
			y: 82
		},

		'Left-Back': {
			label: 'Laterais-esquerdos',
			shortLabel: 'LE',
			x: 26,
			y: 18
		},

		'Defensive Midfield': {
			label: 'Volantes',
			shortLabel: 'VOL',
			x: 39,
			y: 50
		},

		'Central Midfield': {
			label: 'Meias centrais',
			shortLabel: 'MC',
			x: 52,
			y: 50
		},

		'Right Midfield': {
			label: 'Meias pela direita',
			shortLabel: 'MD',
			x: 57,
			y: 82
		},

		'Left Midfield': {
			label: 'Meias pela esquerda',
			shortLabel: 'ME',
			x: 57,
			y: 18
		},

		'Attacking Midfield': {
			label: 'Meias ofensivos',
			shortLabel: 'MO',
			x: 65,
			y: 50
		},

		'Right Winger': {
			label: 'Pontas-direitas',
			shortLabel: 'PD',
			x: 77,
			y: 82
		},

		'Left Winger': {
			label: 'Pontas-esquerdas',
			shortLabel: 'PE',
			x: 77,
			y: 18
		},

		'Second Striker': {
			label: 'Segundos atacantes',
			shortLabel: 'SA',
			x: 81,
			y: 50
		},

		'Centre-Forward': {
			label: 'Centroavantes',
			shortLabel: 'CA',
			x: 93,
			y: 50
		}
	} satisfies Record<PlayerPosition, PositionPlacement>;

	interface MetricConfig {
		label: string;
		pillLabel: string;
		format: (value: number) => string;
	}

	const currencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		notation: 'compact',
		maximumFractionDigits: 1
	});

	const decimalFormatter = new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1
	});

	const metricConfig: Record<Metric, MetricConfig> = {
		playerCount: {
			label: 'Quantidade de Atletas',
			pillLabel: 'Atletas',
			format: (value) => String(Math.round(value))
		},
		averageAge: {
			label: 'Média de Idade',
			pillLabel: 'Média de Idade',
			format: (value) => `${decimalFormatter.format(value)} anos`
		},
		averageHeight: {
			label: 'Média de Altura',
			pillLabel: 'Média de Altura',
			format: (value) => `${decimalFormatter.format(value)} m`
		},
		totalMarketValue: {
			label: 'Valor de Mercado Total',
			pillLabel: 'Valor Total',
			format: (value) => currencyFormatter.format(value)
		}
	};

	const metricOrder: Metric[] = ['averageAge', 'averageHeight', 'totalMarketValue', 'playerCount'];

	const values = $derived(data.map((item) => item[metric]));
	const minimum = $derived(values.length ? Math.min(...values) : 0);
	const maximum = $derived(values.length ? Math.max(...values) : 0);

	const selectedData = $derived(data.find((item) => item.position === selectedPosition) ?? null);
	const orderedPositions = $derived([...data].sort((a, b) => b[metric] - a[metric]));

	const chartSummary = $derived.by(() => {
		const highestValuePosition = orderedPositions[0];

		if (!highestValuePosition) {
			return `Mapa de posições sem dados para a métrica ${metricConfig[metric].label.toLowerCase()}.`;
		}

		return `Mapa interativo das posições do elenco. A métrica exibida é ${metricConfig[metric].label.toLowerCase()}. ${positions[highestValuePosition.position].label} apresenta o maior valor, com ${metricConfig[metric].format(highestValuePosition[metric])}.`;
	});

	function normalize(value: number): number {
		if (maximum === minimum) return 0.5;
		return (value - minimum) / (maximum - minimum);
	}

	function intensityOf(item: PositionAnalysis): number {
		return normalize(item[metric]);
	}

	const COLD: [number, number, number] = [59, 130, 246];
	const MID: [number, number, number] = [250, 204, 21];
	const HOT: [number, number, number] = [244, 63, 94];

	function mix(a: number, b: number, t: number): number {
		return Math.round(a + (b - a) * t);
	}

	function intensityColor(t: number): string {
		if (t <= 0.5) {
			const k = t / 0.5;
			return `rgb(${mix(COLD[0], MID[0], k)}, ${mix(COLD[1], MID[1], k)}, ${mix(COLD[2], MID[2], k)})`;
		}

		const k = (t - 0.5) / 0.5;
		return `rgb(${mix(MID[0], HOT[0], k)}, ${mix(MID[1], HOT[1], k)}, ${mix(MID[2], HOT[2], k)})`;
	}

	function ringStyle(item: PositionAnalysis): string {
		const t = intensityOf(item);
		const angle = Math.max(10, t * 360);
		const color = intensityColor(t);
		const pos = positions[item.position];

		return `
			left: ${pos.x}%;
			top: ${pos.y}%;
			background: conic-gradient(${color} 0deg ${angle}deg, rgba(255,255,255,0.16) ${angle}deg 360deg);
		`;
	}
</script>

{#snippet metricIcon(key: Metric)}
	{#if key === 'playerCount'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-full w-full"
		>
			<circle cx="8.5" cy="8" r="3" />
			<path d="M2.5 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
			<circle cx="16.5" cy="8.5" r="2.4" />
			<path d="M15 13.6c2.6.3 4.5 2.2 4.5 5" />
		</svg>
	{:else if key === 'averageAge'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-full w-full"
		>
			<path d="M6 3h12" />
			<path d="M6 21h12" />
			<path d="M7 3c0 4 4 5 5 6-1 1-5 2-5 6" />
			<path d="M17 3c0 4-4 5-5 6 1 1 5 2 5 6" />
		</svg>
	{:else if key === 'averageHeight'}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-full w-full"
		>
			<path d="M12 3v18" />
			<path d="M8 7l4-4 4 4" />
			<path d="M8 17l4 4 4-4" />
		</svg>
	{:else}
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.6"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-full w-full"
		>
			<circle cx="12" cy="12" r="8.5" />
			<path
				d="M9.5 9.2c.3-1 1.2-1.6 2.5-1.6 1.6 0 2.7.9 2.7 2 0 2.6-4.4 1.8-4.4 4.3 0 1.1 1.1 2 2.7 2 1.3 0 2.2-.6 2.5-1.6"
			/>
			<path d="M12 6.4v1.2M12 16.4v1.2" />
		</svg>
	{/if}
{/snippet}

<div
	class="flex h-full w-full flex-col"
	role="group"
	aria-label="Mapa de posições do elenco"
	aria-describedby="position-heatmap-summary"
>
	<div class="mb-2 text-[9px] font-semibold uppercase tracking-wide">Métrica exibida no campo</div>

	<div class="mb-3 grid grid-cols-4 gap-1.5">
		{#each metricOrder as key (key)}
			<button
				type="button"
				title={metricConfig[key].label}
				onclick={() => (metric = key)}
				style={metric === key
					? 'background: color-mix(in srgb, var(--golden) 30%, transparent); border-color: var(--golden); color: var(--tertiary);'
					: ''}
				class={`flex flex-col items-center gap-1 rounded-lg border px-1.5 py-1.5 text-[9px] font-semibold transition ${
					metric === key ? '' : 'border-(--tertiary)/10 bg-tertiary-900/60 hover:border-white/20'
				}`}
			>
				<span class="block h-3 w-3">
					{@render metricIcon(key)}
				</span>
				<span class="tracking-wide">{metricConfig[key].pillLabel}</span>
			</button>
		{/each}
	</div>

	<div
		class="relative aspect-[105/68] w-full overflow-hidden rounded-xl shadow-lg ring-1 ring-black/25"
	>
		<svg
			class="absolute inset-0 h-full w-full"
			viewBox="0 0 105 68"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<defs>
				<pattern id="pitch-stripes" width="21" height="68" patternUnits="userSpaceOnUse">
					<rect width="10.5" height="68" fill="#0e6b3e" />
					<rect x="10.5" width="10.5" height="68" fill="#0b5934" />
				</pattern>

				<radialGradient id="pitch-vignette" cx="50%" cy="42%" r="75%">
					<stop offset="55%" stop-color="#000000" stop-opacity="0" />
					<stop offset="100%" stop-color="#000000" stop-opacity="0.38" />
				</radialGradient>
			</defs>

			<rect width="105" height="68" fill="url(#pitch-stripes)" />
			<rect width="105" height="68" fill="url(#pitch-vignette)" />

			<g
				fill="none"
				stroke="rgba(255,255,255,0.8)"
				stroke-width="0.35"
				vector-effect="non-scaling-stroke"
			>
				<rect x="1" y="1" width="103" height="66" rx="1" />
				<line x1="52.5" y1="1" x2="52.5" y2="67" />
				<circle cx="52.5" cy="34" r="9.15" />

				<rect x="1" y="13.84" width="16.5" height="40.32" />
				<rect x="1" y="24.84" width="5.5" height="18.32" />
				<rect x="87.5" y="13.84" width="16.5" height="40.32" />
				<rect x="98.5" y="24.84" width="5.5" height="18.32" />

				<!-- "D" arcs in front of each penalty box -->
				<path d="M17.5,27.56 A9.15,9.15 0 0 1 17.5,40.44" />
				<path d="M87.5,27.56 A9.15,9.15 0 0 0 87.5,40.44" />

				<!-- goal frames -->
				<rect x="0.3" y="30.34" width="0.7" height="7.32" />
				<rect x="104" y="30.34" width="0.7" height="7.32" />

				<!-- corner arcs -->
				<path d="M1,3.5 A2.5,2.5 0 0 1 3.5,1" />
				<path d="M104,3.5 A2.5,2.5 0 0 0 101.5,1" />
				<path d="M1,64.5 A2.5,2.5 0 0 0 3.5,67" />
				<path d="M104,64.5 A2.5,2.5 0 0 1 101.5,67" />
			</g>

			<g fill="rgba(255,255,255,0.85)">
				<circle cx="52.5" cy="34" r="0.45" />
				<circle cx="11" cy="34" r="0.45" />
				<circle cx="94" cy="34" r="0.45" />
			</g>
		</svg>

		{#each data as item (item.position)}
			{@const pos = positions[item.position]}

			<button
				type="button"
				aria-label={`${pos.label}: ${metricConfig[metric].format(item[metric])}`}
				aria-pressed={selectedPosition === item.position}
				onclick={() => {
					selectedPosition = selectedPosition === item.position ? null : item.position;
				}}
				style={ringStyle(item)}
				class={`absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full p-[3px] shadow-md transition hover:z-20 hover:scale-110 sm:h-14 sm:w-14 sm:p-1 lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem] ${
					selectedPosition === item.position ? 'z-20 scale-110' : ''
				}`}
			>
				{#if selectedPosition === item.position}
					<span class="absolute inset-0 -m-1 animate-ping rounded-full bg-white/40 sm:-m-1.5"
					></span>
				{/if}

				<span
					class="relative flex h-full w-full flex-col items-center justify-center rounded-full border border-white/70 bg-slate-950/90 text-center text-white"
				>
					<span
						class="text-[6.5px] font-bold uppercase leading-none tracking-wide text-slate-300 sm:text-[8px] lg:text-[9.5px]"
					>
						{pos.shortLabel}
					</span>
					<span
						class="mt-0.5 max-w-[38px] truncate text-[9px] font-black leading-none sm:max-w-[48px] sm:text-[11px] lg:max-w-[56px] lg:text-[13px]"
					>
						{metricConfig[metric].format(item[metric])}
					</span>
				</span>
			</button>
		{/each}

		{#if selectedData}
			{@const pos = positions[selectedData.position]}
			{@const accent = intensityColor(intensityOf(selectedData))}

			<div
				class="absolute bottom-2 left-1/2 z-30 w-[calc(100%-1rem)] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-xl border border-white/15 bg-slate-950/95 shadow-2xl sm:bottom-3 sm:max-w-[440px] sm:rounded-2xl lg:max-w-[520px]"
				transition:fly={{ y: 24, duration: 220, easing: cubicOut }}
			>
				<div class="h-1 w-full sm:h-1.5" style={`background:${accent}`}></div>

				<div class="px-3 py-2.5 sm:px-5 sm:py-4">
					<div class="flex items-center justify-between gap-2">
						<div class="flex min-w-0 items-center gap-2 sm:gap-3">
							<span
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-[9px] font-bold text-white sm:h-10 sm:w-10 sm:text-xs lg:h-11 lg:w-11 lg:text-sm"
								style={`background:${accent}`}
							>
								{pos.shortLabel}
							</span>

							<div class="min-w-0 leading-tight">
								<strong class="block truncate text-[11px] text-white sm:text-base lg:text-lg">
									{pos.label}
								</strong>
								<span class="block text-[8px] text-slate-400 sm:text-xs">
									Estatísticas da posição
								</span>
							</div>
						</div>

						<button
							type="button"
							aria-label="Fechar detalhes"
							onclick={() => {
								selectedPosition = null;
							}}
							class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white sm:h-7 sm:w-7 sm:text-sm"
						>
							✕
						</button>
					</div>

					<div class="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2.5">
						{#each metricOrder as key (key)}
							<div
								class={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 sm:gap-2.5 sm:rounded-xl sm:px-3.5 sm:py-2.5 ${
									key === metric ? 'border-white/25 bg-white/10' : 'border-white/5 bg-white/[0.03]'
								}`}
							>
								<span class="block h-3 w-3 shrink-0 text-slate-400 sm:h-4 sm:w-4 lg:h-5 lg:w-5">
									{@render metricIcon(key)}
								</span>

								<div class="min-w-0 leading-tight">
									<span
										class="block truncate text-[7.5px] uppercase tracking-wide text-slate-400 sm:text-[10px]"
									>
										{metricConfig[key].pillLabel}
									</span>
									<strong
										class="block truncate text-[10.5px] font-black tabular-nums text-white sm:text-sm lg:text-base"
									>
										{metricConfig[key].format(selectedData[key])}
									</strong>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-2.5 flex items-center gap-2 text-[9px] text-neutral-400">
		<div class="flex flex-col items-start gap-0.5">
			<span class="text-[7.5px] uppercase tracking-wide text-neutral-500">Menor</span>
			<span class="font-semibold tabular-nums text-neutral-300">
				{metricConfig[metric].format(minimum)}
			</span>
		</div>

		<div
			class="h-1.5 flex-1 rounded-full bg-linear-to-r from-blue-500 via-yellow-400 to-rose-500"
		></div>

		<div class="flex flex-col items-end gap-0.5">
			<span class="text-[7.5px] uppercase tracking-wide text-neutral-500">Maior</span>
			<span class="font-semibold tabular-nums text-neutral-300">
				{metricConfig[metric].format(maximum)}
			</span>
		</div>
	</div>

	<AccessibleChartData
		summaryId="position-heatmap-summary"
		summary={chartSummary}
		tableLabel="Ver dados das posições em tabela"
	>
		<table class="min-w-full text-left text-[11px] text-neutral-300">
			<caption class="sr-only">Dados das posições do elenco para todas as métricas</caption>
			<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
				<tr>
					<th scope="col" class="px-2 py-1.5 font-semibold">Posição</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Atletas</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Idade média</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Altura média</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor total</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each orderedPositions as item (item.position)}
					<tr>
						<td class="px-2 py-1.5 font-medium text-neutral-100">
							{positions[item.position].label}
						</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{metricConfig.playerCount.format(item.playerCount)}
						</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{metricConfig.averageAge.format(item.averageAge)}
						</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{metricConfig.averageHeight.format(item.averageHeight)}
						</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{metricConfig.totalMarketValue.format(item.totalMarketValue)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</AccessibleChartData>
</div>
