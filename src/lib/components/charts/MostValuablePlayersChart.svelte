<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import type { ValuablePlayer } from '$lib/types/analysis';

	interface Props {
		data: ValuablePlayer[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	const positionLabels: Record<ValuablePlayer['position'], string> = {
	Goalkeeper: 'Goleiro',
	'Centre-Back': 'Zagueiro',
	'Right-Back': 'Lateral-direito',
	'Left-Back': 'Lateral-esquerdo',
	'Defensive Midfield': 'Volante',
	'Central Midfield': 'Meio-campista central',
	'Right Midfield': 'Meia-direita',
	'Left Midfield': 'Meia-esquerda',
	'Attacking Midfield': 'Meia ofensivo',
	'Right Winger': 'Ponta-direita',
	'Left Winger': 'Ponta-esquerda',
	'Second Striker': 'Segundo atacante',
	'Centre-Forward': 'Centroavante'
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

	function buildChartData(players: ValuablePlayer[]) {
		const sortedPlayers = [...players]
			.sort((a, b) => b.marketValue - a.marketValue)
			.slice(0, 10);

		return {
			labels: sortedPlayers.map((player) => player.name),
			datasets: [
				{
					label: 'Valor de mercado',
					data: sortedPlayers.map((player) => player.marketValue),
					backgroundColor: 'rgba(59, 130, 246, 0.82)',
					borderColor: 'rgb(37, 99, 235)',
					borderWidth: 1,
					borderRadius: 5,
					barThickness: 18
				}
			],
			players: sortedPlayers
		};
	}

	function createChart() {
		if (!canvas) return;

		const built = buildChartData(data);

		chart = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: built.labels,
				datasets: built.datasets
			},
			options: {
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							title(items) {
								const index = items[0]?.dataIndex ?? 0;
								return built.players[index]?.name ?? '';
							},
						
							label(context) {
								const player = built.players[context.dataIndex];
							
								if (!player) return '';
							
								return `Valor: ${fullCurrencyFormatter.format(
									player.marketValue
								)}`;
							},
						
							afterLabel(context) {
								const player = built.players[context.dataIndex];
							
								if (!player) return '';
							
								return [
									`Posição: ${positionLabels[player.position]}`,
									`Idade: ${player.age} anos`
								];
							}
						}
					}
				},
				scales: {
					x: {
						beginAtZero: true,
						grid: {
							color: 'rgba(148, 163, 184, 0.18)'
						},
						ticks: {
							callback(value) {
								return compactCurrencyFormatter.format(Number(value));
							},
							font: {
								size: 10
							}
						}
					},
					y: {
						grid: {
							display: false
						},
						ticks: {
							font: {
								size: 11
							}
						}
					}
				}
			}
		});
	}

	function updateChart() {
		if (!chart) return;

		const built = buildChartData(data);

		chart.data.labels = built.labels;
		chart.data.datasets = built.datasets;
		chart.update();
	}

	onMount(() => {
		createChart();

		return () => {
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		data;

		if (chart) {
			updateChart();
		}
	});
</script>

<div class="relative h-[300px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>