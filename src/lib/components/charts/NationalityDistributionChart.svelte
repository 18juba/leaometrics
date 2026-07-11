<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import type { Player } from '$lib/types/analysis';

	type NationalityMetric =
		| 'playerCount'
		| 'totalMarketValue'

	interface Props {
		data: Player[];
		initialMetric?: NationalityMetric;
	}

	interface NationalityGroup {
		nationality: string;
		label: string;
		players: Player[];
		playerCount: number;
		totalMarketValue: number;
		playersWithMarketValue: number;
	}

	let {
		data,
		initialMetric = 'playerCount'
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'doughnut', number[], string> | null = null;

	let selectedMetric = $state<NationalityMetric>(initialMetric);

	/*
	 * Esta variável acompanha a ordem atual dos setores.
	 * O tooltip usa essa mesma ordem para encontrar o grupo correto.
	 */
	let displayedGroups: NationalityGroup[] = [];

	const metricOptions: Array<{
		value: NationalityMetric;
		label: string;
	}> = [
		{
			value: 'playerCount',
			label: 'Jogadores'
		},
		{
			value: 'totalMarketValue',
			label: 'Valor total'
		},
	];

	const metricLabels: Record<NationalityMetric, string> = {
		playerCount: 'Jogadores',
		totalMarketValue: 'Valor total de mercado',
	};

	const nationalityLabels: Record<string, string> = {
		Brazil: 'Brasil',
		Argentina: 'Argentina',
		Italy: 'Itália',
		Spain: 'Espanha',
		Portugal: 'Portugal',
		Colombia: 'Colômbia',
		Poland: 'Polônia',
		Malaysia: 'Malásia',
		Uruguay: 'Uruguai',
		Paraguay: 'Paraguai',
		Chile: 'Chile',
		Ecuador: 'Equador',
		Venezuela: 'Venezuela',
		Mexico: 'México',
		France: 'França',
		Germany: 'Alemanha',
		England: 'Inglaterra',
		'United States': 'Estados Unidos',
		Unknown: 'Não informada'
	};

	const chartColors = [
		'rgba(59, 130, 246, 0.86)',
		'rgba(239, 68, 68, 0.86)',
		'rgba(34, 197, 94, 0.86)',
		'rgba(234, 179, 8, 0.86)',
		'rgba(168, 85, 247, 0.86)',
		'rgba(249, 115, 22, 0.86)',
		'rgba(6, 182, 212, 0.86)',
		'rgba(236, 72, 153, 0.86)',
		'rgba(100, 116, 139, 0.86)',
		'rgba(132, 204, 22, 0.86)'
	];

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

	function translateNationality(nationality: string): string {
		return nationalityLabels[nationality] ?? nationality;
	}

	function getPrimaryNationality(player: Player): string {
		const primaryNationality = player.nationality?.[0]?.trim();

		return primaryNationality || 'Unknown';
	}

	function buildNationalityGroups(
		players: Player[]
	): NationalityGroup[] {
		const groups = new Map<string, Player[]>();

		for (const player of players) {
			const nationality = getPrimaryNationality(player);

			const currentPlayers = groups.get(nationality) ?? [];

			currentPlayers.push(player);
			groups.set(nationality, currentPlayers);
		}

		return Array.from(groups.entries()).map(
			([nationality, groupedPlayers]) => {
				const playersWithMarketValue = groupedPlayers.filter(
					(player) => player.marketValue !== null
				);

				const totalMarketValue = playersWithMarketValue.reduce(
					(total, player) =>
						total + (player.marketValue ?? 0),
					0
				);

				return {
					nationality,
					label: translateNationality(nationality),
					players: groupedPlayers,
					playerCount: groupedPlayers.length,
					totalMarketValue,
					playersWithMarketValue:
						playersWithMarketValue.length
				};
			}
		);
	}

	const nationalityGroups = buildNationalityGroups(data);

	function getMetricValue(
		group: NationalityGroup,
		metric: NationalityMetric
	): number {
		return group[metric];
	}

	function formatMetricValue(
		value: number,
		metric: NationalityMetric
	): string {
		if (metric === 'playerCount') {
			return `${value} ${
				value === 1 ? 'jogador' : 'jogadores'
			}`;
		}

		return fullCurrencyFormatter.format(value);
	}

	function sortGroups(
		metric: NationalityMetric
	): NationalityGroup[] {
		return [...nationalityGroups].sort(
			(a, b) =>
				getMetricValue(b, metric) -
				getMetricValue(a, metric)
		);
	}

	function updateChart(metric: NationalityMetric): void {
		if (!chart) {
			return;
		}

		displayedGroups = sortGroups(metric);

		chart.data.labels = displayedGroups.map(
			(group) => group.label
		);

		chart.data.datasets[0].label = metricLabels[metric];

		chart.data.datasets[0].data = displayedGroups.map(
			(group) => getMetricValue(group, metric)
		);

		/*
		 * A API do Chart.js permite alterar data e labels e depois
		 * chamar update() para renderizar novamente o gráfico.
		 */
		chart.update('none');
	}

	function handleMetricChange(event: Event): void {
		const select = event.currentTarget as HTMLSelectElement;
		const metric = select.value as NationalityMetric;

		selectedMetric = metric;
		updateChart(metric);
	}

	onMount(() => {
		displayedGroups = sortGroups(selectedMetric);

		chart = new Chart<'doughnut', number[], string>(canvas, {
			type: 'doughnut',

			data: {
				labels: displayedGroups.map(
					(group) => group.label
				),

				datasets: [
					{
						label: metricLabels[selectedMetric],

						data: displayedGroups.map((group) =>
							getMetricValue(
								group,
								selectedMetric
							)
						),

						backgroundColor: displayedGroups.map(
							(_, index) =>
								chartColors[
									index % chartColors.length
								]
						),

						borderColor: '#ffffff',
						borderWidth: 2,
						hoverOffset: 6
					}
				]
			},

			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: false,

				/*
				 * Quanto maior o valor, maior o espaço no centro.
				 */
				cutout: '54%',

				plugins: {
					legend: {
						position: 'bottom',

						labels: {
							usePointStyle: true,
							pointStyle: 'circle',

							boxWidth: 8,
							boxHeight: 8,
							padding: 12,

							font: {
								size: 10
							}
						}
					},

					tooltip: {
						displayColors: true,

						callbacks: {
							title(items) {
								return items[0]?.label ?? '';
							},

							label(context) {
								const group =
									displayedGroups[
										context.dataIndex
									];

								if (!group) {
									return '';
								}

								const value = getMetricValue(
									group,
									selectedMetric
								);

								return `${metricLabels[selectedMetric]}: ${formatMetricValue(
									value,
									selectedMetric
								)}`;
							},

							afterLabel(context) {
								const group =
									displayedGroups[
										context.dataIndex
									];

								if (!group) {
									return [];
								}

								const datasetValues =
									displayedGroups.map(
										(item) =>
											getMetricValue(
												item,
												selectedMetric
											)
									);

								const selectedTotal =
									datasetValues.reduce(
										(total, value) =>
											total + value,
										0
									);

								const currentValue = getMetricValue(
									group,
									selectedMetric
								);

								const percentage =
									selectedTotal > 0
										? (currentValue /
												selectedTotal) *
											100
										: 0;

								return [
									`Valor total: ${fullCurrencyFormatter.format(
										group.totalMarketValue
									)}`,
									`Participação: ${percentageFormatter.format(
										percentage
									)}%`
								];
							},

							afterBody(items) {
								const index =
									items[0]?.dataIndex;

								if (index === undefined) {
									return [];
								}

								const group =
									displayedGroups[index];

								if (!group) {
									return [];
								}

								const sortedPlayers = [
									...group.players
								].sort(
									(a, b) =>
										(b.marketValue ?? 0) -
										(a.marketValue ?? 0)
								);

								return [
									'',
									...sortedPlayers.map(
										(player) =>
											`${player.name}: ${
												player.marketValue !== null
													? compactCurrencyFormatter.format(
															player.marketValue
														)
													: 'sem valor'
											}`
									)
								];
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
	<div class="mb-2 flex items-center justify-between gap-3">
		<p class="text-xs text-slate-500 dark:text-slate-400">
			Considera apenas a nacionalidade principal
		</p>

		<select
			value={selectedMetric}
			onchange={handleMetricChange}
			aria-label="Métrica de nacionalidade"
			class="
				cursor-pointer rounded-lg
				border border-(--tertiary)/10
				bg-neutral-900/40
				px-3 py-1.5
				text-xs text-neutral-200
				outline-none
				transition-colors
				hover:bg-neutral-900/70
				focus:border-(--secondary)/50
			"
		>
			{#each metricOptions as option (option.value)}
				<option value={option.value}>
					{option.label}
				</option>
			{/each}
		</select>
	</div>

	<div class="relative h-80 w-full">
		<canvas
			bind:this={canvas}
			aria-label="Distribuição dos jogadores por nacionalidade principal"
		></canvas>
	</div>
</div>