<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { Chart as ChartInstance, Plugin } from 'chart.js';

	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { Player, PlayerPosition } from '$lib/types/analysis';
	import { observeWhenVisible } from '$lib/utils/observeWhenVisible';
	import { loadChart } from '$lib/utils/loadChart';

	interface Props {
		data: Player[];
		averageAge: number;
		averageMarketValue: number;
	}

	type ScatterPoint = {
		x: number;
		y: number;
		playerName: string;
		position: PlayerPosition;
		translatedPosition: string;
		age: number;
		marketValue: number;
	};

	let { data, averageAge, averageMarketValue }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: ChartInstance | null = null;

	const positionLabels: Record<PlayerPosition, string> = {
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

	const positionColors: Record<PlayerPosition, string> = {
		Goalkeeper: 'rgba(59, 130, 246, 0.9)',
		'Centre-Back': 'rgba(37, 99, 235, 0.9)',
		'Right-Back': 'rgba(14, 165, 233, 0.9)',
		'Left-Back': 'rgba(6, 182, 212, 0.9)',
		'Defensive Midfield': 'rgba(16, 185, 129, 0.9)',
		'Central Midfield': 'rgba(34, 197, 94, 0.9)',
		'Right Midfield': 'rgba(132, 204, 22, 0.9)',
		'Left Midfield': 'rgba(234, 179, 8, 0.9)',
		'Attacking Midfield': 'rgba(249, 115, 22, 0.9)',
		'Right Winger': 'rgba(244, 63, 94, 0.9)',
		'Left Winger': 'rgba(236, 72, 153, 0.9)',
		'Second Striker': 'rgba(168, 85, 247, 0.9)',
		'Centre-Forward': 'rgba(239, 68, 68, 0.9)'
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

	const numberFormatter = new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1
	});

	const accessiblePlayers = $derived(
		data
			.filter(
				(player) =>
					player.marketValue !== null && player.marketValue > 0 && typeof player.age === 'number'
			)
			.toSorted((a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0))
	);

	const chartSummary = $derived.by(() => {
		const highestValuePlayer = accessiblePlayers[0];

		if (!highestValuePlayer) {
			return 'Gráfico de dispersão sem jogadores com idade e valor de mercado disponíveis.';
		}

		return `Gráfico de dispersão com ${accessiblePlayers.length} jogadores, relacionando idade e valor de mercado. A idade média do elenco é ${numberFormatter.format(averageAge)} anos e o valor médio é ${compactCurrencyFormatter.format(averageMarketValue)}. O maior valor entre os dados exibidos pertence a ${highestValuePlayer.name}, com ${fullCurrencyFormatter.format(highestValuePlayer.marketValue ?? 0)}.`;
	});

	function buildDatasets(players: Player[]) {
		const validPlayers = players.filter(
			(player) =>
				player.marketValue !== null && player.marketValue > 0 && typeof player.age === 'number'
		);

		const grouped = new SvelteMap<PlayerPosition, ScatterPoint[]>();

		for (const player of validPlayers) {
			const point: ScatterPoint = {
				x: player.age,
				y: player.marketValue as number,
				playerName: player.name,
				position: player.position,
				translatedPosition: positionLabels[player.position],
				age: player.age,
				marketValue: player.marketValue as number
			};

			if (!grouped.has(player.position)) {
				grouped.set(player.position, []);
			}

			grouped.get(player.position)?.push(point);
		}

		return Array.from(grouped.entries()).map(([position, points]) => ({
			label: positionLabels[position],
			data: points,
			backgroundColor: positionColors[position],
			borderColor: positionColors[position],
			pointRadius: 5,
			pointHoverRadius: 7,
			pointBorderWidth: 1,
			pointBorderColor: '#ffffff'
		}));
	}

	function createAverageLinesPlugin(): Plugin<'scatter'> {
		return {
			id: 'average-lines',
			afterDraw(chart) {
				const chartArea = chart.chartArea;
				const xScale = chart.scales.x;
				const yScale = chart.scales.y;

				if (!chartArea || !xScale || !yScale) return;

				const x = xScale.getPixelForValue(averageAge);
				const y = yScale.getPixelForValue(averageMarketValue);
				const { ctx } = chart;

				const drawLabel = (
					text: string,
					anchorX: number,
					anchorY: number,
					align: 'left' | 'right'
				) => {
					ctx.save();
					ctx.font = '600 10px "IBM Plex Mono", monospace';
					const paddingX = 6;
					const height = 20;
					const width = ctx.measureText(text).width + paddingX * 2;
					const left = Math.min(
						Math.max(align === 'right' ? anchorX - width : anchorX, chartArea.left),
						chartArea.right - width
					);
					const top = Math.min(
						Math.max(anchorY - height / 2, chartArea.top),
						chartArea.bottom - height
					);

					ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
					ctx.fillRect(left, top, width, height);
					ctx.fillStyle = '#ffffff';
					ctx.textBaseline = 'middle';
					ctx.fillText(text, left + paddingX, top + height / 2);
					ctx.restore();
				};

				ctx.save();
				ctx.setLineDash([6, 6]);
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';

				ctx.beginPath();
				ctx.moveTo(x, chartArea.top);
				ctx.lineTo(x, chartArea.bottom);
				ctx.stroke();

				ctx.beginPath();
				ctx.moveTo(chartArea.left, y);
				ctx.lineTo(chartArea.right, y);
				ctx.stroke();
				ctx.restore();

				drawLabel(
					`Idade média: ${numberFormatter.format(averageAge)}`,
					x + 6,
					chartArea.top + 14,
					'left'
				);
				drawLabel(
					`Valor médio: ${compactCurrencyFormatter.format(averageMarketValue)}`,
					chartArea.right - 6,
					y - 12,
					'right'
				);
			}
		};
	}

	function createChart(Chart: typeof import('chart.js/auto').default) {
		if (!canvas) return;

		chart = new Chart(canvas, {
			type: 'scatter',
			data: {
				datasets: buildDatasets(data)
			},
			plugins: [createAverageLinesPlugin()],
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							boxWidth: 10,
							boxHeight: 10,
							usePointStyle: true,
							pointStyle: 'circle',
							font: {
								size: 11
							}
						}
					},
					tooltip: {
						callbacks: {
							title(items) {
								const raw = items[0]?.raw as ScatterPoint | undefined;
								return raw?.playerName ?? '';
							},
							label(context) {
								const raw = context.raw as ScatterPoint | undefined;

								if (!raw) return '';

								return [
									`Posição: ${raw.translatedPosition}`,
									`Idade: ${raw.age} anos`,
									`Valor: ${fullCurrencyFormatter.format(raw.marketValue)}`
								];
							}
						}
					}
				},
				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: 'Idade'
						},
						grid: {
							color: 'rgba(148, 163, 184, 0.16)'
						},
						ticks: {
							stepSize: 2,
							font: {
								size: 10
							}
						}
					},
					y: {
						type: 'logarithmic',
						title: {
							display: true,
							text: 'Valor de mercado'
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
					}
				}
			}
		});
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
</script>

