<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import type { Player } from '$lib/types/analysis';

	interface Props {
		data: Player[];
	}

	interface ContractYearGroup {
		year: number;
		players: Player[];
		totalMarketValue: number;
		averageMarketValue: number;
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar', number[], string> | null = null;

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

	function getContractYear(player: Player): number | null {
		const expiresAt =
			player.analysis.contract.expiresAt ??
			player.contract ??
			null;

		if (!expiresAt) {
			return null;
		}

		const year = Number(expiresAt.slice(0, 4));

		if (!Number.isInteger(year) || year < 1900) {
			return null;
		}

		return year;
	}

	function buildContractYearGroups(
		players: Player[]
	): ContractYearGroup[] {
		const groups = new Map<number, Player[]>();

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
					(total, player) =>
						total + (player.marketValue ?? 0),
					0
				);

				const playersWithMarketValue = groupedPlayers.filter(
					(player) => player.marketValue !== null
				);

				const averageMarketValue =
					playersWithMarketValue.length > 0
						? totalMarketValue /
							playersWithMarketValue.length
						: 0;

				return {
					year,
					players: groupedPlayers,
					totalMarketValue,
					averageMarketValue
				};
			})
			.sort((a, b) => a.year - b.year);
	}

	const unknownContractCount = data.filter(
		(player) => getContractYear(player) === null
	).length;

	onMount(() => {
		const groups = buildContractYearGroups(data);

		const totalSquadMarketValue = data.reduce(
			(total, player) =>
				total + (player.marketValue ?? 0),
			0
		);

		chart = new Chart<'bar', number[], string>(canvas, {
			type: 'bar',

			data: {
				labels: groups.map((group) =>
					String(group.year)
				),

				datasets: [
					{
						label: 'Patrimônio exposto',

						data: groups.map(
							(group) => group.totalMarketValue
						),

						backgroundColor:
							'rgba(59, 130, 246, 0.82)',

						borderColor: 'rgb(37, 99, 235)',
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
								const year =
									items[0]?.label ?? '';

								return `Vencimento em ${year}`;
							},

							label(context) {
								const group =
									groups[context.dataIndex];

								if (!group) {
									return '';
								}

								return `Valor total: ${fullCurrencyFormatter.format(
									group.totalMarketValue
								)}`;
							},

							afterLabel(context) {
								const group =
									groups[context.dataIndex];

								if (!group) {
									return [];
								}

								const percentage =
									totalSquadMarketValue > 0
										? (group.totalMarketValue /
												totalSquadMarketValue) *
											100
										: 0;

								return [
									`Jogadores: ${group.players.length}`,
									`Valor médio: ${fullCurrencyFormatter.format(
										group.averageMarketValue
									)}`,
									`Patrimônio do elenco: ${percentageFormatter.format(
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

								const group = groups[index];

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
							color:
								'rgba(148, 163, 184, 0.16)'
						},

						ticks: {
							font: {
								size: 10
							},

							callback(value) {
								return compactCurrencyFormatter.format(
									Number(value)
								);
							}
						}
					},

					y: {
						title: {
							display: true,
							text: 'Ano de vencimento',
							font: {
								size: 11
							}
						},

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

<div class="w-full">
	<div class="relative h-80 w-full">
		<canvas
			bind:this={canvas}
			aria-label="Valor de mercado agrupado pelo ano de vencimento dos contratos"
		></canvas>
	</div>

	{#if unknownContractCount > 0}
		<p class="mt-1 text-right text-[10px] text-slate-400">
			{unknownContractCount}
			{unknownContractCount === 1
				? ' jogador sem vencimento conhecido'
				: ' jogadores sem vencimento conhecido'}
		</p>
	{/if}
</div>