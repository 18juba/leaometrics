<script lang="ts">
	let { data } = $props();

	const player = $derived(data.player);

	function formatDate(date: string) {
		return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
	}
</script>

<li class="relative rounded-lg w-64 h-80">
    <img src={'/images/fundo_card.jpg'} alt="Plano de Fundo" class="absolute inset-0 h-full w-full object-cover -z-1" />
    <img src={`/images/players/${player.id}.webp`} alt={player.name} class="h-24 w-24 object-contain select-none pointer-events-none" />
</li>