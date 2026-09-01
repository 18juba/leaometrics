<script lang="ts">
	import type { PageData } from './$types';
	import type { ClubAnalysisJson } from '$lib/types/analysis';

	import { clubInformation } from '$lib/data/clubInformation';
	import ClubOverviewCard from '$lib/components/home/ClubOverviewCard.svelte';
	import StadiumCard from '$lib/components/home/StadiumCard.svelte';
	import ValuablePlayersRanking from '$lib/components/home/ValuablePlayersRanking.svelte';

	let { data }: { data: PageData } = $props();

	const analysis = $derived(data.analysis as ClubAnalysisJson);
	const players = $derived(analysis.players);
	const squadAnalysis = $derived(analysis.squadAnalysis);

	const foreignPlayerCount = $derived(
		players.filter((player) => {
			const primaryNationality = player.nationality?.[0];
			return primaryNationality !== undefined && primaryNationality !== 'Brazil';
		}).length
	);
</script>

<svelte:head>
	<title>LeãoFut - Clube</title>
	<meta
		name="description"
		content="Informações gerais, estádio, elenco e valor de mercado do clube."
	/>
</svelte:head>

<div class="page-shell w-full min-w-0 py-2 sm:py-3 md:py-0">
	<div
		class="mx-auto grid w-full grid-cols-1 gap-3 pb-10 sm:gap-4 md:grid-cols-2 2xl:grid-cols-3 xl:gap-5 2xl:pb-8"
	>
		<ClubOverviewCard
			name={clubInformation.name}
			league={clubInformation.league}
			addressLine1={clubInformation.addressLine1}
			addressLine2={clubInformation.addressLine2}
			foundedOn={clubInformation.foundedOn}
			website={clubInformation.website}
			currentMarketValue={squadAnalysis.totalMarketValue ?? 0}
			squadSize={squadAnalysis.playerCount}
			foreigners={foreignPlayerCount}
		/>

		<StadiumCard
			stadiumName={clubInformation.stadiumName}
			stadiumSeats={clubInformation.stadiumSeats}
		/>

		<ValuablePlayersRanking {players} />
	</div>
</div>
