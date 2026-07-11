<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import type {
		AgeGroup,
		AgeGroupAnalysis
	} from '$lib/types/analysis';

	interface Props {
		data: AgeGroupAnalysis[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar', number[], string> | null = null;

	const ageGroupOrder: AgeGroup[] = [
		'up_to_21',
		'22_to_25',
		'26_to_29',
		'30_to_33',
		'34_plus'
	];

	const ageGroupLabels: Record<AgeGroup, string> = {
		up_to_21: 'Até 21',
		'22_to_25': '22–25',
		'26_to_29': '26–29',
		'30_to_33': '30–33',
		'34_plus': '34+'
	};

	function getPlayerCount(ageGroup: AgeGroup): number {
		return (
			data.find((item) => item.ageGroup === ageGroup)?.playerCount ?? 0
		);
	}

	onMount(() => {
		const values = ageGroupOrder.map(getPlayerCount);

		const totalPlayers = values.reduce(
			(total, playerCount) => total + playerCount,
			0
		);

		const highestValue = Math.max(...values, 0);

		chart = new Chart<'bar', number[], string>(canvas, {
			type: 'bar',

			data: {
				labels: ageGroupOrder.map(
					(ageGroup) => ageGroupLabels[ageGroup]
				),

				datasets: [
					{
						label: 'Jogadores',
						data: values,

						backgroundColor: 'rgba(59, 130, 246, 0.82)',
						borderColor: 'rgb(37, 99, 235)',
						borderWidth: 1,

						borderRadius: 6,
						borderSkipped: false,

						maxBarThickness: 48,
						categoryPercentage: 0.72,
						barPercentage: 0.86
					}
				]
			},

			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,

				plugins: {
					legend: {
						display: false
					},

					tooltip: {
						displayColors: false,

						callbacks: {
							title(items) {
								return `Faixa etária: ${items[0]?.label ?? ''}`;
							},

							label(context) {
								const playerCount = context.parsed.y;

								return `${playerCount} ${
									playerCount === 1
										? 'jogador'
										: 'jogadores'
								}`;
							},

							afterLabel(context) {
								if (totalPlayers === 0) {
									return '';
								}

								const percentage =
									(context.parsed.y / totalPlayers) * 100;

								return `${percentage.toLocaleString('pt-BR', {
									maximumFractionDigits: 1
								})}% do elenco`;
							}
						}
					}
				},

				scales: {
					x: {
						title: {
							display: true,
							text: 'Faixa etária',
							font: {
								size: 11
							}
						},

						grid: {
							display: false
						},

						ticks: {
							font: {
								size: 10
							}
						}
					},

					y: {
						beginAtZero: true,
						suggestedMax: highestValue + 1,

						title: {
							display: true,
							text: 'Jogadores',
							font: {
								size: 11
							}
						},

						grid: {
							color: 'rgba(148, 163, 184, 0.16)'
						},

						ticks: {
							stepSize: 1,
							precision: 0,

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
		aria-label="Distribuição dos jogadores por faixa etária"
	></canvas>
</div>