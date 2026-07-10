<script lang="ts">
	import PlayerCard from '$lib/components/player/PlayerCard.svelte';
	import PlayerDetailsModal from '$lib/components/player/PlayerDetailsModal.svelte';

	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { ClubPlayers } from '$lib/types/clubPlayers';

	type ClubPlayer = ClubPlayers['players'][number];

	type SortOption =
		| 'marketValue-desc'
		| 'marketValue-asc'
		| 'name-asc'
		| 'age-asc'
		| 'age-desc';

	let {
		data
	}: {
		data: {
			clubPlayers?: ClubPlayers;
		};
	} = $props();

	let searchTerm = $state('');
	let selectedPosition = $state('Todas');
	let sortBy = $state<SortOption>('marketValue-desc');
	let selectedPlayer = $state<ClubPlayer | null>(null);

	const players = $derived(data.clubPlayers?.players ?? []);

	const positions = $derived(
		[
			...new Set(
				players
					.map((player) => player.position?.trim())
					.filter((position): position is string => Boolean(position))
			)
		].toSorted((a, b) => a.localeCompare(b, 'pt-BR'))
	);

	const totalMarketValue = $derived(
		players.reduce((total, player) => {
			return total + (Number(player.marketValue) || 0);
		}, 0)
	);

	const averageAge = $derived.by(() => {
		const ages = players
			.map((player) => Number(player.age))
			.filter((age) => Number.isFinite(age) && age > 0);

		if (!ages.length) return 0;

		return ages.reduce((total, age) => total + age, 0) / ages.length;
	});

	const mostValuablePlayer = $derived(
		players.toSorted((a, b) => {
			return getMarketValue(b) - getMarketValue(a);
		})[0] ?? null
	);

	const filteredPlayers = $derived.by(() => {
		const normalizedSearch = normalizeText(searchTerm);

		const result = players.filter((player) => {
			const matchesPosition =
				selectedPosition === 'Todas' ||
				player.position === selectedPosition;

			if (!matchesPosition) return false;
			if (!normalizedSearch) return true;

			const searchableContent = [
				player.name,
				player.position,
				player.signedFrom,
				...(player.nationality ?? [])
			]
				.map((value) => normalizeText(value))
				.join(' ');

			return searchableContent.includes(normalizedSearch);
		});

		return result.toSorted((a, b) => {
			switch (sortBy) {
				case 'marketValue-asc':
					return getMarketValue(a) - getMarketValue(b);

				case 'name-asc':
					return a.name.localeCompare(b.name, 'pt-BR');

				case 'age-asc':
					return (Number(a.age) || 0) - (Number(b.age) || 0);

				case 'age-desc':
					return (Number(b.age) || 0) - (Number(a.age) || 0);

				case 'marketValue-desc':
				default:
					return getMarketValue(b) - getMarketValue(a);
			}
		});
	});

	const lastUpdated = $derived(
		formatDateTime(data.clubPlayers?.updatedAt)
	);

	function getMarketValue(player: ClubPlayer) {
		return Number(player.marketValue) || 0;
	}

	function normalizeText(value: string | null | undefined) {
		return String(value ?? '')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.trim();
	}

	function openPlayer(player: ClubPlayer) {
		selectedPlayer = player;
	}

	function closePlayer() {
		selectedPlayer = null;
	}

	function clearFilters() {
		searchTerm = '';
		selectedPosition = 'Todas';
		sortBy = 'marketValue-desc';
	}

	function formatDateTime(value: string | undefined) {
		if (!value) return 'N/A';

		const date = new Date(value);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Elenco do clube</title>

	<meta
		name="description"
		content="Análise do elenco, jogadores e valores de mercado."
	/>
</svelte:head>

<div class="min-h-screen w-full px-4 py-8 sm:px-6 lg:px-8">
	<div class="mx-auto w-full max-w-7xl space-y-6">
		<section
			class="
				group
				relative overflow-hidden
				rounded-2xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-6
				backdrop-blur-lg
				sm:p-8
			"
		>
			<div
				class="
					pointer-events-none
					absolute -right-16 -top-16
					h-56 w-56
					rounded-full
					bg-(--primary)
					opacity-10 blur-3xl
					transition-opacity
					group-hover:opacity-20
				"
			></div>

			<div
				class="
					relative
					flex flex-col gap-8
					lg:flex-row
					lg:items-end
					lg:justify-between
				"
			>
				<div>
					<span
						class="
							text-xs font-semibold uppercase
							tracking-[0.2em]
							text-(--golden)
						"
					>
						Análise do plantel
					</span>

					<h1 class="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
						Elenco do clube
					</h1>

					<p
						class="
							mt-2 max-w-2xl
							text-sm leading-relaxed
							text-neutral-400
						"
					>
						Explore o perfil dos atletas, evolução de valor de
						mercado e histórico de transferências.
					</p>

					<p
						class="
							mt-4
							text-[10px] uppercase tracking-wider
							text-neutral-500
						"
					>
						Última atualização: {lastUpdated}
					</p>
				</div>

				<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
					<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
						<span
							class="
								text-[10px] uppercase tracking-wider
								text-neutral-500
							"
						>
							Atletas
						</span>

						<span
							class="
								mt-1 block
								text-2xl font-black text-neutral-100
							"
						>
							{players.length}
						</span>
					</div>

					<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
						<span
							class="
								text-[10px] uppercase tracking-wider
								text-neutral-500
							"
						>
							Idade média
						</span>

						<span
							class="
								mt-1 block
								text-2xl font-black text-neutral-100
							"
						>
							{averageAge.toLocaleString('pt-BR', {
								minimumFractionDigits: 1,
								maximumFractionDigits: 1
							})}
						</span>
					</div>

					<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
						<span
							class="
								text-[10px] uppercase tracking-wider
								text-neutral-500
							"
						>
							Mais valioso
						</span>

						<span
							class="
								mt-1 block max-w-32 truncate
								text-sm font-black text-neutral-100
							"
						>
							{mostValuablePlayer?.name || 'N/A'}
						</span>

						<span class="text-xs font-bold text-(--golden)">
							{mostValuablePlayer
								? formatCurrency(
										getMarketValue(mostValuablePlayer)
									)
								: formatCurrency(0)}
						</span>
					</div>

					<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
						<span
							class="
								text-[10px] uppercase tracking-wider
								text-neutral-500
							"
						>
							Valor total
						</span>

						<span
							class="
								mt-1 block
								text-lg font-black text-(--golden)
							"
						>
							{formatCurrency(totalMarketValue)}
						</span>
					</div>
				</div>
			</div>
		</section>

		<section
			class="
				rounded-2xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-4
				backdrop-blur-lg
				sm:p-5
			"
		>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_220px]">
				<label class="relative block">
					<span class="sr-only">Pesquisar jogador</span>

					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
						class="
							pointer-events-none
							absolute left-4 top-1/2
							h-4 w-4
							-translate-y-1/2
							text-neutral-500
						"
					>
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>

					<input
						type="search"
						bind:value={searchTerm}
						placeholder="Pesquisar por nome, país ou clube anterior..."
						class="
							h-11 w-full
							rounded-xl
							border border-(--tertiary)/5
							bg-neutral-900/50
							pl-11 pr-4
							text-sm text-neutral-200
							outline-none
							placeholder:text-neutral-600
							transition-colors
							focus:border-(--secondary)
						"
					/>
				</label>

				<label>
					<span class="sr-only">Filtrar por posição</span>

					<select
						bind:value={selectedPosition}
						class="
							h-11 w-full
							cursor-pointer
							rounded-xl
							border border-(--tertiary)/5
							bg-neutral-900/50
							px-4
							text-sm text-neutral-300
							outline-none
							transition-colors
							focus:border-(--secondary)
						"
					>
						<option value="Todas">Todas as posições</option>

						{#each positions as position (position)}
							<option value={position}>{position}</option>
						{/each}
					</select>
				</label>

				<label>
					<span class="sr-only">Ordenar jogadores</span>

					<select
						bind:value={sortBy}
						class="
							h-11 w-full
							cursor-pointer
							rounded-xl
							border border-(--tertiary)/5
							bg-neutral-900/50
							px-4
							text-sm text-neutral-300
							outline-none
							transition-colors
							focus:border-(--secondary)
						"
					>
						<option value="marketValue-desc">Maior valor</option>
						<option value="marketValue-asc">Menor valor</option>
						<option value="name-asc">Nome A–Z</option>
						<option value="age-asc">Mais jovens</option>
						<option value="age-desc">Mais experientes</option>
					</select>
				</label>
			</div>
		</section>

		<div class="flex items-center justify-between gap-4">
			<p class="text-xs text-neutral-500">
				Exibindo
				<span class="font-bold text-neutral-300">
					{filteredPlayers.length}
				</span>
				de
				<span class="font-bold text-neutral-300">
					{players.length}
				</span>
				atletas
			</p>

			{#if searchTerm || selectedPosition !== 'Todas' || sortBy !== 'marketValue-desc'}
				<button
					type="button"
					onclick={clearFilters}
					class="
						text-xs font-semibold
						text-(--secondary)
						transition-opacity
						hover:opacity-70
					"
				>
					Limpar filtros
				</button>
			{/if}
		</div>

		{#if filteredPlayers.length}
			<div
				class="
					grid grid-cols-1 gap-6
					sm:grid-cols-2
					xl:grid-cols-3
					2xl:grid-cols-4
				"
			>
				{#each filteredPlayers as player (player.id)}
					<PlayerCard {player} onOpen={openPlayer} />
				{/each}
			</div>
		{:else}
			<div
				class="
					flex min-h-72 flex-col
					items-center justify-center
					rounded-2xl
					border border-dashed border-(--tertiary)/10
					bg-neutral-800/30
					p-8
					text-center
				"
			>
				<div
					class="
						flex h-14 w-14
						items-center justify-center
						rounded-full
						bg-neutral-900/60
						text-2xl
					"
				>
					⌕
				</div>

				<h2 class="mt-4 text-lg font-bold">
					Nenhum atleta encontrado
				</h2>

				<p class="mt-1 max-w-md text-sm text-neutral-500">
					Não encontramos jogadores correspondentes aos filtros
					selecionados.
				</p>

				<button
					type="button"
					onclick={clearFilters}
					class="
						mt-5
						rounded-xl
						bg-(--secondary)
						px-5 py-2.5
						text-xs font-bold
						transition-opacity
						hover:opacity-80
					"
				>
					Limpar filtros
				</button>
			</div>
		{/if}
	</div>
</div>

{#if selectedPlayer}
	<PlayerDetailsModal
		player={selectedPlayer}
		onClose={closePlayer}
	/>
{/if}