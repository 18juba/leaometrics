<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart as ChartInstance } from 'chart.js';

	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { ValuablePlayer } from '$lib/types/analysis';
	import { observeWhenVisible } from '$lib/utils/observeWhenVisible';
	import { loadChart } from '$lib/utils/loadChart';

	interface Props {
		data: ValuablePlayer[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: ChartInstance | null = null;

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

	const rankedPlayers = $derived(
		data.toSorted((a, b) => b.marketValue - a.marketValue).slice(0, 10)
	);

	const chartSummary = $derived.by(() => {
		const topPlayer = rankedPlayers[0];

		if (!topPlayer) {
			return 'Gráfico de barras sem jogadores com valor de mercado disponível.';
		}

		return `Gráfico de barras com os ${rankedPlayers.length} jogadores mais valiosos do elenco. ${topPlayer.name} lidera o ranking, com valor de mercado estimado em ${fullCurrencyFormatter.format(topPlayer.marketValue)}.`;
	});

	function buildChartData(players: ValuablePlayer[]) {
		const sortedPlayers = [...players].sort((a, b) => b.marketValue - a.marketValue).slice(0, 10);

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

	function createChart(Chart: typeof import('chart.js/auto').default) {
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

								return `Valor: ${fullCurrencyFormatter.format(player.marketValue)}`;
							},

							afterLabel(context) {
								const player = built.players[context.dataIndex];

								if (!player) return '';

								return [`Posição: ${positionLabels[player.position]}`, `Idade: ${player.age} anos`];
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

	function updateChart(players: ValuablePlayer[]) {
		if (!chart) return;

		const built = buildChartData(players);

		chart.data.labels = built.labels;
		chart.data.datasets = built.datasets;
		chart.update();
	}

	onMount(() => {
		let disposed = false;

		const initializeChart = async () => {
			const Chart = await loadChart();

			if (disposed) return;

			createChart(Chart);
		};

		const stopObserving = observeWhenVisible(canvas, initializeChart);

		return () => {
			disposed = true;
			stopObserving();
			chart?.destroy();
			chart = null;
		};
	});

	$effect(() => {
		const currentData = data;

		if (chart) {
			updateChart(currentData);
		}
	});
</script>

<div class="relative h-80 w-full">
	<canvas
		bind:this={canvas}
		aria-label="Jogadores com maior valor de mercado do elenco"
		aria-describedby="most-valuable-players-summary"
	></canvas>
</div>

<AccessibleChartData
	summaryId="most-valuable-players-summary"
	summary={chartSummary}
	tableLabel="Ver ranking de jogadores em tabela"
>
	<table class="min-w-full text-left text-[11px] text-neutral-300">
		<caption class="sr-only">Ranking dos jogadores com maior valor de mercado</caption>
		<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
			<tr>
				<th scope="col" class="px-2 py-1.5 font-semibold">Jogador</th>
				<th scope="col" class="px-2 py-1.5 font-semibold">Posição</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Idade</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-white/5">
			{#each rankedPlayers as player (player.name)}
				<tr>
					<td class="max-w-42 truncate px-2 py-1.5 font-medium text-neutral-100" title={player.name}
						>{player.name}</td
					>
					<td class="px-2 py-1.5">{positionLabels[player.position]}</td>
					<td class="px-2 py-1.5 text-right tabular-nums">{player.age} anos</td>
					<td class="px-2 py-1.5 text-right tabular-nums">
						{fullCurrencyFormatter.format(player.marketValue)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</AccessibleChartData>
