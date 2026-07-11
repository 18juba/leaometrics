<script lang="ts">
	import type {
		Chart as ChartInstance,
		ChartConfiguration
	} from 'chart.js';

	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { Player } from '$lib/types/analysis';

	type PlayerMarketValueData = Player['marketValueData'];
	type MarketValueHistoryEntry =
		PlayerMarketValueData['marketValueHistory'][number];

	type OrderedEntry = MarketValueHistoryEntry & {
		timestamp: number;
		originalIndex: number;
	};

	let {
		history
	}: {
		history: PlayerMarketValueData | null | undefined;
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let chart: ChartInstance<'line', number[], string> | null = null;

	const entries = $derived.by((): OrderedEntry[] => {
		const source = history?.marketValueHistory ?? [];

		return source
			.map((entry, originalIndex) => ({
				...entry,
				timestamp: parseApiDate(entry.date),
				originalIndex
			}))
			.sort((entryA, entryB) => {
				const aValid = Number.isFinite(entryA.timestamp);
				const bValid = Number.isFinite(entryB.timestamp);

				if (aValid && bValid) {
					const difference = entryA.timestamp - entryB.timestamp;

					if (difference !== 0) {
						return difference;
					}
				}

				if (aValid && !bValid) return -1;
				if (!aValid && bValid) return 1;

				return entryA.originalIndex - entryB.originalIndex;
			});
	});

	const firstEntry = $derived(entries[0] ?? null);
	const latestEntry = $derived(entries.at(-1) ?? null);

	const highestEntry = $derived.by(() => {
		if (!entries.length) return null;

		return entries.reduce((highest, entry) =>
			Number(entry.marketValue) > Number(highest.marketValue)
				? entry
				: highest
		);
	});

	const firstValue = $derived(Number(firstEntry?.marketValue) || 0);

	const latestValue = $derived(
		Number(history?.marketValue) ||
			Number(latestEntry?.marketValue) ||
			0
	);

	const highestValue = $derived(
		Number(highestEntry?.marketValue) || 0
	);

	const absoluteVariation = $derived(latestValue - firstValue);

	const percentageVariation = $derived(
		firstValue > 0
			? (absoluteVariation / firstValue) * 100
			: 0
	);

	$effect(() => {
		const currentCanvas = canvas;
		const currentEntries = entries;

		if (!currentCanvas || currentEntries.length === 0) {
			chart?.destroy();
			chart = null;
			return;
		}

		let cancelled = false;

		async function renderChart(): Promise<void> {
			const { default: Chart } = await import('chart.js/auto');

			if (cancelled) return;

			chart?.destroy();
			chart = null;

			const context = currentCanvas.getContext('2d');
			if (!context) return;

			const goldenColor = getCssVariable('--golden', '#fbbf24');
			const secondaryColor = getCssVariable('--secondary', '#22c55e');

			const gradient = context.createLinearGradient(
				0,
				0,
				0,
				currentCanvas.clientHeight || 320
			);

			gradient.addColorStop(
				0,
				createTransparentColor(goldenColor, 0.3)
			);
			gradient.addColorStop(
				1,
				createTransparentColor(goldenColor, 0.01)
			);

			const configuration: ChartConfiguration<
				'line',
				number[],
				string
			> = {
				type: 'line',
				data: {
					labels: currentEntries.map((entry) => entry.date),
					datasets: [
						{
							label: 'Valor de mercado',
							data: currentEntries.map(
								(entry) => Number(entry.marketValue) || 0
							),
							borderColor: goldenColor,
							backgroundColor: gradient,
							pointBackgroundColor: secondaryColor,
							pointBorderColor: '#171717',
							pointBorderWidth: 2,
							pointRadius:
								currentEntries.length > 35
									? 2
									: currentEntries.length > 20
										? 3
										: 4,
							pointHoverRadius: 6,
							pointHitRadius: 12,
							borderWidth: 3,
							fill: true,
							tension: 0.25,
							spanGaps: false
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						mode: 'nearest',
						axis: 'x',
						intersect: false
					},
					animation: {
						duration: 350
					},
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							backgroundColor: 'rgba(10, 10, 10, 0.96)',
							titleColor: '#f5f5f5',
							bodyColor: '#d4d4d4',
							borderColor: 'rgba(255, 255, 255, 0.08)',
							borderWidth: 1,
							padding: 12,
							displayColors: false,
							callbacks: {
								title(context) {
									const index = context[0]?.dataIndex;
									const entry = currentEntries[index];

									return entry
										? formatFullDate(entry.date)
										: '';
								},
								label(context) {
									return `Valor: ${formatCurrency(
										Number(context.parsed.y) || 0
									)}`;
								},
								afterLabel(context) {
									const entry = currentEntries[context.dataIndex];
									if (!entry) return [];

									return [
										`Clube: ${entry.clubName || 'Não informado'}`,
										`Idade: ${entry.age} anos`
									];
								}
							}
						}
					},
					scales: {
						x: {
							type: 'category',
							offset: false,
							border: {
								display: false
							},
							grid: {
								display: false
							},
							ticks: {
								color: 'rgba(212, 212, 212, 0.85)',
								maxRotation: 0,
								minRotation: 0,
								autoSkip: true,
								maxTicksLimit: 7,
								callback(value) {
									const isoDate = this.getLabelForValue(
										Number(value)
									);

									return formatAxisDate(isoDate);
								}
							}
						},
						y: {
							beginAtZero: false,
							border: {
								display: false
							},
							grid: {
								color: 'rgba(255, 255, 255, 0.05)'
							},
							ticks: {
								color: 'rgba(212, 212, 212, 0.85)',
								callback(value) {
									return formatCompactCurrency(Number(value));
								}
							}
						}
					}
				}
			};

			chart = new Chart(currentCanvas, configuration);
		}

		void renderChart();

		return () => {
			cancelled = true;
			chart?.destroy();
			chart = null;
		};
	});

	function extractIsoDate(value: string | null | undefined) {
		if (!value) return null;

		const match = String(value)
			.trim()
			.match(/(\d{4})-(\d{2})-(\d{2})/);

		if (!match) return null;

		return {
			year: Number(match[1]),
			month: Number(match[2]),
			day: Number(match[3])
		};
	}

	function parseApiDate(value: string | null | undefined): number {
		const parts = extractIsoDate(value);
		if (!parts) return Number.NaN;

		const timestamp = Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day
		);

		const parsedDate = new Date(timestamp);

		const isValid =
			parsedDate.getUTCFullYear() === parts.year &&
			parsedDate.getUTCMonth() === parts.month - 1 &&
			parsedDate.getUTCDate() === parts.day;

		return isValid ? timestamp : Number.NaN;
	}

	function formatAxisDate(value: string | null | undefined): string {
		const timestamp = parseApiDate(value);
		if (!Number.isFinite(timestamp)) return value || '';

		return new Intl.DateTimeFormat('pt-BR', {
			month: 'short',
			year: '2-digit',
			timeZone: 'UTC'
		}).format(new Date(timestamp));
	}

	function formatFullDate(value: string | null | undefined): string {
		const timestamp = parseApiDate(value);

		if (!Number.isFinite(timestamp)) {
			return value || 'Data não informada';
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(new Date(timestamp));
	}

	function formatCompactCurrency(value: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'EUR',
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(value || 0);
	}

	function getCssVariable(name: string, fallback: string): string {
		const value = getComputedStyle(document.documentElement)
			.getPropertyValue(name)
			.trim();

		return value || fallback;
	}

	function createTransparentColor(color: string, alpha: number): string {
		const hexadecimalMatch = color.match(
			/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i
		);

		if (hexadecimalMatch) {
			const red = Number.parseInt(hexadecimalMatch[1], 16);
			const green = Number.parseInt(hexadecimalMatch[2], 16);
			const blue = Number.parseInt(hexadecimalMatch[3], 16);

			return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
		}

		const shortHexadecimalMatch = color.match(
			/^#([a-f\d])([a-f\d])([a-f\d])$/i
		);

		if (shortHexadecimalMatch) {
			const red = Number.parseInt(
				`${shortHexadecimalMatch[1]}${shortHexadecimalMatch[1]}`,
				16
			);
			const green = Number.parseInt(
				`${shortHexadecimalMatch[2]}${shortHexadecimalMatch[2]}`,
				16
			);
			const blue = Number.parseInt(
				`${shortHexadecimalMatch[3]}${shortHexadecimalMatch[3]}`,
				16
			);

			return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
		}

		const rgbMatch = color.match(
			/^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/i
		);

		if (rgbMatch) {
			return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${alpha})`;
		}

		return `rgba(251, 191, 36, ${alpha})`;
	}
</script>

{#if entries.length > 0}
	<div class="space-y-5">
		<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
			<div class="rounded-xl bg-neutral-950/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Valor atual
				</span>
				<span class="mt-1 block text-lg font-black text-(--golden)">
					{formatCurrency(latestValue)}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-950/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Maior valor
				</span>
				<span class="mt-1 block text-lg font-black text-neutral-100">
					{formatCurrency(highestValue)}
				</span>

				{#if highestEntry}
					<span
						class="mt-1 block truncate text-[10px] text-neutral-500"
						title={highestEntry.clubName}
					>
						{highestEntry.clubName}
					</span>
				{/if}
			</div>

			<div class="rounded-xl bg-neutral-950/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Variação total
				</span>
				<span
					class={`mt-1 block text-lg font-black ${
						percentageVariation >= 0
							? 'text-emerald-400'
							: 'text-red-400'
					}`}
				>
					{percentageVariation >= 0 ? '+' : ''}{percentageVariation.toLocaleString(
						'pt-BR',
						{ maximumFractionDigits: 1 }
					)}%
				</span>
				<span
					class={`mt-1 block text-[10px] ${
						absoluteVariation >= 0
							? 'text-emerald-400/70'
							: 'text-red-400/70'
					}`}
				>
					{absoluteVariation >= 0 ? '+' : ''}{formatCompactCurrency(
						absoluteVariation
					)}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-950/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Avaliações
				</span>
				<span class="mt-1 block text-lg font-black text-neutral-100">
					{entries.length}
				</span>

				{#if firstEntry && latestEntry}
					<span class="mt-1 block text-[10px] text-neutral-500">
						{formatFullDate(firstEntry.date)} – {formatFullDate(latestEntry.date)}
					</span>
				{/if}
			</div>
		</div>

		<div
			class="relative h-72 rounded-2xl border border-(--tertiary)/5 bg-neutral-950/30 p-3 sm:h-80 sm:p-5"
		>
			<canvas
				bind:this={canvas}
				aria-label="Histórico cronológico de valor de mercado"
			></canvas>
		</div>

		<p class="text-[10px] text-neutral-500">
			Do registro mais antigo à esquerda para o mais recente à direita.
		</p>
	</div>
{:else}
	<div
		class="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-(--tertiary)/10 bg-neutral-950/20 p-6 text-center"
	>
		<p class="text-sm text-neutral-500">
			Não há histórico de valor disponível para este atleta.
		</p>
	</div>
{/if}
