<script lang="ts">
	import type { PageData } from './$types';
	import type { ClubAnalysisJson } from '$lib/types/analysis';

	import PositionHeatmap from '$lib/components/charts/PositionHeatmap.svelte';
	import MostValuablePlayersChart from '$lib/components/charts/MostValuablePlayersChart.svelte';
	import AgeVsMarketValueScatterChart from '$lib/components/charts/AgeVsMarketValueScatterChart.svelte';
	import AgeDistributionChart from '$lib/components/charts/AgeDistributionChart.svelte';
	import ContractExpirationDistributionChart from '$lib/components/charts/ContractExpirationDistributionChart.svelte';
	import ExpiringContractsTable from '$lib/components/charts/ExpiringContractsTable.svelte';
	import MarketValueByPositionChart from '$lib/components/charts/MarketValueByPositionChart.svelte';
	import MarketValueByContractYearChart from '$lib/components/charts/MarketValueByContractYearChart.svelte';
	import NationalityDistributionChart from '$lib/components/charts/NationalityDistributionChart.svelte';

	let { data }: { data: PageData } = $props();

	const analysis = data.analysis as ClubAnalysisJson;

	const players = analysis.players;
	const squadAnalysis = analysis.squadAnalysis;
	const referenceDate = analysis.source.analysisReferenceDate;

	const currencyFormatter = new Intl.NumberFormat('pt-BR', {
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

	const decimalFormatter = new Intl.NumberFormat('pt-BR', {
		maximumFractionDigits: 1
	});

	const dateFormatter = new Intl.DateTimeFormat('pt-BR');

	function formatReferenceDate(value: string): string {
		const [year, month, day] = value
			.slice(0, 10)
			.split('-')
			.map(Number);

		if (!year || !month || !day) {
			return value;
		}

		return dateFormatter.format(
			new Date(Date.UTC(year, month - 1, day))
		);
	}

	const expiringWithin60Days = players.filter((player) => {
		const daysRemaining =
			player.analysis.contract.daysRemaining;

		return (
			daysRemaining !== null &&
			daysRemaining >= 0 &&
			daysRemaining <= 60
		);
	}).length;

	const unknownContracts = players.filter(
		(player) =>
			player.analysis.contract.daysRemaining === null
	).length;

	const marketValueAtRiskWithin12Months = players.reduce(
		(total, player) => {
			const daysRemaining =
				player.analysis.contract.daysRemaining;

			if (
				daysRemaining !== null &&
				daysRemaining >= 0 &&
				daysRemaining <= 365
			) {
				return total + (player.marketValue ?? 0);
			}

			return total;
		},
		0
	);

	const totalMarketValue =
		squadAnalysis.totalMarketValue ?? 0;

	const contractRiskPercentage =
		totalMarketValue > 0
			? (marketValueAtRiskWithin12Months /
					totalMarketValue) *
				100
			: 0;

	const primaryNationalityCount = new Set(
		players
			.map((player) => player.nationality?.[0])
			.filter(
				(nationality): nationality is string =>
					Boolean(nationality)
			)
	).size;
</script>

<svelte:head>
	<title>Análise esportiva e financeira</title>

	<meta
		name="description"
		content="Dashboard financeiro e esportivo do elenco"
	/>
</svelte:head>

<div class="flex min-h-screen w-full items-start justify-center">
	<div
		class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12"
	>
		<!-- Cabeçalho principal -->
		<section
			class="
				group relative overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-12
			"
		>
			<div
				class="
					absolute -right-10 -top-10
					h-40 w-40 rounded-full
					bg-(--primary) opacity-10 blur-3xl
					transition-all
					group-hover:opacity-20
				"
			></div>

			<div class="relative">
				<div
					class="
						flex flex-col justify-between gap-6
						md:flex-row md:items-start
					"
				>
					<div>
						<span
							class="
								inline-flex rounded-lg
								bg-(--secondary)/20 px-2.5 py-1
								text-[10px] font-semibold uppercase
								tracking-wider text-(--secondary)
							"
						>
							Análise do elenco
						</span>

						<h1
							class="
								mt-2 text-2xl font-bold
								tracking-tight
								sm:text-3xl
							"
						>
							Painel esportivo e financeiro
						</h1>

						<p
							class="
								mt-1 max-w-2xl
								text-sm text-neutral-400
							"
						>
							Visão consolidada da composição,
							patrimônio e exposição contratual do
							elenco.
						</p>

						<div
							class="
								mt-3 flex items-center gap-2
								text-xs text-neutral-400
							"
						>
							<span
								class="
									h-2 w-2 rounded-full
									bg-emerald-500
								"
							></span>

							Dados atualizados em
							{formatReferenceDate(referenceDate)}
						</div>
					</div>

					<div
						class="
							shrink-0
							md:border-l
							md:border-(--tertiary)/10
							md:pl-8 md:text-right
						"
					>
						<span
							class="
								block text-xs font-semibold
								uppercase tracking-wider
								text-neutral-400
							"
						>
							Valor total do elenco
						</span>

						<span
							class="
								mt-1 block
								text-3xl font-black
								tracking-tight text-(--golden)
								sm:text-4xl lg:text-5xl
							"
							title={fullCurrencyFormatter.format(
								totalMarketValue
							)}
						>
							{currencyFormatter.format(
								totalMarketValue
							)}
						</span>
					</div>
				</div>

				<div
					class="
						mt-8 grid grid-cols-2 gap-5
						border-t border-(--tertiary)/10
						pt-4 sm:grid-cols-4
					"
				>
					<div>
						<span
							class="block text-xs text-neutral-400"
						>
							Atletas analisados
						</span>

						<span class="mt-1 block font-bold">
							{squadAnalysis.playerCount}
						</span>
					</div>

					<div>
						<span
							class="block text-xs text-neutral-400"
						>
							Média de idade
						</span>

						<span class="mt-1 block font-bold">
							{decimalFormatter.format(
								squadAnalysis.averageAge ?? 0
							)}
							anos
						</span>
					</div>

					<div>
						<span
							class="block text-xs text-neutral-400"
						>
							Vencem em 60 dias
						</span>

						<span
							class="
								mt-1 block font-bold
								text-(--golden)
							"
						>
							{expiringWithin60Days}
						</span>
					</div>

					<div>
						<span
							class="block text-xs text-neutral-400"
						>
							Patrimônio em risco
						</span>

						<span
							class="
								mt-1 block font-bold
								text-(--golden)
							"
						>
							{decimalFormatter.format(
								contractRiskPercentage
							)}%
						</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Distribuição por posição -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-5
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--secondary)
					"
				>
					Elenco
				</span>

				<h2 class="mt-1 font-semibold">
					Distribuição por posição
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Composição esportiva e financeira no campo.
				</p>
			</div>

			<PositionHeatmap
				data={squadAnalysis.byPosition}
			/>
		</section>

		<!-- Jogadores valiosos -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-7
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--golden)
					"
				>
					Patrimônio
				</span>

				<h2 class="mt-1 font-semibold">
					Jogadores mais valiosos
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Atletas com maior valor atual de mercado.
				</p>
			</div>

			<MostValuablePlayersChart
				data={squadAnalysis.mostValuablePlayers}
			/>
		</section>

		<!-- Idade versus valor -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-8
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--secondary)
					"
				>
					Perfil financeiro
				</span>

				<h2 class="mt-1 font-semibold">
					Idade versus valor de mercado
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Relação entre idade, valor e posição dos
					jogadores.
				</p>
			</div>

			<AgeVsMarketValueScatterChart
				data={players}
				averageAge={squadAnalysis.averageAge}
				averageMarketValue={squadAnalysis.averageMarketValue}
			/>
		</section>

		<!-- Distribuição etária -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-4
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--secondary)
					"
				>
					Idade
				</span>

				<h2 class="mt-1 font-semibold">
					Distribuição etária
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Quantidade de jogadores por faixa de idade.
				</p>
			</div>

			<AgeDistributionChart
				data={squadAnalysis.byAgeGroup}
			/>
		</section>

		<!-- Contratos -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-7
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--golden)
					"
				>
					Risco contratual
				</span>

				<h2 class="mt-1 font-semibold">
					Tempo restante de contrato
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Distribuição do elenco por prazo de
					vencimento.
				</p>
			</div>

			<ContractExpirationDistributionChart
				data={players}
				referenceDate={referenceDate}
			/>
		</section>

		<!-- Vencimentos próximos -->
		<div class="min-w-0 lg:col-span-5">
			<ExpiringContractsTable
				data={players}
				referenceDate={referenceDate}
			/>
		</div>

		<!-- Valor por posição -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-6
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--golden)
					"
				>
					Concentração financeira
				</span>

				<h2 class="mt-1 font-semibold">
					Valor financeiro por posição
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Patrimônio esportivo concentrado em cada
					posição.
				</p>
			</div>

			<MarketValueByPositionChart
				data={squadAnalysis.byPosition}
			/>
		</section>

		<!-- Valor por vencimento -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-6
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--golden)
					"
				>
					Exposição financeira
				</span>

				<h2 class="mt-1 font-semibold">
					Patrimônio por vencimento
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Valor de mercado exposto em cada ano
					contratual.
				</p>
			</div>

			<MarketValueByContractYearChart
				data={players}
			/>
		</section>

		<!-- Nacionalidades -->
		<section
			class="
				min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-5
			"
		>
			<div class="mb-4">
				<span
					class="
						text-[10px] font-semibold uppercase
						tracking-wider text-(--secondary)
					"
				>
					Origem do elenco
				</span>

				<h2 class="mt-1 font-semibold">
					Nacionalidades
				</h2>

				<p class="mt-1 text-xs text-neutral-400">
					Distribuição pela nacionalidade principal.
				</p>
			</div>

			<NationalityDistributionChart
				data={players}
			/>
		</section>

		<!-- Resumo contratual -->
		<section
			class="
				group relative min-w-0 overflow-hidden
				rounded-2xl border border-(--tertiary)/5
				bg-neutral-800/50 p-6
				backdrop-blur-lg
				lg:col-span-7
			"
		>
			<div
				class="
					absolute -bottom-16 -right-10
					h-40 w-40 rounded-full
					bg-(--golden) opacity-5 blur-3xl
					transition-all
					group-hover:opacity-10
				"
			></div>

			<div class="relative">
				<div class="mb-5">
					<span
						class="
							text-[10px] font-semibold uppercase
							tracking-wider text-(--golden)
						"
					>
						Resumo executivo
					</span>

					<h2 class="mt-1 font-semibold">
						Risco contratual
					</h2>

					<p class="mt-1 text-xs text-neutral-400">
						Exposição financeira para os próximos 12
						meses.
					</p>
				</div>

				<div
					class="
						rounded-xl bg-neutral-900/30 p-4
					"
				>
					<div
						class="
							flex items-end justify-between gap-4
						"
					>
						<div>
							<span
								class="
									text-xs uppercase
									tracking-wider
									text-neutral-400
								"
							>
								Patrimônio exposto
							</span>

							<p
								class="
									mt-1 text-3xl font-black
									text-(--golden)
								"
								title={fullCurrencyFormatter.format(
									marketValueAtRiskWithin12Months
								)}
							>
								{currencyFormatter.format(
									marketValueAtRiskWithin12Months
								)}
							</p>
						</div>

						<span
							class="
								rounded-lg bg-(--golden)
								px-3 py-1
								text-xs font-black
								text-neutral-900
							"
						>
							{decimalFormatter.format(
								contractRiskPercentage
							)}%
						</span>
					</div>

					<div
						class="
							mt-4 h-2 overflow-hidden
							rounded-full bg-neutral-700/60
						"
					>
						<div
							class="
								h-full rounded-full
								bg-(--golden)
								transition-all
							"
							style={`width: ${Math.min(
								contractRiskPercentage,
								100
							)}%`}
						></div>
					</div>

					<p
						class="
							mt-2 text-[11px]
							text-neutral-400
						"
					>
						Percentual do valor do elenco com contrato
						vencendo nos próximos 12 meses.
					</p>
				</div>

				<div
					class="
						mt-4 grid grid-cols-2 gap-3
						sm:grid-cols-3
					"
				>
					<div
						class="
							rounded-xl bg-neutral-900/30 p-3
						"
					>
						<span
							class="
								text-[10px] uppercase
								tracking-wider
								text-neutral-400
							"
						>
							Até 60 dias
						</span>

						<p class="mt-1 text-xl font-bold">
							{expiringWithin60Days}
						</p>
					</div>

					<div
						class="
							rounded-xl bg-neutral-900/30 p-3
						"
					>
						<span
							class="
								text-[10px] uppercase
								tracking-wider
								text-neutral-400
							"
						>
							Sem data
						</span>

						<p class="mt-1 text-xl font-bold">
							{unknownContracts}
						</p>
					</div>

					<div
						class="
							col-span-2 rounded-xl
							bg-neutral-900/30 p-3
							sm:col-span-1
						"
					>
						<span
							class="
								text-[10px] uppercase
								tracking-wider
								text-neutral-400
							"
						>
							Nacionalidades
						</span>

						<p class="mt-1 text-xl font-bold">
							{primaryNationalityCount}
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>