<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { Chart as ChartInstance } from 'chart.js';

	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { Player } from '$lib/types/analysis';
	import { observeWhenVisible } from '$lib/utils/observeWhenVisible';
	import { loadChart } from '$lib/utils/loadChart';

	interface Props {
		data: Player[];
		referenceDate: string;
	}

	interface ContractYearGroup {
		year: number;
		players: Player[];
		totalMarketValue: number;
		averageMarketValue: number;
	}

	let { data, referenceDate }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: ChartInstance<'bar', number[], string> | null = null;

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

	const referenceYear = $derived.by(() => {
		const parsedReferenceYear = Number(referenceDate.slice(0, 4));

		return Number.isInteger(parsedReferenceYear) ? parsedReferenceYear : new Date().getFullYear();
	});

	function getContractYear(player: Player): number | null {
		const expiresAt = player.analysis.contract.expiresAt ?? player.contract ?? null;

		if (!expiresAt) {
			return null;
		}

		const year = Number(expiresAt.slice(0, 4));

		if (!Number.isInteger(year) || year < 1900) {
			return null;
		}

		return year;
	}

	function buildContractYearGroups(players: Player[]): ContractYearGroup[] {
		const groups = new SvelteMap<number, Player[]>();

		for (const player of players) {
			const year = getContractYear(player);

			if (year === null) {
				continue;
			}

			const currentPlayers = groups.get(year) ?? [];

			currentPlayers.push(player);
			groups.set(year, currentPlayers);
		}

		return Array.from(groups.entries())
			.map(([year, groupedPlayers]) => {
				const totalMarketValue = groupedPlayers.reduce(
					(total, player) => total + (player.marketValue ?? 0),
					0
				);

				const playersWithMarketValue = groupedPlayers.filter(
					(player) => player.marketValue !== null
				);

				const averageMarketValue =
					playersWithMarketValue.length > 0 ? totalMarketValue / playersWithMarketValue.length : 0;

				return {
					year,
					players: groupedPlayers,
					totalMarketValue,
					averageMarketValue
				};
			})
			.sort((a, b) => a.year - b.year);
	}

	function getBarBackgroundColor(year: number): string {
		if (year <= referenceYear) {
			return 'rgba(239, 68, 68, 0.88)';
		}

		if (year === referenceYear + 1) {
			return 'rgba(234, 179, 8, 0.88)';
		}

		if (year === referenceYear + 2) {
			return 'rgba(59, 130, 246, 0.88)';
		}

		if (year === referenceYear + 3) {
			return 'rgba(34, 197, 94, 0.88)';
		}

		return 'rgba(245, 245, 245, 0.9)';
	}

	function getBarBorderColor(year: number): string {
		if (year <= referenceYear) {
			return 'rgb(220, 38, 38)';
		}

		if (year === referenceYear + 1) {
			return 'rgb(202, 138, 4)';
		}

		if (year === referenceYear + 2) {
			return 'rgb(37, 99, 235)';
		}

		if (year === referenceYear + 3) {
			return 'rgb(22, 163, 74)';
		}

		return 'rgb(255, 255, 255)';
	}

	function getBarHoverColor(year: number): string {
		if (year <= referenceYear) {
			return 'rgba(239, 68, 68, 1)';
		}

		if (year === referenceYear + 1) {
			return 'rgba(234, 179, 8, 1)';
		}

		if (year === referenceYear + 2) {
			return 'rgba(59, 130, 246, 1)';
		}

		if (year === referenceYear + 3) {
			return 'rgba(34, 197, 94, 1)';
		}

		return 'rgba(255, 255, 255, 1)';
	}

	function getContractRiskLabel(year: number): string {
		if (year < referenceYear) {
			return 'Contratos já vencidos';
		}

		if (year === referenceYear) {
			return 'Vencimento neste ano';
		}

		if (year === referenceYear + 1) {
			return 'Vencimento no próximo ano';
		}

		if (year === referenceYear + 2) {
			return 'Vencimento em dois anos';
		}

		if (year === referenceYear + 3) {
			return 'Prazo confortável';
		}

		return 'Longo prazo';
	}

	const unknownContractCount = $derived(
		data.filter((player) => getContractYear(player) === null).length
	);

	const contractYearGroups = $derived(buildContractYearGroups(data));

	const chartSummary = $derived.by(() => {
		const highestValueGroup = contractYearGroups.toSorted(
			(a, b) => b.totalMarketValue - a.totalMarketValue
		)[0];

		if (!highestValueGroup) {
			return 'Gráfico de barras sem contratos com ano de vencimento conhecido.';
		}

		const unknownText = unknownContractCount
			? ` ${unknownContractCount} ${unknownContractCount === 1 ? 'jogador não possui' : 'jogadores não possuem'} ano de vencimento conhecido.`
			: '';

		return `Gráfico de barras com o valor de mercado agrupado por ano de vencimento dos contratos. O maior patrimônio concentrado está em ${highestValueGroup.year}, com ${fullCurrencyFormatter.format(highestValueGroup.totalMarketValue)} distribuídos entre ${highestValueGroup.players.length} ${highestValueGroup.players.length === 1 ? 'jogador' : 'jogadores'}.${unknownText}`;
	});

	onMount(() => {
		let disposed = false;

		const initializeChart = async () => {
			const Chart = await loadChart();

			if (disposed) return;

			const groups = buildContractYearGroups(data);

			const totalSquadMarketValue = data.reduce(
				(total, player) => total + (player.marketValue ?? 0),
				0
			);

			chart = new Chart<'bar', number[], string>(canvas, {
				type: 'bar',

				data: {
					labels: groups.map((group) => String(group.year)),

					datasets: [
						{
							label: 'Patrimônio exposto',

							data: groups.map((group) => group.totalMarketValue),

							backgroundColor: groups.map((group) => getBarBackgroundColor(group.year)),

							borderColor: groups.map((group) => getBarBorderColor(group.year)),

							hoverBackgroundColor: groups.map((group) => getBarHoverColor(group.year)),

							borderWidth: 1,
							borderRadius: 5,
							borderSkipped: false,

							barThickness: 22,
							maxBarThickness: 26
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
									const year = items[0]?.label ?? '';

									return `Vencimento em ${year}`;
								},

								label(context) {
									const group = groups[context.dataIndex];

									if (!group) {
										return '';
									}

									return `Valor total: ${fullCurrencyFormatter.format(group.totalMarketValue)}`;
								},

								afterLabel(context) {
									const group = groups[context.dataIndex];

									if (!group) {
										return [];
									}

									const percentage =
										totalSquadMarketValue > 0
											? (group.totalMarketValue / totalSquadMarketValue) * 100
											: 0;

									return [
										`Situação: ${getContractRiskLabel(group.year)}`,
										`Jogadores: ${group.players.length}`,
										`Valor médio: ${fullCurrencyFormatter.format(group.averageMarketValue)}`,
										`Patrimônio do elenco: ${percentageFormatter.format(percentage)}%`
									];
								},

								afterBody(items) {
									const index = items[0]?.dataIndex;

									if (index === undefined) {
										return [];
									}

									const group = groups[index];

									if (!group) {
										return [];
									}

									const sortedPlayers = [...group.players].sort(
										(a, b) => (b.marketValue ?? 0) - (a.marketValue ?? 0)
									);

									return [
										'',
										...sortedPlayers.map(
											(player) =>
												`${player.name}: ${
													player.marketValue !== null
														? compactCurrencyFormatter.format(player.marketValue)
														: 'sem valor'
												}`
										)
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
								color: '#e5e5e5',

								font: {
									size: 11,
									weight: 600
								}
							},

							grid: {
								color: 'rgba(255, 255, 255, 0.08)'
							},

							border: {
								color: 'rgba(255, 255, 255, 0.12)'
							},

							ticks: {
								color: '#d4d4d4',

								font: {
									size: 10
								},

								callback(value) {
									return compactCurrencyFormatter.format(Number(value));
								}
							}
						},

						y: {
							title: {
								display: true,
								text: 'Ano de vencimento',
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
								autoSkip: false,
								color: '#f5f5f5',

								font: {
									size: 10,
									weight: 600
								}
							}
						}
					}
				}
			});
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

<div class="flex h-full w-full flex-col">
	<div class="relative h-80 w-full">
		<canvas
			bind:this={canvas}
			aria-label="Valor de mercado agrupado pelo ano de vencimento dos contratos"
			aria-describedby="contract-year-summary"
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
			<span class="h-2 w-2 rounded-sm bg-red-500"></span>
			{referenceYear}
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-yellow-500"></span>
			{referenceYear + 1}
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-blue-500"></span>
			{referenceYear + 2}
		</span>

		<span class="inline-flex items-center gap-1">
			<span class="h-2 w-2 rounded-sm bg-green-500"></span>
			{referenceYear + 3}
		</span>

		<span class="inline-flex items-center gap-1">
			<span
				class="
					h-2 w-2 rounded-sm
					border border-neutral-300
					bg-neutral-100
				"
			></span>

			Após {referenceYear + 3}
		</span>
	</div>

	{#if unknownContractCount > 0}
		<p
			class="
				mt-1 text-right
				text-[10px] text-neutral-400
			"
		>
			{unknownContractCount}

			{unknownContractCount === 1
				? ' jogador sem vencimento conhecido'
				: ' jogadores sem vencimento conhecido'}
		</p>
	{/if}

	<AccessibleChartData
		summaryId="contract-year-summary"
		summary={chartSummary}
		tableLabel="Ver valor por ano de vencimento em tabela"
	>
		<table class="min-w-full text-left text-[11px] text-neutral-300">
			<caption class="sr-only"
				>Valor de mercado agrupado pelo ano de vencimento dos contratos</caption
			>
			<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
				<tr>
					<th scope="col" class="px-2 py-1.5 font-semibold">Ano</th>
					<th scope="col" class="px-2 py-1.5 font-semibold">Situação</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Jogadores</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor total</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Valor médio</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each contractYearGroups as group (group.year)}
					<tr>
						<td class="px-2 py-1.5 font-medium text-neutral-100">{group.year}</td>
						<td class="px-2 py-1.5">{getContractRiskLabel(group.year)}</td>
						<td class="px-2 py-1.5 text-right tabular-nums">{group.players.length}</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{fullCurrencyFormatter.format(group.totalMarketValue)}
						</td>
						<td class="px-2 py-1.5 text-right tabular-nums">
							{fullCurrencyFormatter.format(group.averageMarketValue)}
						</td>
					</tr>
				{/each}

				{#if unknownContractCount > 0}
					<tr>
						<td class="px-2 py-1.5 font-medium text-neutral-100">Não informado</td>
						<td class="px-2 py-1.5">Ano desconhecido</td>
						<td class="px-2 py-1.5 text-right tabular-nums">{unknownContractCount}</td>
						<td colspan="2" class="px-2 py-1.5 text-right text-neutral-500">—</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</AccessibleChartData>
</div>
