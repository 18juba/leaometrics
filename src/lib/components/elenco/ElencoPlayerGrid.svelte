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

<section class="w-full min-w-0">
	{#if players.length}
		<div class="p-1 pb-4 sm:p-2 sm:pb-6">
			<div
				class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6 2xl:grid-cols-4"
			>
				{#each players as player (player.id)}
					<PlayerCard {player} {onOpen} />
				{/each}
			</div>
		</div>
	{:else}
		<div
			class="flex h-full min-h-88 flex-col items-center justify-center rounded-2xl border border-dashed border-(--tertiary)/10 bg-neutral-800/20 p-5 text-center sm:p-8"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900/60 text-xl sm:h-14 sm:w-14 sm:text-2xl"
			>
				⌕
			</div>

			<h2 class="mt-4 text-base font-bold sm:text-lg">Nenhum atleta encontrado</h2>

			<p class="mt-1 max-w-md text-xs text-neutral-500 sm:text-sm">
				Não encontramos jogadores correspondentes aos filtros selecionados.
			</p>

			<button
				type="button"
				onclick={onClear}
				class="mt-5 rounded-xl bg-(--secondary) px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-80 sm:px-5"
			>
				Limpar filtros
			</button>
		</div>
	{/if}
</section>
