<script lang="ts">
	import { resolve } from '$app/paths';
	import CountryFlag from '$lib/components/player/CountryFlag.svelte';
	import PlayerImage from '$lib/components/player/PlayerImage.svelte';
	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import { countryDictionary } from '$lib/dictionaries/countryDictionary';
	import { positionsDictionary } from '$lib/dictionaries/positionsDictionary';
	import type { Player } from '$lib/types/analysis';

	interface Props {
		players: Player[];
		limit?: number;
	}

	type SortOrder = 'asc' | 'desc';

	let { players, limit = 10 }: Props = $props();

	let sortOrder = $state<SortOrder>('desc');

	const rankedPlayers = $derived(
		players
			.toSorted((a, b) => {
				const valueA = Number(a.marketValue) || 0;
				const valueB = Number(b.marketValue) || 0;

				return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
			})
			.slice(0, limit)
	);

	function toggleOrder(): void {
		sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
	}

	function translatePosition(position: string | null | undefined): string {
		if (!position) return 'Sem posição';
		return positionsDictionary[position] ?? position;
	}

	function getPrimaryNationality(player: Player): string {
		return player.nationality?.[0] ?? 'Unknown';
	}

	function translateNationality(nationality: string): string {
		return countryDictionary[nationality] ?? nationality;
	}

	function getPlayerFlag(player: Player): string {
		const translated = translateNationality(getPrimaryNationality(player));
		return translated;
	}
</script>

<section
	class="surface-card flex min-w-0 flex-col rounded-2xl p-4 sm:p-5 md:col-span-2 xl:col-span-1 xl:p-6"
	aria-labelledby="valuable-players-title"
>
	<div class="mb-4 flex items-start justify-between gap-3">
		<h2
			id="valuable-players-title"
			class="min-w-0 text-xs font-semibold tracking-wider text-neutral-400 uppercase sm:text-sm"
		>
			Jogadores {sortOrder === 'asc' ? 'menos' : 'mais'} valiosos
			<span class="ml-1 text-[9px] whitespace-nowrap text-neutral-500 sm:text-[10px]">
				({limit} total)
			</span>
		</h2>

		<button
			type="button"
			onclick={toggleOrder}
			aria-label={sortOrder === 'desc'
				? 'Exibir jogadores menos valiosos'
				: 'Exibir jogadores mais valiosos'}
			title={sortOrder === 'desc' ? 'Ordenar do menor valor' : 'Ordenar do maior valor'}
			class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-(--secondary) text-sm font-bold transition-colors hover:bg-(--secondary)/80"
		>
			<span
				class="inline-block transition-transform duration-200"
				class:rotate-180={sortOrder === 'asc'}
			>
				↓
			</span>
		</button>
	</div>

	<div
		class="custom-scrollbar max-h-64 xl:max-h-70 2xl:max-h-110 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pr-1 sm:space-y-3"
	>
		{#each rankedPlayers as player (player.id)}
			<div
				class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-lg bg-neutral-900/30 p-2 transition-colors hover:bg-neutral-900/60 sm:gap-3"
			>
				<div class="flex min-w-0 items-center gap-2 sm:gap-3">
					<PlayerImage
						playerId={player.id}
						alt={player.name}
						sizes="48px"
						class="size-12 shrink-0 rounded-full bg-(--tertiary)/20 object-contain sm:size-14"
					/>

					<div class="min-w-0 flex-1">
						<div class="flex min-w-0 items-center gap-1.5">
							<span
								class="min-w-0 truncate text-xs font-medium text-neutral-200 sm:text-sm"
								title={player.name}
							>
								{player.name}
							</span>

							<span
								class="inline-flex h-5 w-7 shrink-0 items-center justify-center sm:h-6 sm:w-8"
								title={translateNationality(getPrimaryNationality(player))}
								aria-label={`Nacionalidade: ${translateNationality(getPrimaryNationality(player))}`}
							>
								<CountryFlag
									country={getPlayerFlag(player)}
									class="h-4 w-6 object-contain sm:h-5 sm:w-6"
								/>
							</span>
						</div>

						<span
							class="mt-0.5 block truncate text-sm tracking-tight text-neutral-400"
						>
							{translatePosition(player.position)} •
							{player.age ? `${player.age} anos` : 'Idade N/A'}
						</span>
					</div>
				</div>

				<span
					class="shrink-0 pl-1 text-xs font-bold whitespace-nowrap text-(--golden) sm:pl-2 sm:text-sm"
				>
					{formatCurrency(player.marketValue)}
				</span>
			</div>
		{/each}
	</div>

	<a
		href={resolve('/elenco')}
		class="mt-4 w-full rounded-xl bg-(--secondary) px-4 py-2.5 text-center text-sm font-semibold transition-colors hover:bg-(--secondary)/80"
	>
		Ver elenco completo
	</a>
</section>
