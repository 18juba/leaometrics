<script lang="ts">
	import type { PageData } from './$types';
	import type { ClubAnalysisJson } from '$lib/types/analysis';
	import { formatDateTime } from '$lib/formatters/formatDateTime';

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

	const analysis = data.analysis as ClubAnalysisJson;

	const players = analysis.players;
	const squadAnalysis = analysis.squadAnalysis;
	const referenceDate = analysis.source.analysisReferenceDate;

	const analysisFileUrl = '/data/fortaleza_analysis_10-07-2026.json';
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
			grid w-full grid-cols-1
			gap-3
			md:grid-cols-2
			lg:grid-cols-12
		"
	>
		<!-- Cabeçalho principal -->
<section
	class="
		group relative overflow-hidden
		rounded-xl
		border border-(--tertiary)/5
		bg-neutral-800/50
		p-4
		backdrop-blur-lg
		lg:col-span-12
	"
>
	<div
		class="
			flex flex-col justify-between gap-3
			sm:flex-row sm:items-center
		"
	>
		<div>
			<h2
				class="
					mt-1 text-sm font-bold
					text-neutral-50
				"
			>
				Dados completos da análise atualizada em {formatDateTime(analysis.generatedAt)}
			</h2>

			<p
				class="
					mt-0.5 text-[11px]
				"
			>
				Baixe os dados utilizados nos gráficos em formato JSON. <br/> Fonte: <a href="https://www.transfermarkt.com.br" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">Transfermarkt.com.br</a>
			</p>
		</div>

		<a
			href={analysisFileUrl}
			download="fortaleza_analysis_10-07-2026.json"
			class="
				inline-flex shrink-0 items-center
				justify-center gap-2
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

		<!-- Distribuição por posição -->
<ChartCard
	category="Elenco"
	title="Distribuição por posição"
	description="Indicadores esportivos e financeiros no campo."
	class="lg:col-span-5"
>
	<PositionHeatmap
		data={squadAnalysis.byPosition}
	/>
</ChartCard>

<ChartCard
	category="Perfil financeiro"
	title="Idade versus valor"
	description="Relação entre idade, valor e posição."
	class="lg:col-span-7"
>
	<AgeVsMarketValueScatterChart
		data={players}
		averageAge={squadAnalysis.averageAge}
		averageMarketValue={squadAnalysis.averageMarketValue}
	/>
</ChartCard>

<ChartCard
	category="Patrimônio"
	title="Jogadores mais valiosos"
	description="Atletas com maior valor atual de mercado."
	class="lg:col-span-4"
>
	<MostValuablePlayersChart
		data={squadAnalysis.mostValuablePlayers}
	/>
</ChartCard>

<ChartCard
	category="Concentração financeira"
	title="Valor por posição"
	description="Patrimônio concentrado em cada posição."
	class="lg:col-span-4"
>
	<MarketValueByPositionChart
		data={squadAnalysis.byPosition}
	/>
</ChartCard>

<ChartCard
	category="Exposição financeira"
	title="Patrimônio por vencimento"
	description="Valor de mercado por ano contratual."
	class="lg:col-span-4"
>
	<MarketValueByContractYearChart
		data={players}
	/>
</ChartCard>

<ChartCard
	category="Idade"
	title="Distribuição etária"
	description="Jogadores agrupados por faixa de idade."
	class="lg:col-span-4"
>
	<AgeDistributionChart
		data={squadAnalysis.byAgeGroup}
	/>
</ChartCard>

<ChartCard
	category="Risco contratual"
	title="Tempo restante de contrato"
	description="Distribuição por prazo de vencimento."
	class="lg:col-span-4"
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
	class="lg:col-span-4"
>
	<NationalityDistributionChart
		data={players}
	/>
</ChartCard>

<div class="min-w-0 lg:col-span-12">
	<ExpiringContractsTable
		data={players}
		referenceDate={referenceDate}
	/>
</div>

	</div>
</div>