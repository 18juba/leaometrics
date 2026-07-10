<script>
	let { data } = $props();

	const player = $derived(data.player);
</script>

<li class="relative rounded-lg w-64 h-80">
    <img
		src={`/images/players/${player.id}.webp`}
		alt={player.name} class="h-24 w-24 object-contain select-none pointer-events-none" 
		onerror={(event) => event.target.src = '/images/players/placeholder.webp'}
	/>
</li>