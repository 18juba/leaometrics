<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	import AccessibleChartData from './AccessibleChartData.svelte';
	import type { Player } from '$lib/types/analysis';

	interface Props {
		data: Player[];
		referenceDate: string;
	}

	type ContractBucketKey =
		'expired' | 'upTo6Months' | 'sixTo12Months' | 'twelveTo24Months' | 'moreThan24Months';

	interface ContractBucket {
		key: ContractBucketKey;
		label: string;
		players: Player[];
	}

	let { data, referenceDate }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart<'bar', number[], string> | null = null;

	const SIX_MONTHS_IN_DAYS = 183;
	const TWELVE_MONTHS_IN_DAYS = 365;
	const TWENTY_FOUR_MONTHS_IN_DAYS = 730;

	function createEmptyBuckets(): ContractBucket[] {
		return [
			{
				key: 'expired',
				label: 'Vencidos',
				players: []
			},
			{
				key: 'upTo6Months',
				label: 'Até 6 meses',
				players: []
			},
			{
				key: 'sixTo12Months',
				label: '6–12 meses',
				players: []
			},
			{
				key: 'twelveTo24Months',
				label: '12–24 meses',
				players: []
			},
			{
				key: 'moreThan24Months',
				label: 'Mais de 24',
				players: []
			}
		];
	}

	function parseISODate(value: string): Date {
		const [year, month, day] = value.split('-').map(Number);

		return new Date(Date.UTC(year, month - 1, day));
	}

	function calculateDaysRemaining(expiresAt: string, referenceDate: string): number {
		const expiration = parseISODate(expiresAt);
		const reference = parseISODate(referenceDate);

		const millisecondsPerDay = 1000 * 60 * 60 * 24;

		return Math.ceil((expiration.getTime() - reference.getTime()) / millisecondsPerDay);
	}

	function buildContractBuckets(players: Player[]): ContractBucket[] {
		const buckets = createEmptyBuckets();

		for (const player of players) {
			const expiresAt = player.analysis.contract.expiresAt ?? player.contract ?? null;

			if (!expiresAt) {
				continue;
			}

			const daysRemaining = calculateDaysRemaining(expiresAt, referenceDate);

			if (daysRemaining < 0) {
				buckets[0].players.push(player);
				continue;
			}

			if (daysRemaining <= SIX_MONTHS_IN_DAYS) {
				buckets[1].players.push(player);
				continue;
			}

			if (daysRemaining <= TWELVE_MONTHS_IN_DAYS) {
				buckets[2].players.push(player);
				continue;
			}

			if (daysRemaining <= TWENTY_FOUR_MONTHS_IN_DAYS) {
				buckets[3].players.push(player);
				continue;
			}

			buckets[4].players.push(player);
		}

		return buckets;
	}

	function formatContractDate(value: string | null): string {
		if (!value) {
			return 'Data desconhecida';
		}

		return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));
	}

	const unknownContractCount = $derived(
		data.filter((player) => player.analysis.contract.daysRemaining === null).length
	);

	const contractBuckets = $derived(buildContractBuckets(data));

	const chartSummary = $derived.by(() => {
		const knownContracts = contractBuckets.reduce(
			(total, bucket) => total + bucket.players.length,
			0
		);
		const largestBucket = contractBuckets.toSorted(
			(a, b) => b.players.length - a.players.length
		)[0];

		if (!largestBucket || knownContracts === 0) {
			return 'Gráfico de barras sem contratos com vencimento conhecido para analisar.';
		}

		const unknownText = unknownContractCount
			? ` ${unknownContractCount} ${unknownContractCount === 1 ? 'jogador não possui' : 'jogadores não possuem'} vencimento conhecido.`
			: '';

		return `Gráfico de barras com ${knownContracts} contratos agrupados pelo tempo restante até o vencimento. A maior concentração está na faixa ${largestBucket.label}, com ${largestBucket.players.length} ${largestBucket.players.length === 1 ? 'jogador' : 'jogadores'}.${unknownText}`;
	});

	onMount(() => {
		const buckets = buildContractBuckets(data);

		const values = buckets.map((bucket) => bucket.players.length);

		const totalKnownContracts = values.reduce((total, value) => total + value, 0);

		const highestValue = Math.max(...values, 0);

		chart = new Chart<'bar', number[], string>(canvas, {
			type: 'bar',

			data: {
				labels: buckets.map((bucket) => bucket.label),

				datasets: [
					{
						label: 'Jogadores',
						data: values,

						backgroundColor: [
							'rgba(220, 38, 38, 0.82)',
							'rgba(249, 115, 22, 0.82)',
							'rgba(234, 179, 8, 0.82)',
							'rgba(59, 130, 246, 0.82)',
							'rgba(34, 197, 94, 0.82)'
						],

						borderColor: [
							'rgb(185, 28, 28)',
							'rgb(234, 88, 12)',
							'rgb(202, 138, 4)',
							'rgb(37, 99, 235)',
							'rgb(22, 163, 74)'
						],

						borderWidth: 1,
						borderRadius: 6,
						borderSkipped: false,

						maxBarThickness: 46,
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
								return items[0]?.label ?? '';
							},

							label(context) {
								const playerCount = context.parsed.y;

								return `${playerCount} ${playerCount === 1 ? 'jogador' : 'jogadores'}`;
							},

							afterLabel(context) {
								if (totalKnownContracts === 0) {
									return '';
								}

								const percentage = (context.parsed.y / totalKnownContracts) * 100;

								return `${percentage.toLocaleString('pt-BR', {
									maximumFractionDigits: 1
								})}% dos contratos conhecidos`;
							},

							afterBody(items) {
								const index = items[0]?.dataIndex;

								if (index === undefined) {
									return [];
								}

								const players = buckets[index].players;

								if (players.length === 0) {
									return [];
								}

								return [
									'',
									...players.map((player) => {
										const expiration = player.analysis.contract.expiresAt;

										return `${player.name} — ${formatContractDate(expiration)}`;
									})
								];
							}
						}
					}
				},

				scales: {
					x: {
						title: {
							display: true,
							text: 'Tempo até o vencimento',
							font: {
								size: 11
							}
						},

						grid: {
							display: false
						},

						ticks: {
							maxRotation: 0,
							minRotation: 0,

							font: {
								size: 9
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

<div class="w-full">
	<div class="relative h-80 w-full">
		<canvas
			bind:this={canvas}
			aria-label="Distribuição do tempo restante dos contratos"
			aria-describedby="contract-expiration-summary"
		></canvas>
	</div>

	{#if unknownContractCount > 0}
		<p class="mt-1 text-right text-[10px] text-slate-400">
			{unknownContractCount}
			{unknownContractCount === 1
				? ' contrato sem vencimento conhecido'
				: ' contratos sem vencimento conhecido'}
		</p>
	{/if}

	<AccessibleChartData
		summaryId="contract-expiration-summary"
		summary={chartSummary}
		tableLabel="Ver vencimentos de contratos em tabela"
	>
		<table class="min-w-full text-left text-[11px] text-neutral-300">
			<caption class="sr-only">Dados da distribuição do tempo restante dos contratos</caption>
			<thead class="text-[10px] tracking-wide text-neutral-400 uppercase">
				<tr>
					<th scope="col" class="px-2 py-1.5 font-semibold">Faixa</th>
					<th scope="col" class="px-2 py-1.5 text-right font-semibold">Jogadores</th>
					<th scope="col" class="px-2 py-1.5 font-semibold">Vencimentos</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-white/5">
				{#each contractBuckets as bucket (bucket.key)}
					<tr>
						<td class="px-2 py-1.5 font-medium text-neutral-100">{bucket.label}</td>
						<td class="px-2 py-1.5 text-right tabular-nums">{bucket.players.length}</td>
						<td class="px-2 py-1.5">
							{#if bucket.players.length > 0}
								<ul class="space-y-1">
									{#each bucket.players as player (player.id)}
										<li>
											{player.name} — {formatContractDate(player.analysis.contract.expiresAt)}
										</li>
									{/each}
								</ul>
							{:else}
								<span class="text-neutral-500">Nenhum jogador</span>
							{/if}
						</td>
					</tr>
				{/each}

				{#if unknownContractCount > 0}
					<tr>
						<td class="px-2 py-1.5 font-medium text-neutral-100">Não informado</td>
						<td class="px-2 py-1.5 text-right tabular-nums">{unknownContractCount}</td>
						<td class="px-2 py-1.5">Vencimento desconhecido</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</AccessibleChartData>
</div>
