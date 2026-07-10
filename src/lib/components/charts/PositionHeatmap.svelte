<script lang="ts">
	import type {
		PlayerPosition,
		PositionAnalysis
	} from '$lib/types/analysis';

	type Metric =
		| 'playerCount'
		| 'averageAge'
		| 'averageHeight'
		| 'totalMarketValue';

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

	const metricOptions: Array<{
		value: Metric;
		label: string;
	}> = [
		{ value: 'playerCount', label: 'Quantidade de Atletas' },
		{ value: 'averageAge', label: 'Média de Idade' },
		{ value: 'averageHeight', label: 'Média de Altura' },
		{ value: 'totalMarketValue', label: 'Valor de Mercado Total' }
	];

	const currencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		notation: 'compact',
		maximumFractionDigits: 1
	});

	const decimalFormatter = new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1
	});

	const values = $derived(
		data.map((item) => item[metric])
	);

	const minimum = $derived(
		values.length ? Math.min(...values) : 0
	);

	const maximum = $derived(
		values.length ? Math.max(...values) : 0
	);

	const selectedData = $derived(
		data.find((item) => item.position === selectedPosition) ?? null
	);

	function normalize(value: number): number {
		if (maximum === minimum) {
			return 0.5;
		}

		return (value - minimum) / (maximum - minimum);
	}

	function markerStyle(item: PositionAnalysis): string {
		const intensity = normalize(item[metric]);

		const hue = 210 - intensity * 210;
		const lightness = 64 - intensity * 18;

		return `
			left: ${positions[item.position].x}%;
			top: ${positions[item.position].y}%;
			background: hsl(${hue} 85% ${lightness}%);
			color: ${intensity > 0.52 ? '#ffffff' : '#0f172a'};
		`;
	}

	function formatMetric(item: PositionAnalysis): string {
		switch (metric) {
			case 'playerCount':
				return String(item.playerCount);

			case 'averageAge':
				return decimalFormatter.format(item.averageAge);

			case 'averageHeight':
				return `${decimalFormatter.format(item.averageHeight)}m`;

			case 'totalMarketValue':
				return currencyFormatter.format(item.totalMarketValue);
		}
	}
</script>

<div class="w-full max-w-[620px]">
	<div class="mb-2 flex items-center justify-between gap-3">
		<h3 class="text-sm font-semibold text-slate-900 dark:text-white">
			Parâmetros por posição
		</h3>

		<select
			bind:value={metric}
			class="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
		>
			{#each metricOptions as option}
				<option value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>
	</div>

	<div
		class="relative aspect-[105/68] w-full overflow-hidden rounded-xl bg-emerald-700 shadow-sm"
	>
		<svg
			class="absolute inset-0 h-full w-full"
			viewBox="0 0 105 68"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			<defs>
				<pattern
					id="compact-pitch-stripes"
					width="21"
					height="68"
					patternUnits="userSpaceOnUse"
				>
					<rect width="10.5" height="68" fill="#15803d" />
					<rect x="10.5" width="10.5" height="68" fill="#166534" />
				</pattern>
			</defs>

			<rect
				width="105"
				height="68"
				fill="url(#compact-pitch-stripes)"
			/>

			<g
				fill="none"
				stroke="rgba(255,255,255,0.78)"
				stroke-width="0.35"
				vector-effect="non-scaling-stroke"
			>
				<rect
					x="1"
					y="1"
					width="103"
					height="66"
					rx="1"
				/>

				<line
					x1="52.5"
					y1="1"
					x2="52.5"
					y2="67"
				/>

				<circle
					cx="52.5"
					cy="34"
					r="9.15"
				/>

				<rect
					x="1"
					y="13.84"
					width="16.5"
					height="40.32"
				/>

				<rect
					x="1"
					y="24.84"
					width="5.5"
					height="18.32"
				/>

				<rect
					x="87.5"
					y="13.84"
					width="16.5"
					height="40.32"
				/>

				<rect
					x="98.5"
					y="24.84"
					width="5.5"
					height="18.32"
				/>
			</g>

			<g fill="rgba(255,255,255,0.85)">
				<circle cx="52.5" cy="34" r="0.45" />
				<circle cx="11" cy="34" r="0.45" />
				<circle cx="94" cy="34" r="0.45" />
			</g>
		</svg>

		{#each data as item (item.position)}
			{@const position = positions[item.position]}

			<button
				type="button"
				aria-label={`${position.label}: ${formatMetric(item)}`}
				aria-pressed={selectedPosition === item.position}
				onclick={() => {
					selectedPosition =
						selectedPosition === item.position
							? null
							: item.position;
				}}
				style={markerStyle(item)}
				class={`absolute z-10 flex h-9 w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border border-white/70 text-center shadow-md transition hover:z-20 hover:scale-110 ${
					selectedPosition === item.position
						? 'z-20 scale-110 ring-2 ring-white'
						: ''
				}`}
			>
				<span class="text-[7px] font-bold leading-none tracking-wide">
					{position.shortLabel}
				</span>
			
				<span class="mt-0.5 max-w-[40px] truncate text-[9px] font-black leading-none">
					{formatMetric(item)}
				</span>
			</button>
		{/each}

		{#if selectedData}
			{@const selectedPlacement = positions[selectedData.position]}

			<div
				class="absolute bottom-2 left-1/2 z-30 w-[calc(100%-1rem)] max-w-[340px] -translate-x-1/2 rounded-lg border border-white/30 bg-slate-950/90 px-3 py-2 text-white shadow-lg backdrop-blur"
			>
				<div class="flex items-center justify-between gap-2">
					<strong class="text-xs">
						{selectedPlacement.label}
					</strong>

					<button
						type="button"
						aria-label="Fechar detalhes"
						onclick={() => {
							selectedPosition = null;
						}}
						class="text-xs text-slate-300 hover:text-white"
					>
						✕
					</button>
				</div>

				<div class="mt-1 grid grid-cols-4 gap-2 text-center">
					<div>
						<span class="block text-[8px] text-slate-400">
							Jogadores
						</span>

						<strong class="text-[10px]">
							{selectedData.playerCount}
						</strong>
					</div>

					<div>
						<span class="block text-[8px] text-slate-400">
							Média de Idade
						</span>

						<strong class="text-[10px]">
							{decimalFormatter.format(selectedData.averageAge)}
						</strong>
					</div>

					<div>
						<span class="block text-[8px] text-slate-400">
							Média de Altura
						</span>

						<strong class="text-[10px]">
							{decimalFormatter.format(selectedData.averageHeight)} cm
						</strong>
					</div>

					<div>
						<span class="block text-[8px] text-slate-400">
							Valor Total
						</span>

						<strong class="text-[10px]">
							{currencyFormatter.format(
								selectedData.totalMarketValue
							)}
						</strong>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
		<span>Menor</span>

		<div
			class="h-1.5 w-20 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500"
		></div>

		<span>Maior</span>
	</div>
</div>