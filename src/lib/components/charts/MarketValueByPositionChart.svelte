<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

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

	onMount(() => {
		const sortedPositions = [...data].sort((a, b) => b.totalMarketValue - a.totalMarketValue);

		const totalSquadMarketValue = sortedPositions.reduce(
			(total, position) => total + position.totalMarketValue,
			0
		);

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
	<canvas bind:this={canvas} aria-label="Valor de mercado total dos jogadores por posição"></canvas>
</div>
