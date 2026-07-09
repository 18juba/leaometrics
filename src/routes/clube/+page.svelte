<script>
    let { data } = $props();

	const club = $derived(data.clubProfile);
	const club_players = $derived(data.clubPlayers);
</script>

<div class="w-full h-full flex items-center justify-center">
	<div class="grid grid-cols-1 lg:grid-cols-3">
		<div class="rel ative bg-(--primary) p-4 w-sm rounded-t-lg">
            <div class="absolute top-full right-0 w-full h-1 bg-(--primary) parallelogram-bottom"
              ></div>
		</div>
	</div>
</div>
