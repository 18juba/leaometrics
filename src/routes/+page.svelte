<script>
	let { data } = $props();

	const club = $derived(data.clubProfile);
	const club_players = $derived(data.clubPlayers);

	let hideMenu = $state(true);
</script>

Página