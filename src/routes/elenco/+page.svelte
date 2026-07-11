<script lang="ts">
	import ElencoFilters from '$lib/components/elenco/ElencoFilters.svelte';
	import ElencoPlayerGrid from '$lib/components/elenco/ElencoPlayerGrid.svelte';
	import ElencoResultsBar from '$lib/components/elenco/ElencoResultsBar.svelte';
	import PlayerDetailsModal from '$lib/components/player/PlayerDetailsModal.svelte';

	import type { PageData } from './$types';
	import type { ClubAnalysisJson } from '$lib/types/analysis';
	import type {
		ClubPlayer,
		FootFilter,
		SortOption
	} from '$lib/components/elenco/elenco.types';

	import {
		filterAndSortPlayers,
		getPositions
	} from '$lib/components/elenco/elenco.utils';

	let { data }: { data: PageData } = $props();

	const analysis = data.analysis as ClubAnalysisJson;
	const players = analysis.players;

	let searchTerm = $state('');
	let selectedPosition = $state('Todas');
	let selectedFoot = $state<FootFilter>('all');
	let sortBy = $state<SortOption>('value-desc');
	let selectedPlayer = $state<ClubPlayer | null>(null);

	const positions = $derived(getPositions(players));

	const filteredPlayers = $derived(
		filterAndSortPlayers(players, {
			searchTerm,
			selectedPosition,
			selectedFoot,
			sortBy
		})
	);

	const hasActiveFilters = $derived(
		Boolean(
			searchTerm.trim() ||
				selectedPosition !== 'Todas' ||
				selectedFoot !== 'all' ||
				sortBy !== 'value-desc'
		)
	);

	function openPlayer(player: ClubPlayer): void {
		selectedPlayer = player;
	}

	function closePlayer(): void {
		selectedPlayer = null;
	}

	function clearFilters(): void {
		searchTerm = '';
		selectedPosition = 'Todas';
		selectedFoot = 'all';
		sortBy = 'value-desc';
	}
</script>

<svelte:head>
	<title>LeãoFut - Elenco</title>
	<meta
		name="description"
		content="Análise do elenco, jogadores e valores de mercado."
	/>
</svelte:head>

<div class="h-full min-h-0 w-full py-2 sm:py-3 md:py-0">
	<div
		class="mx-auto flex h-full min-h-0 w-full max-w-[1800px] flex-col gap-3 sm:gap-4"
	>
		<div class="shrink-0">
			<ElencoFilters
				{positions}
				bind:searchTerm
				bind:selectedPosition
				bind:selectedFoot
				bind:sortBy
				{hasActiveFilters}
				onClear={clearFilters}
			/>
		</div>

		<div class="shrink-0 px-1">
			<ElencoResultsBar
				visiblePlayers={filteredPlayers.length}
				totalPlayers={players.length}
				{selectedPosition}
				{selectedFoot}
				{sortBy}
			/>
		</div>

		<ElencoPlayerGrid
			players={filteredPlayers}
			onOpen={openPlayer}
			onClear={clearFilters}
		/>
	</div>
</div>

{#if selectedPlayer}
	<PlayerDetailsModal
		player={selectedPlayer}
		onClose={closePlayer}
	/>
{/if}
