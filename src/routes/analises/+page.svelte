<script lang="ts">
	import type { PageData } from './$types';
	import type { ClubAnalysisJson } from '$lib/types/analysis';
	import { formatDateTime } from '$lib/formatters/formatDateTime';
	import { ANALYSIS_JSON_PATH } from '$lib/data/analysisData';

	import PositionHeatmap from '$lib/components/charts/PositionHeatmap.svelte';
	import MostValuablePlayersChart from '$lib/components/charts/MostValuablePlayersChart.svelte';
	import AgeVsMarketValueScatterChart from '$lib/components/charts/AgeVsMarketValueScatterChart.svelte';
	import AgeDistributionChart from '$lib/components/charts/AgeDistributionChart.svelte';
	import ContractExpirationDistributionChart from '$lib/components/charts/ContractExpirationDistributionChart.svelte';
	import ExpiringContractsTable from '$lib/components/charts/ExpiringContractsTable.svelte';
	import MarketValueByPositionChart from '$lib/components/charts/MarketValueByPositionChart.svelte';
	import MarketValueByContractYearChart from '$lib/components/charts/MarketValueByContractYearChart.svelte';
	import NationalityDistributionChart from '$lib/components/charts/NationalityDistributionChart.svelte';
	import ChartCard from '$lib/components/charts/ChartCard.svelte';

	let { data }: { data: PageData } = $props();

	const analysis = $derived<ClubAnalysisJson>(data.analysis);

	const players = $derived(analysis.players);
	const squadAnalysis = $derived(analysis.squadAnalysis);
	const referenceDate = $derived(analysis.source.analysisReferenceDate);
</script>

<svelte:head>
	<title>Análise esportiva e financeira</title>

	<meta
		name="description"
		content="Dashboard financeiro e esportivo do elenco"
	/>
</svelte:head>

<div class="flex w-full items-start justify-center">
	<div
		class="
			grid w-full min-w-0
			grid-cols-1 gap-3
			md:grid-cols-2
			xl:grid-cols-12
			pb-30
			2xl:pb-8
		"
	>
		<!-- Arquivo da análise -->
		<section
			class="
				group relative min-w-0 overflow-hidden
				rounded-xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-3 backdrop-blur-lg
				sm:p-4
				md:col-span-2
				xl:col-span-12
			"
		>
			<div
				class="
					pointer-events-none
					absolute -right-10 -top-10
					h-32 w-32 rounded-full
					bg-(--primary)
					opacity-10 blur-3xl
					transition-opacity
					group-hover:opacity-20
				"
			></div>

			<div
				class="
					relative
					flex flex-col
					gap-3
					sm:flex-row
					sm:items-center
					sm:justify-between
				"
			>
				<div class="min-w-0">
					<h2
						class="
							text-sm font-bold
							leading-snug
							text-neutral-50
							sm:text-base
						"
					>
						Dados completos da análise
					</h2>

					<p
						class="
							mt-0.5
							text-[11px] leading-4
							text-neutral-300
							sm:text-xs
						"
					>
						Atualizada em
						<span class="font-semibold text-neutral-100">
							{formatDateTime(analysis.generatedAt)}
						</span>
					</p>

					<p
						class="
							mt-1
							text-[10px] leading-4
							text-neutral-400
							sm:text-[11px]
						"
					>
						Baixe os dados utilizados nos gráficos em JSON.

						<span class="mx-1 text-neutral-600">
							•
						</span>

						Fonte:

						<a
							href="https://www.transfermarkt.com.br"
							target="_blank"
							rel="noopener noreferrer"
							class="
								font-semibold text-blue-400
								transition-colors
								hover:text-blue-300
								hover:underline
							"
						>
							Transfermarkt.com.br
						</a>
					</p>
				</div>

				<a
					href={ANALYSIS_JSON_PATH}
					download="fortaleza_analysis_19-08-2026.json"
					class="
						inline-flex w-full
						shrink-0 items-center
						justify-center gap-2
						whitespace-nowrap
						rounded-lg
						border border-(--secondary)/30
						bg-(--secondary)
						px-3 py-2
						text-xs font-bold
						transition-colors
						hover:bg-(--secondary)/80
						focus:outline-none
						focus:ring-2
						focus:ring-(--secondary)/30
						sm:w-auto
					"
				>
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 3v12" />
						<path d="m7 10 5 5 5-5" />
						<path d="M5 21h14" />
					</svg>

					Baixar JSON
				</a>
			</div>
		</section>

		<!-- Gráficos principais: largura total no tablet -->
		<ChartCard
			category="Elenco"
			title="Distribuição por posição"
			description="Indicadores esportivos e financeiros no campo."
			class="
				md:col-span-2
				xl:col-span-5
			"
		>
			<PositionHeatmap
				data={squadAnalysis.byPosition}
			/>
		</ChartCard>

		<ChartCard
			category="Perfil financeiro"
			title="Idade versus valor"
			description="Relação entre idade, valor e posição."
			class="
				md:col-span-2
				xl:col-span-7
			"
		>
			<AgeVsMarketValueScatterChart
				data={players}
				averageAge={squadAnalysis.averageAge}
				averageMarketValue={squadAnalysis.averageMarketValue}
			/>
		</ChartCard>

		<!-- Gráficos financeiros -->
		<ChartCard
			category="Patrimônio"
			title="Jogadores mais valiosos"
			description="Atletas com maior valor atual de mercado."
			class="
				md:col-span-1
				xl:col-span-4
			"
		>
			<MostValuablePlayersChart
				data={squadAnalysis.mostValuablePlayers}
			/>
		</ChartCard>

		<ChartCard
			category="Concentração financeira"
			title="Valor por posição"
			description="Patrimônio concentrado em cada posição."
			class="
				md:col-span-1
				xl:col-span-4
			"
		>
			<MarketValueByPositionChart
				data={squadAnalysis.byPosition}
			/>
		</ChartCard>

		<ChartCard
			category="Exposição financeira"
			title="Patrimônio por vencimento"
			description="Valor de mercado por ano contratual."
			class="
				md:col-span-2
				xl:col-span-4
			"
		>
			<MarketValueByContractYearChart
				data={players}
				referenceDate={referenceDate}
			/>
		</ChartCard>

		<!-- Gráficos de composição -->
		<ChartCard
			category="Idade"
			title="Distribuição etária"
			description="Jogadores agrupados por faixa de idade."
			class="
				md:col-span-1
				xl:col-span-4
			"
		>
			<AgeDistributionChart
				data={squadAnalysis.byAgeGroup}
			/>
		</ChartCard>

		<ChartCard
			category="Risco contratual"
			title="Tempo restante de contrato"
			description="Distribuição por prazo de vencimento."
			class="
				md:col-span-1
				xl:col-span-4
			"
		>
			<ContractExpirationDistributionChart
				data={players}
				referenceDate={referenceDate}
			/>
		</ChartCard>

		<ChartCard
			category="Origem do elenco"
			title="Nacionalidades"
			description="Distribuição pela nacionalidade principal."
			class="
				md:col-span-2
				xl:col-span-4
			"
		>
			<NationalityDistributionChart
				data={players}
			/>
		</ChartCard>

		<!-- Tabela completa -->
		<div
			class="
				min-w-0
				md:col-span-2
				xl:col-span-12
			"
		>
			<ExpiringContractsTable
				data={players}
				referenceDate={referenceDate}
			/>
		</div>
	</div>
</div>