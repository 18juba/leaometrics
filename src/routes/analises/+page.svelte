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

	let { data }: { data: PageData } = $props();

	const analysis = data.analysis as ClubAnalysisJson;
	const players = analysis.players;
	const squadAnalysis = analysis.squadAnalysis;
</script>

<div class="min-h-screen w-full">
    <PositionHeatmap
	    data={analysis.squadAnalysis.byPosition}
    />

    <MostValuablePlayersChart
    	data={analysis.squadAnalysis.mostValuablePlayers}
    />

    <AgeVsMarketValueScatterChart
    	data={analysis.players}
    	averageAge={analysis.squadAnalysis.averageAge}
    	averageMarketValue={analysis.squadAnalysis.averageMarketValue}
    />

    
    <AgeDistributionChart
    	data={analysis.squadAnalysis.byAgeGroup}
    />

    <ContractExpirationDistributionChart
	    data={analysis.players}
	    referenceDate={analysis.source.analysisReferenceDate}
    />

    <ExpiringContractsTable
	    data={analysis.players}
	    referenceDate={analysis.source.analysisReferenceDate}
    />

    <MarketValueByPositionChart
	    data={analysis.squadAnalysis.byPosition}
    />
</div>