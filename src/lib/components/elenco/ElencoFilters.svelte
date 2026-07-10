<script lang="ts">
	import type {
		FootFilter,
		SortOption
	} from './elenco.types';

	import { getSortLabel } from './elenco.utils';

	let {
		positions,
		searchTerm = $bindable(''),
		selectedPosition = $bindable('Todas'),
		selectedFoot = $bindable<FootFilter>('all'),
		sortBy = $bindable<SortOption>('value-desc'),
		hasActiveFilters = false,
		onClear
	}: {
		positions: string[];
		searchTerm: string;
		selectedPosition: string;
		selectedFoot: FootFilter;
		sortBy: SortOption;
		hasActiveFilters?: boolean;
		onClear: () => void;
	} = $props();

	const inputClass = `
		h-11 w-full cursor-pointer rounded-xl
		border border-(--tertiary)/5 bg-neutral-900/50
		px-4 text-sm text-neutral-300 outline-none
		transition-colors focus:border-(--secondary)
	`;

	const labelClass = `
		mb-1.5 block text-[10px] font-bold uppercase
		tracking-wider text-neutral-500
	`;

	const nameSort = $derived(
		sortBy.startsWith('name-')
			? sortBy
			: 'none'
	);

	const ageSort = $derived(
		sortBy.startsWith('age-')
			? sortBy
			: 'none'
	);

	const heightSort = $derived(
		sortBy.startsWith('height-')
			? sortBy
			: 'none'
	);

	const valueSort = $derived(
		sortBy.startsWith('value-')
			? sortBy
			: 'none'
	);

	function changeSort(event: Event) {
		const select =
			event.currentTarget as HTMLSelectElement;

		sortBy = select.value as SortOption;
	}
</script>

<section
	class="
		rounded-2xl border border-(--tertiary)/5
		bg-neutral-800/50 p-4 backdrop-blur-lg sm:p-5
	"
>
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-xs font-bold uppercase tracking-wider text-neutral-300">
				Filtros do elenco
			</h2>

			<p class="mt-1 text-xs text-neutral-500">
				Pesquise, filtre e ordene os atletas.
			</p>
		</div>

		{#if hasActiveFilters}
			<button
				type="button"
				onclick={onClear}
				class="
					self-start rounded-lg border border-(--tertiary)/5
					bg-neutral-900/50 px-3 py-2 text-[10px]
					font-bold uppercase tracking-wider text-neutral-400
					transition-colors hover:text-(--secondary) sm:self-auto
				"
			>
				Limpar filtros
			</button>
		{/if}
	</div>

	<div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
		<label class="sm:col-span-2">
			<span class={labelClass}>Pesquisar atleta</span>

			<div class="relative">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
					class="
						pointer-events-none absolute left-4 top-1/2
						h-4 w-4 -translate-y-1/2 text-neutral-500
					"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>

				<input
					type="search"
					bind:value={searchTerm}
					placeholder="Nome, país ou clube anterior..."
					class="
						h-11 w-full rounded-xl border
						border-(--tertiary)/5 bg-neutral-900/50
						pl-11 pr-4 text-sm text-neutral-200
						outline-none placeholder:text-neutral-600
						transition-colors focus:border-(--secondary)
					"
				/>
			</div>
		</label>

		<label>
			<span class={labelClass}>Posição</span>

			<select
				bind:value={selectedPosition}
				class={inputClass}
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
			<span class={labelClass}>Pé preferido</span>

			<select
				bind:value={selectedFoot}
				class={inputClass}
			>
				<option value="all">Todos</option>
				<option value="right">Somente direito</option>
				<option value="left">Somente esquerdo</option>
				<option value="both">Somente ambidestro</option>
			</select>
		</label>
	</div>

	<div class="mt-5 border-t border-(--tertiary)/5 pt-5">
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400">
					Ordenação
				</h3>

				<p class="mt-1 text-[10px] text-neutral-500">
					Um critério pode permanecer ativo por vez.
				</p>
			</div>

			<span
				class="
					self-start rounded-lg bg-neutral-950/40
					px-3 py-1.5 text-[10px] font-semibold
					text-(--golden) sm:self-auto
				"
			>
				{getSortLabel(sortBy)}
			</span>
		</div>

		<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			<label>
				<span class={labelClass}>Nome</span>

				<select
					value={nameSort}
					onchange={changeSort}
					class={inputClass}
				>
					<option value="none">Sem ordenação</option>
					<option value="name-asc">Nome: A → Z</option>
					<option value="name-desc">Nome: Z → A</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Idade</span>

				<select
					value={ageSort}
					onchange={changeSort}
					class={inputClass}
				>
					<option value="none">Sem ordenação</option>
					<option value="age-asc">Mais jovens</option>
					<option value="age-desc">Mais experientes</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Altura</span>

				<select
					value={heightSort}
					onchange={changeSort}
					class={inputClass}
				>
					<option value="none">Sem ordenação</option>
					<option value="height-desc">Mais altos</option>
					<option value="height-asc">Mais baixos</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Valor de mercado</span>

				<select
					value={valueSort}
					onchange={changeSort}
					class={inputClass}
				>
					<option value="none">Sem ordenação</option>
					<option value="value-desc">Maior valor</option>
					<option value="value-asc">Menor valor</option>
				</select>
			</label>
		</div>
	</div>
</section>