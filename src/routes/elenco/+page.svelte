<script>
	import PlayerCard from '$lib/components/player/PlayerCard.svelte';

    let { data } = $props();
	
    const club_players = $derived(data.clubPlayers);
    
	let selectedPlayer = $state(null);
	let loading = $state(false);

    async function openPlayer(playerId) {
		loading = true;

		const response = await fetch(`/api/players/${playerId}`);

		selectedPlayer = await response.json();

		loading = false;
	}
</script>

<ul class="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
	{#each club_players.players as player}
		<PlayerCard data={{ player }} />
	{/each}
</ul>