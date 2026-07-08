<script>
	import { Icon } from '@lucide/svelte';
	import { soccerPitch } from '@lucide/lab';
	let { data } = $props();

	const club = $derived(data.clubProfile);
	const club_players = $derived(data.clubPlayers);
</script>

<header class="w-fit flex items-center gap-6 bg-(--secondary)/15 p-4 border-2 border-(--secondary)/50 rounded-xl ml-6 mt-6 backdrop-blur-sm shadow shadow-sky-600/20">
	<Icon iconNode={soccerPitch} size={32} color="white" class="cursor-pointer" />
</header>

<img src="/images/escudo.png" alt="Escudo do Fortaleza" class="w-md select-none pointer-events-none"/>