<script>
	let { data } = $props();

	const club = $derived(data.clubProfile);
	const club_players = $derived(data.clubPlayers);
</script>

Página