<div class="relative h-130 w-full">
	<canvas
		bind:this={canvas}
		aria-label="Comparação entre idade e valor de mercado"
		aria-describedby="age-market-value-summary"
	></canvas>
</div>

<AccessibleChartData
	summaryId="age-market-value-summary"
	summary={chartSummary}
	tableLabel="Ver idade e valor de mercado em tabela"
>
	<table class="min-w-full text-left text-[11px] text-neutral-300">
		<caption class="sr-only">Dados da comparação entre idade e valor de mercado</caption>
		<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
			<tr>
				<th scope="col" class="px-2 py-1.5 font-semibold">Jogador</th>
				<th scope="col" class="px-2 py-1.5 font-semibold">Posição</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Idade</th>
				<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-white/5">
			{#each accessiblePlayers as player (player.id)}
				<tr>
					<td class="max-w-42 truncate px-2 py-1.5 font-medium text-neutral-100" title={player.name}
						>{player.name}</td
					>
					<td class="px-2 py-1.5">{positionLabels[player.position]}</td>
					<td class="px-2 py-1.5 text-right tabular-nums">{player.age ?? 'N/A'}</td>
					<td class="px-2 py-1.5 text-right tabular-nums">
						{fullCurrencyFormatter.format(player.marketValue ?? 0)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</AccessibleChartData>
