<script lang="ts">
	import type { PageData } from './$types';
    import type { ClubAnalysisJson } from '$lib/types/analysis';

	import PositionHeatmap from '$lib/components/charts/PositionHeatmap.svelte';
	import MostValuablePlayersChart from '$lib/components/charts/MostValuablePlayersChart.svelte';
    import AgeVsMarketValueScatterChart from '$lib/components/charts/AgeVsMarketValueScatterChart.svelte';

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
</div>