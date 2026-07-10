<script lang="ts">
	import PlayerCard from '$lib/components/player/PlayerCard.svelte';
	import { formatCurrency } from '$lib/formatters/formatCurrency';

	type Player = {
		id: number;
		name: string;
		position: string;
		dateOfBirth: string;
		age: number;
		nationality: string[];
		height: number;
		foot: string;
		joinedOn: string;
		signedFrom: string;
		contract: string;
		marketValue: number;
	};

	type ClubPlayers = {
		updatedAt: string;
		id: number;
		players: Player[];
	};

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
	let selectedPlayer = $state<Player | null>(null);

	const players = $derived(data.clubPlayers?.players ?? []);

	const positionOptions = $derived(
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

	const averageAge = $derived(
		players.length
			? players.reduce((total, player) => total + (Number(player.age) || 0), 0) /
					players.length
			: 0
	);

	const filteredPlayers = $derived.by(() => {
		const normalizedSearch = normalizeText(searchTerm);

		const result = players.filter((player) => {
			const matchesPosition =
				selectedPosition === 'Todas' || player.position === selectedPosition;

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

	const lastUpdated = $derived(formatDateTime(data.clubPlayers?.updatedAt));

	$effect(() => {
		if (!selectedPlayer) return;

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	function normalizeText(value: string | undefined | null) {
		return String(value ?? '')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.trim();
	}

	function getMarketValue(player: Player) {
		return Number(player.marketValue) || 0;
	}

	function openPlayer(player: Player) {
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closePlayer();
		}
	}

	function handleImageError(event: Event) {
		const image = event.currentTarget as HTMLImageElement;

		image.onerror = null;
		image.src = '/images/players/placeholder.webp';
	}

	function formatHeight(height: number) {
		if (!height) return 'N/A';

		if (height > 3) {
			return `${height} cm`;
		}

		return `${height.toLocaleString('pt-BR', {
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

	function formatDate(value: string) {
		if (!value) return 'N/A';

		const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
			? `${value}T12:00:00`
			: value;

		const date = new Date(normalizedValue);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(date);
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

	function formatNationality(nationalities: string[]) {
		if (!nationalities?.length) return 'Não informada';

		return nationalities.join(' • ');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

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
						Plantel principal
					</span>

					<h1 class="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
						Elenco do clube
					</h1>

					<p class="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
						Consulte os atletas, valores de mercado, posições, contratos e
						informações gerais do elenco.
					</p>

					<p class="mt-4 text-[10px] uppercase tracking-wider text-neutral-500">
						Última atualização: {lastUpdated}
					</p>
				</div>

				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-140">
					<div class="rounded-xl bg-neutral-900/40 p-4">
						<span class="text-[10px] uppercase tracking-wider text-neutral-500">
							Atletas
						</span>

						<span class="mt-1 block text-2xl font-black text-neutral-100">
							{players.length}
						</span>
					</div>

					<div class="rounded-xl bg-neutral-900/40 p-4">
						<span class="text-[10px] uppercase tracking-wider text-neutral-500">
							Idade média
						</span>

						<span class="mt-1 block text-2xl font-black text-neutral-100">
							{averageAge.toLocaleString('pt-BR', {
								minimumFractionDigits: 1,
								maximumFractionDigits: 1
							})}
						</span>
					</div>

					<div class="rounded-xl bg-neutral-900/40 p-4">
						<span class="text-[10px] uppercase tracking-wider text-neutral-500">
							Posições
						</span>

						<span class="mt-1 block text-2xl font-black text-neutral-100">
							{positionOptions.length}
						</span>
					</div>

					<div class="rounded-xl bg-neutral-900/40 p-4">
						<span class="text-[10px] uppercase tracking-wider text-neutral-500">
							Valor total
						</span>

						<span class="mt-1 block text-lg font-black text-(--golden)">
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

						{#each positionOptions as position (position)}
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
				<span class="font-bold text-neutral-300">{filteredPlayers.length}</span>
				de
				<span class="font-bold text-neutral-300">{players.length}</span>
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
					Não encontramos jogadores correspondentes aos filtros selecionados.
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
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
		<button
			type="button"
			aria-label="Fechar detalhes do jogador"
			onclick={closePlayer}
			class="
				absolute inset-0
				cursor-default
				bg-black/75
				backdrop-blur-sm
			"
		></button>

		<section
			role="dialog"
			aria-modal="true"
			aria-labelledby="player-modal-title"
			class="
				relative z-10
				max-h-[90vh] w-full max-w-4xl
				overflow-y-auto
				rounded-3xl
				border border-(--tertiary)/10
				bg-neutral-900
				shadow-2xl shadow-black/50
				custom-scrollbar
			"
		>
			<button
				type="button"
				onclick={closePlayer}
				aria-label="Fechar"
				class="
					absolute right-4 top-4 z-20
					flex h-9 w-9
					items-center justify-center
					rounded-full
					border border-white/5
					bg-neutral-950/70
					text-lg text-neutral-300
					backdrop-blur-md
					transition-colors
					hover:bg-neutral-800
					hover:text-white
				"
			>
				×
			</button>

			<div class="grid grid-cols-1 md:grid-cols-[320px_1fr]">
				<div
					class="
						relative
						min-h-80 overflow-hidden
						border-b border-(--tertiary)/5
						bg-neutral-950/50
						md:min-h-145
						md:border-b-0
						md:border-r
					"
				>
					<div
						class="
							pointer-events-none
							absolute left-1/2 top-1/3
							h-52 w-52
							-translate-x-1/2 -translate-y-1/2
							rounded-full
							bg-(--primary)
							opacity-15 blur-3xl
						"
					></div>

					<img
						src={`/images/players/${selectedPlayer.id}.webp`}
						alt={selectedPlayer.name}
						onerror={handleImageError}
						class="
							pointer-events-none
							absolute inset-x-0 bottom-0
							mx-auto
							h-[88%] w-[88%]
							select-none
							object-contain object-bottom
						"
					/>

					<div
						class="
							pointer-events-none
							absolute inset-x-0 bottom-0
							h-32
							bg-linear-to-t
							from-neutral-900
							to-transparent
						"
					></div>
				</div>

				<div class="p-6 sm:p-8">
					<span
						class="
							text-xs font-bold uppercase
							tracking-[0.2em]
							text-(--golden)
						"
					>
						{selectedPlayer.position || 'Sem posição'}
					</span>

					<h2
						id="player-modal-title"
						class="mt-2 pr-10 text-3xl font-black tracking-tight text-neutral-100"
					>
						{selectedPlayer.name}
					</h2>

					<p class="mt-2 text-sm text-neutral-400">
						{formatNationality(selectedPlayer.nationality)}
					</p>

					<div
						class="
							mt-6
							rounded-2xl
							border border-(--tertiary)/5
							bg-neutral-950/40
							p-5
						"
					>
						<span class="text-[10px] uppercase tracking-wider text-neutral-500">
							Valor de mercado
						</span>

						<span class="mt-1 block text-3xl font-black text-(--golden)">
							{formatCurrency(Number(selectedPlayer.marketValue) || 0)}
						</span>
					</div>

					<div class="mt-6 grid grid-cols-2 gap-3">
						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] uppercase tracking-wider text-neutral-500">
								Nascimento
							</span>

							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{formatDate(selectedPlayer.dateOfBirth)}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] uppercase tracking-wider text-neutral-500">
								Idade
							</span>

							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{selectedPlayer.age
									? `${selectedPlayer.age} anos`
									: 'N/A'}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] uppercase tracking-wider text-neutral-500">
								Altura
							</span>

							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{formatHeight(selectedPlayer.height)}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] uppercase tracking-wider text-neutral-500">
								Pé preferido
							</span>

							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{formatFoot(selectedPlayer.foot)}
							</span>
						</div>
					</div>

					<div
						class="
							mt-6 space-y-4
							border-t border-(--tertiary)/5
							pt-6
						"
					>
						<div class="flex items-start justify-between gap-6">
							<span class="text-xs text-neutral-500">
								No clube desde
							</span>

							<span class="text-right text-sm font-semibold text-neutral-200">
								{formatDate(selectedPlayer.joinedOn)}
							</span>
						</div>

						<div class="flex items-start justify-between gap-6">
							<span class="text-xs text-neutral-500">
								Contratado de
							</span>

							<span class="text-right text-sm font-semibold text-neutral-200">
								{selectedPlayer.signedFrom || 'N/A'}
							</span>
						</div>

						<div class="flex items-start justify-between gap-6">
							<span class="text-xs text-neutral-500">
								Contrato até
							</span>

							<span class="text-right text-sm font-semibold text-neutral-200">
								{formatDate(selectedPlayer.contract)}
							</span>
						</div>

						<div class="flex items-start justify-between gap-6">
							<span class="text-xs text-neutral-500">
								Nacionalidade
							</span>

							<span class="text-right text-sm font-semibold text-neutral-200">
								{formatNationality(selectedPlayer.nationality)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
{/if}