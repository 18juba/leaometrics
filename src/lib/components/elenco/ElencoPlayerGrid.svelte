<script lang="ts">
	import PlayerCard from '$lib/components/player/PlayerCard.svelte';

	import type { ClubPlayer } from './elenco.types';

	let {
		players,
		onOpen,
		onClear
	}: {
		players: ClubPlayer[];
		onOpen: (player: ClubPlayer) => void;
		onClear: () => void;
	} = $props();
</script>

{#if players.length}
	<div
		class="
			grid grid-cols-1 gap-6
			sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
		"
	>
		{#each players as player (player.id)}
			<PlayerCard {player} {onOpen} />
		{/each}
	</div>
{:else}
	<div
		class="
			flex min-h-72 flex-col items-center justify-center
			rounded-2xl border border-dashed
			border-(--tertiary)/10 bg-neutral-800/30
			p-8 text-center
		"
	>
		<div
			class="
				flex h-14 w-14 items-center justify-center
				rounded-full bg-neutral-900/60 text-2xl
			"
		>
			⌕
		</div>

		<h2 class="mt-4 text-lg font-bold">
			Nenhum atleta encontrado
		</h2>

		<p class="mt-1 max-w-md text-sm text-neutral-500">
			Não encontramos jogadores correspondentes aos
			filtros selecionados.
		</p>

		<button
			type="button"
			onclick={onClear}
			class="
				mt-5 rounded-xl bg-(--secondary)
				px-5 py-2.5 text-xs font-bold
				transition-opacity hover:opacity-80
			"
		>
			Limpar filtros
		</button>
	</div>
{/if}