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

	const ageGroupDescriptions: Record<AgeGroup, string> = {
		up_to_21: 'Em desenvolvimento',
		'22_to_25': 'Faixa jovem e competitiva',
		'26_to_29': 'Maturidade esportiva',
		'30_to_33': 'Faixa experiente',
		'34_plus': 'Maior risco de renovação'
	};

	const backgroundColors: Record<AgeGroup, string> = {
		up_to_21: 'rgba(245, 245, 245, 0.9)',
		'22_to_25': 'rgba(16, 185, 129, 0.88)',
		'26_to_29': 'rgba(59, 130, 246, 0.88)',
		'30_to_33': 'rgba(234, 179, 8, 0.88)',
		'34_plus': 'rgba(239, 68, 68, 0.88)'
	};

	const borderColors: Record<AgeGroup, string> = {
		up_to_21: 'rgb(255, 255, 255)',
		'22_to_25': 'rgb(5, 150, 105)',
		'26_to_29': 'rgb(37, 99, 235)',
		'30_to_33': 'rgb(202, 138, 4)',
		'34_plus': 'rgb(220, 38, 38)'
	};

	const hoverColors: Record<AgeGroup, string> = {
		up_to_21: 'rgba(255, 255, 255, 1)',
		'22_to_25': 'rgba(16, 185, 129, 1)',
		'26_to_29': 'rgba(59, 130, 246, 1)',
		'30_to_33': 'rgba(234, 179, 8, 1)',
		'34_plus': 'rgba(239, 68, 68, 1)'
	};

	function getPlayerCount(ageGroup: AgeGroup): number {
		return (
			data.find(
				(item) => item.ageGroup === ageGroup
			)?.playerCount ?? 0
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

						backgroundColor: ageGroupOrder.map(
							(ageGroup) =>
								backgroundColors[ageGroup]
						),

						borderColor: ageGroupOrder.map(
							(ageGroup) =>
								borderColors[ageGroup]
						),

						hoverBackgroundColor: ageGroupOrder.map(
							(ageGroup) =>
								hoverColors[ageGroup]
						),

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

				interaction: {
					mode: 'nearest',
					axis: 'x',
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
								const label =
									items[0]?.label ?? '';

								return `Faixa etária: ${label}`;
							},

							label(context) {
								const playerCount =
									context.parsed.y;

								return `${playerCount} ${
									playerCount === 1
										? 'jogador'
										: 'jogadores'
								}`;
							},

							afterLabel(context) {
								const ageGroup =
									ageGroupOrder[
										context.dataIndex
									];

								const percentage =
									totalPlayers > 0
										? (context.parsed.y /
												totalPlayers) *
											100
										: 0;

								return [
									`${percentage.toLocaleString(
										'pt-BR',
										{
											maximumFractionDigits: 1
										}
									)}% do elenco`,
									`Perfil: ${ageGroupDescriptions[ageGroup]}`
								];
							}
						}
					}
				},

				scales: {
					x: {
						title: {
							display: true,
							text: 'Faixa etária',
							color: '#e5e5e5',

							font: {
								size: 11,
								weight: 600
							}
						},

						grid: {
							display: false
						},

						border: {
							color: 'rgba(255, 255, 255, 0.12)'
						},

						ticks: {
							color: '#f5f5f5',

							font: {
								size: 10,
								weight: 600
							}
						}
					},

					y: {
						beginAtZero: true,
						suggestedMax: highestValue + 1,

						title: {
							display: true,
							text: 'Jogadores',
							color: '#e5e5e5',

							font: {
								size: 11,
								weight: 600
							}
						},

						grid: {
							color:
								'rgba(255, 255, 255, 0.08)'
						},

						border: {
							color:
								'rgba(255, 255, 255, 0.12)'
						},

						ticks: {
							stepSize: 1,
							precision: 0,
							color: '#d4d4d4',

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

<div class="w-full">
	<div class="relative h-80 w-full">
		<canvas
			bind:this={canvas}
			aria-label="Distribuição dos jogadores por faixa etária"
		></canvas>
	</div>

	<div
		class="
			mt-2 flex flex-wrap items-center
			justify-end gap-x-3 gap-y-1
			text-[9px] text-neutral-300
		"
	>
		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-green-500"></span>
			Até 21
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-emerald-500"></span>
			22–25
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-blue-500"></span>
			26–29
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-yellow-500"></span>
			30–33
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-red-500"></span>
			34+
		</span>
	</div>
</div>