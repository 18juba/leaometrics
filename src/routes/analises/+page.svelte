<script lang="ts">
	import type { PageData } from './$types';
    import type { ClubAnalysisJson } from '$lib/types/analysis';

	import PositionHeatmap from '$lib/components/charts/PositionHeatmap.svelte';

	let { data }: { data: PageData } = $props();

	const analysis = data.analysis as ClubAnalysisJson;
	const players = analysis.players;
	const squadAnalysis = analysis.squadAnalysis;
</script>

<div class="min-h-screen w-full">
    <PositionHeatmap
	    data={analysis.squadAnalysis.byPosition}
    />

</div>