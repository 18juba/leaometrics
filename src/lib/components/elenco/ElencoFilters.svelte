<script lang="ts">
	import type { FootFilter, SortOption } from './elenco.types';

	import { getPositionLabel, getSortLabel } from './elenco.utils';

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

	let showSortOptions = $state(false);

	const inputClass = `
		h-11 w-full cursor-pointer rounded-xl
		border border-(--tertiary)/5
		bg-neutral-900/50
		px-3
		text-xs text-neutral-300
		outline-none
		transition-colors
		hover:border-(--tertiary)/10
		focus:border-(--secondary)
		sm:px-4 sm:text-sm
	`;

	const labelClass = `
		mb-1.5 block
		text-[9px] font-bold uppercase
		tracking-wider text-neutral-500
		sm:text-[10px]
	`;

	const nameSort = $derived(sortBy.startsWith('name-') ? sortBy : 'none');

	const ageSort = $derived(sortBy.startsWith('age-') ? sortBy : 'none');

	const heightSort = $derived(sortBy.startsWith('height-') ? sortBy : 'none');

	const valueSort = $derived(sortBy.startsWith('value-') ? sortBy : 'none');

	function changeSort(event: Event): void {
		const select = event.currentTarget as HTMLSelectElement;

		if (select.value === 'none') {
			return;
		}

		sortBy = select.value as SortOption;
	}
</script>

<section class="surface-card rounded-2xl p-3 sm:p-5" aria-labelledby="elenco-filters-title">
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<h2
				id="elenco-filters-title"
				class="text-xs font-bold uppercase tracking-wider text-neutral-300"
			>
				Filtros do elenco
			</h2>

			<p class="mt-1 hidden text-xs text-neutral-500 sm:block">
				Pesquise, filtre e ordene os atletas.
			</p>
		</div>

		{#if hasActiveFilters}
			<button
				type="button"
				onclick={onClear}
				class="shrink-0 rounded-lg border border-(--tertiary)/5 bg-neutral-900/50 px-2.5 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-(--secondary) sm:px-3 sm:text-[10px]"
			>
				Limpar <span class="hidden sm:inline">filtros</span>
			</button>
		{/if}
	</div>

	<div class="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
		<label class="col-span-2">
			<span class={labelClass}>Pesquisar atleta</span>

			<div class="relative">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
					class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 sm:left-4"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.35-4.35"></path>
				</svg>

				<input
					type="search"
					bind:value={searchTerm}
					placeholder="Nome, país, posição ou clube..."
					class="h-11 w-full rounded-xl border border-(--tertiary)/10 bg-neutral-950/55 pl-10 pr-3 text-xs text-neutral-200 outline-none placeholder:text-neutral-600 transition-colors hover:border-(--tertiary)/20 focus:border-(--secondary) focus:ring-2 focus:ring-(--secondary)/20 sm:pl-11 sm:pr-4 sm:text-sm"
				/>
			</div>
		</label>

		<label>
			<span class={labelClass}>Posição</span>

			<select bind:value={selectedPosition} class={inputClass}>
				<option value="Todas">Todas</option>

				{#each positions as position (position)}
					<option value={position}>
						{getPositionLabel(position)}
					</option>
				{/each}
			</select>
		</label>

		<label>
			<span class={labelClass}>Pé preferido</span>

			<select bind:value={selectedFoot} class={inputClass}>
				<option value="all">Todos</option>
				<option value="right">Direito</option>
				<option value="left">Esquerdo</option>
				<option value="both">Ambidestro</option>
			</select>
		</label>
	</div>

	<div class="mt-4 border-t border-(--tertiary)/5 pt-4">
		<div class="flex items-center justify-between gap-3">
			<div class="min-w-0">
				<h3 class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 sm:text-xs">
					Ordenação
				</h3>

				<p class="mt-1 hidden text-[10px] text-neutral-500 sm:block">
					Um critério permanece ativo por vez.
				</p>
			</div>

			<div class="flex min-w-0 items-center gap-2">
				<span
					class="max-w-36 truncate rounded-lg bg-neutral-950/40 px-2.5 py-1.5 text-[9px] font-semibold text-(--golden) sm:max-w-none sm:px-3 sm:text-[10px]"
					title={getSortLabel(sortBy)}
				>
					{getSortLabel(sortBy)}
				</span>

				<button
					type="button"
					onclick={() => {
						showSortOptions = !showSortOptions;
					}}
					aria-expanded={showSortOptions}
					aria-controls="elenco-sort-options"
					class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--tertiary)/5 bg-neutral-900/50 text-neutral-400 transition-colors hover:text-(--secondary) md:hidden"
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
						class={`h-4 w-4 transition-transform duration-200 ${
							showSortOptions ? 'rotate-180' : ''
						}`}
					>
						<path d="m6 9 6 6 6-6"></path>
					</svg>

					<span class="sr-only">
						{showSortOptions ? 'Ocultar ordenações' : 'Exibir ordenações'}
					</span>
				</button>
			</div>
		</div>

		<div
			id="elenco-sort-options"
			class={`mt-4 grid-cols-2 gap-2.5 sm:gap-3 md:grid lg:grid-cols-4 ${
				showSortOptions ? 'grid' : 'hidden'
			}`}
		>
			<label>
				<span class={labelClass}>Nome</span>
				<select value={nameSort} onchange={changeSort} class={inputClass}>
					<option value="none" disabled>Selecione</option>
					<option value="name-asc">A → Z</option>
					<option value="name-desc">Z → A</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Idade</span>
				<select value={ageSort} onchange={changeSort} class={inputClass}>
					<option value="none" disabled>Selecione</option>
					<option value="age-asc">Mais jovens</option>
					<option value="age-desc">Mais experientes</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Altura</span>
				<select value={heightSort} onchange={changeSort} class={inputClass}>
					<option value="none" disabled>Selecione</option>
					<option value="height-desc">Mais altos</option>
					<option value="height-asc">Mais baixos</option>
				</select>
			</label>

			<label>
				<span class={labelClass}>Valor de mercado</span>
				<select value={valueSort} onchange={changeSort} class={inputClass}>
					<option value="none" disabled>Selecione</option>
					<option value="value-desc">Maior valor</option>
					<option value="value-asc">Menor valor</option>
				</select>
			</label>
		</div>
	</div>
</section>
