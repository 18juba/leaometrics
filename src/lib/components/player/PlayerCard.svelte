<script lang="ts">
	import PlayerFoot from '$lib/components/player/PlayerFoot.svelte';
	import PlayerImage from '$lib/components/player/PlayerImage.svelte';

	import { formatFoot } from '$lib/formatters/formatFoot';
	import { formatHeight } from '$lib/formatters/formatHeight';
	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import { bandeirasPt } from '$lib/dictionaries/flagsDictionary';
	import { countryDictionary } from '$lib/dictionaries/countryDictionary';

	import type { ClubPlayer } from '$lib/components/elenco/elenco.types';
	import { getPositionLabel } from '$lib/components/elenco/elenco.utils';

	let {
		player,
		onOpen
	}: {
		player: ClubPlayer;
		onOpen: (player: ClubPlayer) => void;
	} = $props();

	const translatedNationalities = $derived(
		(player.nationality ?? []).map((country) => countryDictionary[country] ?? country)
	);
</script>

<button
	type="button"
	onclick={() => onOpen(player)}
	aria-haspopup="dialog"
	aria-label={`Abrir análise de ${player.name}`}
	class="group relative w-full overflow-hidden rounded-2xl border border-(--tertiary)/5 bg-neutral-800/90 text-left transition-all duration-200 hover:-translate-y-1 hover:border-(--tertiary)/15 hover:bg-neutral-800/95 hover:shadow-2xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--secondary)"
>
	<div
		class="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-(--primary) opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
	></div>

	<div class="relative h-52 overflow-hidden border-b border-(--tertiary)/5 bg-neutral-900/40">
		<div class="absolute left-4 top-4 z-10">
			<span
				class="inline-flex rounded-lg border border-white/5 bg-neutral-950/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300"
			>
				{getPositionLabel(player.position)}
			</span>
		</div>

		<div class="absolute right-4 top-4 z-10 text-right">
			<span class="block text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
				Valor de mercado
			</span>

			<span class="text-sm font-black text-(--golden)">
				{formatCurrency(Number(player.marketValue) || 0)}
			</span>
		</div>

		<PlayerImage
			playerId={player.id}
			alt={player.name}
			sizes="(min-width: 1280px) 300px, 90vw"
			class="pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[90%] w-[90%] select-none object-contain object-bottom transition-transform duration-300 group-hover:scale-[1.04]"
		/>

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-neutral-900/90 to-transparent"
		></div>
	</div>

	<div class="relative p-5">
		<div class="flex min-w-0 items-center gap-2">
			<h2
				class="min-w-0 flex-1 truncate text-lg font-bold tracking-tight transition-colors group-hover:text-(--secondary)"
			>
				{player.name}
			</h2>

			<PlayerFoot foot={player.foot} size="sm" />
		</div>

		<div
			class="mt-2 flex min-h-7 flex-wrap items-center gap-1"
			aria-label={`Nacionalidade: ${translatedNationalities.join(', ') || 'não informada'}`}
		>
			{#if translatedNationalities.length}
				{#each translatedNationalities as country (country)}
					<span
						class="inline-flex h-7 min-w-8 items-center rounded-lg text-xl leading-none"
						title={country}
						aria-label={country}
					>
						<span aria-hidden="true">
							{bandeirasPt[country] ?? '🌐'}
						</span>
					</span>
				{/each}
			{:else}
				<span
					class="inline-flex h-7 min-w-8 items-center justify-center rounded-lg text-lg"
					title="Nacionalidade não informada"
				>
					🌐
				</span>
			{/if}
		</div>

		<div class="mt-5 grid grid-cols-3 gap-2">
			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500"> Idade </span>
				<span class="mt-0.5 block text-xs font-bold text-neutral-200">
					{player.age ? `${player.age} anos` : 'N/A'}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500"> Altura </span>
				<span class="mt-0.5 block text-xs font-bold text-neutral-200">
					{formatHeight(player.height)}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500"> Pé </span>
				<span class="mt-0.5 block truncate text-xs font-bold text-neutral-200">
					{formatFoot(player.foot)}
				</span>
			</div>
		</div>

		<div class="mt-4 flex items-center justify-between border-t border-(--tertiary)/5 pt-4">
			<div>
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500">
					Análise disponível
				</span>
				<span class="text-[11px] font-medium text-neutral-300">
					Perfil, valor e transferências
				</span>
			</div>

			<span class="text-lg text-(--secondary) transition-transform group-hover:translate-x-1">
				→
			</span>
		</div>
	</div>
</button>
