<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { PlayerPosition, PositionAnalysis } from '$lib/types/analysis';

	interface Props {
		data: PositionAnalysis[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar', number[], string> | null = null;

	const positionLabels: Record<PlayerPosition, string> = {
		Goalkeeper: 'Goleiros',
		'Centre-Back': 'Zagueiros',
		'Right-Back': 'Laterais-direitos',
		'Left-Back': 'Laterais-esquerdos',
		'Defensive Midfield': 'Volantes',
		'Central Midfield': 'Meias centrais',
		'Right Midfield': 'Meias pela direita',
		'Left Midfield': 'Meias pela esquerda',
		'Attacking Midfield': 'Meias ofensivos',
		'Right Winger': 'Pontas-direitas',
		'Left Winger': 'Pontas-esquerdas',
		'Second Striker': 'Segundos atacantes',
		'Centre-Forward': 'Centroavantes'
	};

	const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		notation: 'compact',
		maximumFractionDigits: 1
	});

	const fullCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	});

	const percentageFormatter = new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1
	});

	const sortedPositions = $derived(
		[...data].sort((a, b) => b.totalMarketValue - a.totalMarketValue)
	);

	const totalSquadMarketValue = $derived(
		sortedPositions.reduce((total, position) => total + position.totalMarketValue, 0)
	);

	const chartSummary = $derived.by(() => {
		const highestValuePosition = sortedPositions[0];

		if (!highestValuePosition) {
			return 'Gráfico de barras sem dados de valor de mercado por posição.';
		}

		return `Gráfico de barras com o valor de mercado total por posição. ${positionLabels[highestValuePosition.position]} concentram o maior valor, com ${fullCurrencyFormatter.format(highestValuePosition.totalMarketValue)} entre ${highestValuePosition.playerCount} ${highestValuePosition.playerCount === 1 ? 'jogador' : 'jogadores'}.`;
	});

	onMount(() => {
		chart = new Chart<'bar', number[], string>(canvas, {
			type: 'bar',

			data: {
				labels: sortedPositions.map((position) => positionLabels[position.position]),

				datasets: [
					{
						label: 'Valor de mercado',
						data: sortedPositions.map((position) => position.totalMarketValue),

						backgroundColor: 'rgba(59, 130, 246, 0.82)',

						borderColor: 'rgb(37, 99, 235)',
						borderWidth: 1,

						borderRadius: 5,
						borderSkipped: false,

						barThickness: 18,
						maxBarThickness: 22
					}
				]
			},

			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				animation: false,

				interaction: {
					mode: 'nearest',
					axis: 'y',
					intersect: true
				},

				plugins: {
					legend: {
						display: false
					},

					tooltip: {
						displayColors: false,

						callbacks: {
							title(items) {
								return items[0]?.label ?? '';
							},

							label(context) {
								const position = sortedPositions[context.dataIndex];

								if (!position) {
									return '';
								}

								return `Valor total: ${fullCurrencyFormatter.format(position.totalMarketValue)}`;
							},

							afterLabel(context) {
								const position = sortedPositions[context.dataIndex];

								if (!position) {
									return [];
								}

								const percentage =
									totalSquadMarketValue > 0
										? (position.totalMarketValue / totalSquadMarketValue) * 100
										: 0;

								return [
									`Jogadores: ${position.playerCount}`,
									`Valor médio: ${fullCurrencyFormatter.format(position.averageMarketValue)}`,
									`Participação: ${percentageFormatter.format(percentage)}% do elenco`
								];
							}
						}
					}
				},

				scales: {
					x: {
						beginAtZero: true,

						title: {
							display: true,
							text: 'Valor de mercado',
							font: {
								size: 11
							}
						},

						grid: {
							color: 'rgba(148, 163, 184, 0.16)'
						},

						ticks: {
							font: {
								size: 10
							},

							callback(value) {
								return compactCurrencyFormatter.format(Number(value));
							}
						}
					},

					y: {
						grid: {
							display: false
						},

						ticks: {
							autoSkip: false,

							font: {
								size: 10
							}
						}
					}
				}
			}
		});

		return () => {
			chart?.destroy();
			chart = null;
		};
	});
</script>

<div class="relative h-80 w-full">
	<canvas
		bind:this={canvas}
		aria-label="Valor de mercado total dos jogadores por posição"
		aria-describedby="market-value-position-summary"
	></canvas>
</div>

<AccessibleChartData
	summaryId="market-value-position-summary"
	summary={chartSummary}
	tableLabel="Ver valor de mercado por posição em tabela"
>
	<table class="min-w-full text-left text-[11px] text-neutral-300">
		<caption class="sr-only">Valor de mercado total dos jogadores por posição</caption>
		<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
			<tr>
				<th scope="col" class="px-2 py-1.5 font-semibold">Posição</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Jogadores</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor médio</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor total</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Participação</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-white/5">
			{#each sortedPositions as position (position.position)}
				{@const percentage =
					totalSquadMarketValue > 0 ? (position.totalMarketValue / totalSquadMarketValue) * 100 : 0}
				<tr>
					<td class="px-2 py-1.5 font-medium text-neutral-100">
						{positionLabels[position.position]}
					</td>
					<td class="px-2 py-1.5 text-right tabular-nums">{position.playerCount}</td>
					<td class="px-2 py-1.5 text-right tabular-nums">
						{fullCurrencyFormatter.format(position.averageMarketValue)}
					</td>
					<td class="px-2 py-1.5 text-right tabular-nums">
						{fullCurrencyFormatter.format(position.totalMarketValue)}
					</td>
					<td class="px-2 py-1.5 text-right tabular-nums">
						{percentageFormatter.format(percentage)}%
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</AccessibleChartData>
