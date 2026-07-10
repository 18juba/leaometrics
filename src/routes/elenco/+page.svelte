<script lang="ts">
	import PlayerCard from '$lib/components/player/PlayerCard.svelte';
	import PlayerDetailsModal from '$lib/components/player/PlayerDetailsModal.svelte';

	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { ClubPlayers } from '$lib/types/player';

	type ClubPlayer = ClubPlayers['players'][number];

	type NameSort = 'none' | 'asc' | 'desc';
	type AgeSort = 'none' | 'youngest' | 'oldest';
	type HeightSort = 'none' | 'shortest' | 'tallest';
	type ValueSort = 'none' | 'lowest' | 'highest';

	type FootFilter =
		| 'all'
		| 'right'
		| 'left'
		| 'both';

	type SortCategory =
		| 'name'
		| 'age'
		| 'height'
		| 'value';

	let {
		data
	}: {
		data: {
			clubPlayers?: ClubPlayers;
		};
	} = $props();

	let searchTerm = $state('');
	let selectedPosition = $state('Todas');
	let selectedFoot = $state<FootFilter>('all');

	let nameSort = $state<NameSort>('none');
	let ageSort = $state<AgeSort>('none');
	let heightSort = $state<HeightSort>('none');

	/*
	 * Mantém o comportamento anterior:
	 * jogadores mais valiosos aparecem primeiro.
	 */
	let valueSort = $state<ValueSort>('highest');

	let selectedPlayer = $state<ClubPlayer | null>(null);

	const players = $derived(
		data.clubPlayers?.players ?? []
	);

	const positions = $derived(
		[
			...new Set(
				players
					.map((player) => player.position?.trim())
					.filter(
						(position): position is string =>
							Boolean(position)
					)
			)
		].toSorted((a, b) =>
			a.localeCompare(b, 'pt-BR')
		)
	);

	const totalMarketValue = $derived(
		players.reduce((total, player) => {
			return total + getMarketValue(player);
		}, 0)
	);

	const averageAge = $derived.by(() => {
		const ages = players
			.map((player) => Number(player.age))
			.filter(
				(age) =>
					Number.isFinite(age) &&
					age > 0
			);

		if (!ages.length) return 0;

		return (
			ages.reduce(
				(total, age) => total + age,
				0
			) / ages.length
		);
	});

	const mostValuablePlayer = $derived(
		players.toSorted((a, b) => {
			return (
				getMarketValue(b) -
				getMarketValue(a)
			);
		})[0] ?? null
	);

	const filteredPlayers = $derived.by(() => {
		const normalizedSearch =
			normalizeText(searchTerm);

		const filtered = players.filter((player) => {
			const matchesPosition =
				selectedPosition === 'Todas' ||
				player.position === selectedPosition;

			const matchesFoot =
				selectedFoot === 'all' ||
				normalizeFoot(player.foot) ===
					selectedFoot;

			if (!matchesPosition || !matchesFoot) {
				return false;
			}

			if (!normalizedSearch) {
				return true;
			}

			const searchableContent = [
				player.name,
				player.position,
				player.signedFrom,
				player.foot,
				...(player.nationality ?? [])
			]
				.map((value) =>
					normalizeText(value)
				)
				.join(' ');

			return searchableContent.includes(
				normalizedSearch
			);
		});

		return filtered.toSorted(comparePlayers);
	});

	const hasActiveFilters = $derived(
		Boolean(
			searchTerm.trim() ||
				selectedPosition !== 'Todas' ||
				selectedFoot !== 'all' ||
				nameSort !== 'none' ||
				ageSort !== 'none' ||
				heightSort !== 'none' ||
				valueSort !== 'highest'
		)
	);

	const activeSortDescription = $derived.by(() => {
		if (nameSort === 'asc') {
			return 'Nome de A a Z';
		}

		if (nameSort === 'desc') {
			return 'Nome de Z a A';
		}

		if (ageSort === 'youngest') {
			return 'Mais jovens primeiro';
		}

		if (ageSort === 'oldest') {
			return 'Mais experientes primeiro';
		}

		if (heightSort === 'shortest') {
			return 'Mais baixos primeiro';
		}

		if (heightSort === 'tallest') {
			return 'Mais altos primeiro';
		}

		if (valueSort === 'lowest') {
			return 'Menor valor primeiro';
		}

		if (valueSort === 'highest') {
			return 'Maior valor primeiro';
		}

		return 'Ordem original';
	});

	const lastUpdated = $derived(
		formatDateTime(
			data.clubPlayers?.updatedAt
		)
	);

	function comparePlayers(
		a: ClubPlayer,
		b: ClubPlayer
	) {
		if (nameSort === 'asc') {
			return a.name.localeCompare(
				b.name,
				'pt-BR',
				{
					sensitivity: 'base'
				}
			);
		}

		if (nameSort === 'desc') {
			return b.name.localeCompare(
				a.name,
				'pt-BR',
				{
					sensitivity: 'base'
				}
			);
		}

		if (ageSort === 'youngest') {
			return (
				getPlayerAge(a) -
				getPlayerAge(b)
			);
		}

		if (ageSort === 'oldest') {
			return (
				getPlayerAge(b) -
				getPlayerAge(a)
			);
		}

		if (heightSort === 'shortest') {
			return (
				getPlayerHeightInCm(a) -
				getPlayerHeightInCm(b)
			);
		}

		if (heightSort === 'tallest') {
			return (
				getPlayerHeightInCm(b) -
				getPlayerHeightInCm(a)
			);
		}

		if (valueSort === 'lowest') {
			return (
				getMarketValue(a) -
				getMarketValue(b)
			);
		}

		if (valueSort === 'highest') {
			return (
				getMarketValue(b) -
				getMarketValue(a)
			);
		}

		/*
		 * Retornar zero mantém a ordem original
		 * da resposta quando nenhuma ordenação está ativa.
		 */
		return 0;
	}

	function changeSort(
		category: SortCategory,
		value: string
	) {
		/*
		 * Somente uma ordenação pode permanecer ativa.
		 */
		nameSort = 'none';
		ageSort = 'none';
		heightSort = 'none';
		valueSort = 'none';

		switch (category) {
			case 'name':
				nameSort = value as NameSort;
				break;

			case 'age':
				ageSort = value as AgeSort;
				break;

			case 'height':
				heightSort = value as HeightSort;
				break;

			case 'value':
				valueSort = value as ValueSort;
				break;
		}
	}

	function handleNameSort(event: Event) {
		const select =
			event.currentTarget as HTMLSelectElement;

		changeSort('name', select.value);
	}

	function handleAgeSort(event: Event) {
		const select =
			event.currentTarget as HTMLSelectElement;

		changeSort('age', select.value);
	}

	function handleHeightSort(event: Event) {
		const select =
			event.currentTarget as HTMLSelectElement;

		changeSort('height', select.value);
	}

	function handleValueSort(event: Event) {
		const select =
			event.currentTarget as HTMLSelectElement;

		changeSort('value', select.value);
	}

	function getMarketValue(player: ClubPlayer) {
		const value = Number(player.marketValue);

		return Number.isFinite(value)
			? value
			: 0;
	}

	function getPlayerAge(player: ClubPlayer) {
		const age = Number(player.age);

		/*
		 * Idade desconhecida fica no final quando
		 * a ordem for crescente.
		 */
		return Number.isFinite(age) && age > 0
			? age
			: Number.MAX_SAFE_INTEGER;
	}

	function getPlayerHeightInCm(
		player: ClubPlayer
	) {
		const height = Number(player.height);

		if (
			!Number.isFinite(height) ||
			height <= 0
		) {
			return Number.MAX_SAFE_INTEGER;
		}

		/*
		 * Aceita tanto:
		 * 1.80 -> metros
		 * 180  -> centímetros
		 */
		return height <= 3
			? height * 100
			: height;
	}

	function normalizeFoot(
		value: string | null | undefined
	): Exclude<FootFilter, 'all'> | 'unknown' {
		const normalized = normalizeText(value)
			.replaceAll('-', '')
			.replaceAll('_', '')
			.replaceAll(' ', '');

		if (
			[
				'right',
				'rightfoot',
				'direito',
				'destro'
			].includes(normalized)
		) {
			return 'right';
		}

		if (
			[
				'left',
				'leftfoot',
				'esquerdo',
				'canhoto'
			].includes(normalized)
		) {
			return 'left';
		}

		if (
			[
				'both',
				'bothfeet',
				'ambidextrous',
				'ambidestro',
				'ambidextra',
				'ambos'
			].includes(normalized)
		) {
			return 'both';
		}

		return 'unknown';
	}

	function normalizeText(
		value: string | null | undefined
	) {
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
		selectedFoot = 'all';

		nameSort = 'none';
		ageSort = 'none';
		heightSort = 'none';

		/*
		 * Volta à ordenação padrão da tela.
		 */
		valueSort = 'highest';
	}

	function formatDateTime(
		value: string | undefined
	) {
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
	<div
		class="
			flex flex-col gap-3
			sm:flex-row
			sm:items-center
			sm:justify-between
		"
	>
		<div>
			<h2
				class="
					text-sm font-bold uppercase
					tracking-wider text-neutral-300
				"
			>
				Filtros do elenco
			</h2>

			<p class="mt-1 text-xs text-neutral-500">
				Filtre por posição, pé dominante ou pesquise um atleta.
			</p>
		</div>

		{#if hasActiveFilters}
			<button
				type="button"
				onclick={clearFilters}
				class="
					self-start
					rounded-lg
					border border-(--tertiary)/5
					bg-neutral-900/50
					px-3 py-2
					text-[10px] font-bold uppercase
					tracking-wider text-neutral-400
					transition-colors
					hover:border-(--secondary)/30
					hover:text-(--secondary)
					sm:self-auto
				"
			>
				Limpar filtros
			</button>
		{/if}
	</div>

	<div
		class="
			mt-5
			grid grid-cols-1 gap-3
			sm:grid-cols-2
			xl:grid-cols-4
		"
	>
		<label class="relative block sm:col-span-2">
			<span
				class="
					mb-1.5 block
					text-[10px] font-bold uppercase
					tracking-wider text-neutral-500
				"
			>
				Pesquisar atleta
			</span>

			<div class="relative">
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
					<circle
						cx="11"
						cy="11"
						r="8"
					></circle>

					<path
						d="m21 21-4.35-4.35"
					></path>
				</svg>

				<input
					type="search"
					bind:value={searchTerm}
					placeholder="Nome, país ou clube anterior..."
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
			</div>
		</label>

		<label>
			<span
				class="
					mb-1.5 block
					text-[10px] font-bold uppercase
					tracking-wider text-neutral-500
				"
			>
				Posição
			</span>

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
				<option value="Todas">
					Todas as posições
				</option>

				{#each positions as position (position)}
					<option value={position}>
						{position}
					</option>
				{/each}
			</select>
		</label>

		<label>
			<span
				class="
					mb-1.5 block
					text-[10px] font-bold uppercase
					tracking-wider text-neutral-500
				"
			>
				Pé dominante
			</span>

			<select
				bind:value={selectedFoot}
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
				<option value="all">
					Todos
				</option>

				<option value="right">
					Somente direito
				</option>

				<option value="left">
					Somente esquerdo
				</option>

				<option value="both">
					Somente ambidestro
				</option>
			</select>
		</label>
	</div>

	<div
		class="
			mt-5
			border-t border-(--tertiary)/5
			pt-5
		"
	>
		<div
			class="
				flex flex-col gap-2
				sm:flex-row
				sm:items-center
				sm:justify-between
			"
		>
			<div>
				<h3
					class="
						text-xs font-bold uppercase
						tracking-wider text-neutral-400
					"
				>
					Ordenação
				</h3>

				<p class="mt-1 text-[10px] text-neutral-500">
					Selecione um critério de ordenação por vez.
				</p>
			</div>

			<span
				class="
					self-start
					rounded-lg
					bg-neutral-950/40
					px-3 py-1.5
					text-[10px] font-semibold
					text-(--golden)
					sm:self-auto
				"
			>
				{activeSortDescription}
			</span>
		</div>

		<div
			class="
				mt-4
				grid grid-cols-1 gap-3
				sm:grid-cols-2
				xl:grid-cols-4
			"
		>
			<label>
				<span
					class="
						mb-1.5 block
						text-[10px] font-bold uppercase
						tracking-wider text-neutral-500
					"
				>
					Nome
				</span>

				<select
					value={nameSort}
					onchange={handleNameSort}
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
					<option value="none">
						Sem ordenação
					</option>

					<option value="asc">
						Nome: A → Z
					</option>

					<option value="desc">
						Nome: Z → A
					</option>
				</select>
			</label>

			<label>
				<span
					class="
						mb-1.5 block
						text-[10px] font-bold uppercase
						tracking-wider text-neutral-500
					"
				>
					Idade
				</span>

				<select
					value={ageSort}
					onchange={handleAgeSort}
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
					<option value="none">
						Sem ordenação
					</option>

					<option value="youngest">
						Mais jovens
					</option>

					<option value="oldest">
						Mais experientes
					</option>
				</select>
			</label>

			<label>
				<span
					class="
						mb-1.5 block
						text-[10px] font-bold uppercase
						tracking-wider text-neutral-500
					"
				>
					Altura
				</span>

				<select
					value={heightSort}
					onchange={handleHeightSort}
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
					<option value="none">
						Sem ordenação
					</option>

					<option value="tallest">
						Mais altos
					</option>

					<option value="shortest">
						Mais baixos
					</option>
				</select>
			</label>

			<label>
				<span
					class="
						mb-1.5 block
						text-[10px] font-bold uppercase
						tracking-wider text-neutral-500
					"
				>
					Valor de mercado
				</span>

				<select
					value={valueSort}
					onchange={handleValueSort}
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
					<option value="none">
						Sem ordenação
					</option>

					<option value="highest">
						Maior valor
					</option>

					<option value="lowest">
						Menor valor
					</option>
				</select>
			</label>
		</div>
	</div>
</section>

<div
	class="
		flex flex-col gap-2
		sm:flex-row
		sm:items-center
		sm:justify-between
	"
>
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

	<div
		class="
			flex flex-wrap items-center gap-2
			text-[10px] text-neutral-500
		"
	>
		<span>
			Ordenação:
		</span>

		<span
			class="
				rounded-md
				bg-neutral-900/50
				px-2 py-1
				font-bold text-neutral-300
			"
		>
			{activeSortDescription}
		</span>

		{#if selectedPosition !== 'Todas'}
			<span
				class="
					rounded-md
					bg-neutral-900/50
					px-2 py-1
					font-bold text-neutral-300
				"
			>
				{selectedPosition}
			</span>
		{/if}

		{#if selectedFoot !== 'all'}
			<span
				class="
					rounded-md
					bg-neutral-900/50
					px-2 py-1
					font-bold text-neutral-300
				"
			>
				{selectedFoot === 'right'
					? 'Pé direito'
					: selectedFoot === 'left'
						? 'Pé esquerdo'
						: 'Ambidestro'}
			</span>
		{/if}
	</div>
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