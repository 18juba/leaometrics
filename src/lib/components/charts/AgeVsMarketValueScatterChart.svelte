<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import type { Player, PlayerPosition } from '$lib/types/analysis';

	interface Props {
		data: Player[];
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

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

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

	function buildDatasets(players: Player[]) {
		const validPlayers = players.filter(
			(player) =>
				player.marketValue !== null &&
				player.marketValue > 0 &&
				typeof player.age === 'number'
		);

		const grouped = new Map<PlayerPosition, ScatterPoint[]>();

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

	function createChart() {
		if (!canvas) return;

		const datasets = buildDatasets(data);

		chart = new Chart(canvas, {
			type: 'scatter',
			data: {
				datasets
			},
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

	function updateChart() {
		if (!chart) return;

		chart.data.datasets = buildDatasets(data);
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

<div class="relative h-[420px] w-full">
	<canvas bind:this={canvas}></canvas>
</div>