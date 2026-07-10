<script lang="ts">
	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { ClubPlayers } from '$lib/types/clubPlayers';

	import { bandeirasPt } from '$lib/dictionaries/flagsDictionary';

	type ClubPlayer = ClubPlayers['players'][number];

	let {
		player,
		onOpen
	}: {
		player: ClubPlayer;
		onOpen: (player: ClubPlayer) => void;
	} = $props();

	function formatHeight(height: number) {
		if (!height) return 'N/A';

		return height > 3
			? `${height} cm`
			: `${height.toLocaleString('pt-BR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})} m`;
	}

	function formatFoot(foot: string) {
		const normalizedFoot = foot?.trim().toLowerCase();

		const translations: Record<string, string> = {
			right: 'Direito',
			left: 'Esquerdo',
			both: 'Ambos',
			rightfoot: 'Direito',
			leftfoot: 'Esquerdo',
			ambidextrous: 'Ambos',
			direito: 'Direito',
			esquerdo: 'Esquerdo',
			ambos: 'Ambos'
		};

		return translations[normalizedFoot] ?? foot ?? 'N/A';
	}


	function handleImageError(event: Event) {
		const image = event.currentTarget as HTMLImageElement;

		image.onerror = null;
		image.src = '/images/players/placeholder.webp';
	}

</script>

<button
	type="button"
	onclick={() => onOpen(player)}
	aria-haspopup="dialog"
	aria-label={`Abrir análise de ${player.name}`}
	class="
		group
		relative
		w-full
		overflow-hidden
		rounded-2xl
		border border-(--tertiary)/5
		bg-neutral-800/50
		text-left
		backdrop-blur-lg
		transition-all duration-200
		hover:-translate-y-1
		hover:border-(--tertiary)/15
		hover:bg-neutral-800/70
		hover:shadow-2xl
		hover:shadow-black/20
		focus-visible:outline-none
		focus-visible:ring-2
		focus-visible:ring-(--secondary)
	"
>
	<div
		class="
			pointer-events-none
			absolute -right-12 -top-12
			h-36 w-36
			rounded-full
			bg-(--primary)
			opacity-0 blur-3xl
			transition-opacity duration-300
			group-hover:opacity-40
		"
	></div>

	<div
		class="
			relative
			h-52
			overflow-hidden
			border-b border-(--tertiary)/5
			bg-neutral-900/40
		"
	>
		<div class="absolute left-4 top-4 z-10">
			<span
				class="
					inline-flex
					rounded-lg
					border border-white/5
					bg-neutral-950/70
					px-2.5 py-1
					text-[10px] font-bold uppercase tracking-wider
					text-neutral-300
					backdrop-blur-md
				"
			>
				{player.position || 'Sem posição'}
			</span>
		</div>

		<div class="absolute right-4 top-4 z-10 text-right">
			<span
				class="
					block
					text-[9px] font-semibold uppercase tracking-wider
					text-neutral-500
				"
			>
				Valor de mercado
			</span>

			<span class="text-sm font-black text-(--golden)">
				{formatCurrency(Number(player.marketValue) || 0)}
			</span>
		</div>

		<img
			src={`/images/players/${player.id}.webp`}
			alt={player.name}
			onerror={handleImageError}
			class="
				pointer-events-none
				absolute inset-x-0 bottom-0
				mx-auto
				h-[90%] w-[90%]
				select-none
				object-contain object-bottom
				transition-transform duration-300
				group-hover:scale-[1.04]
			"
		/>

		<div
			class="
				pointer-events-none
				absolute inset-x-0 bottom-0
				h-20
				bg-linear-to-t
				from-neutral-900/90
				to-transparent
			"
		></div>
	</div>

	<div class="relative p-5">
		<h2
			class="
				truncate
				text-lg font-bold tracking-tight
				text-neutral-100
				transition-colors
				group-hover:text-(--secondary)
			"
		>
			{player.name}
		</h2>

		<div
			class="mt-2 flex min-h-7 flex-wrap items-center gap-1"
			aria-label={`Nacionalidade: ${player.nationality?.join(', ') || 'não informada'}`}
		>
			{#if player.nationality?.length}
				{#each player.nationality as country (country)}
					<span
						class="
							inline-flex h-7 min-w-8
							items-center
							rounded-lg
						  text-xl leading-none
						"
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
					class="
						inline-flex h-7 min-w-8
						items-center justify-center
						rounded-lg
					    text-lg
					"
					title="Nacionalidade não informada"
				>
					🌐
				</span>
			{/if}
		</div>

		<div class="mt-5 grid grid-cols-3 gap-2">
			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500">
					Idade
				</span>

				<span class="mt-0.5 block text-xs font-bold text-neutral-200">
					{player.age ? `${player.age} anos` : 'N/A'}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500">
					Altura
				</span>

				<span class="mt-0.5 block text-xs font-bold text-neutral-200">
					{formatHeight(player.height)}
				</span>
			</div>

			<div class="rounded-xl bg-neutral-900/40 p-2.5">
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500">
					Pé
				</span>

				<span class="mt-0.5 block truncate text-xs font-bold text-neutral-200">
					{formatFoot(player.foot)}
				</span>
			</div>
		</div>

		<div
			class="
				mt-4
				flex items-center justify-between
				border-t border-(--tertiary)/5
				pt-4
			"
		>
			<div>
				<span class="block text-[9px] uppercase tracking-wider text-neutral-500">
					Análise disponível
				</span>

				<span class="text-[11px] font-medium text-neutral-300">
					Perfil, valor e transferências
				</span>
			</div>

			<span
				class="
					text-lg
					text-(--secondary)
					transition-transform
					group-hover:translate-x-1
				"
			>
				→
			</span>
		</div>
	</div>
</button>