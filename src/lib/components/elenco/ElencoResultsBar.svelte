<script lang="ts">
	import type {
		FootFilter,
		SortOption
	} from './elenco.types';

	import {
		getFootLabel,
		getPositionLabel,
		getSortLabel
	} from './elenco.utils';

	let {
		visiblePlayers,
		totalPlayers,
		selectedPosition,
		selectedFoot,
		sortBy
	}: {
		visiblePlayers: number;
		totalPlayers: number;
		selectedPosition: string;
		selectedFoot: FootFilter;
		sortBy: SortOption;
	} = $props();
</script>

<div
	class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
>
	<p class="shrink-0 text-[11px] text-neutral-500 sm:text-xs">
		Exibindo
		<span class="font-bold text-neutral-300">{visiblePlayers}</span>
		de
		<span class="font-bold text-neutral-300">{totalPlayers}</span>
		atletas
	</p>

	<div
		class="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 text-[9px] custom-scrollbar sm:justify-end sm:overflow-visible sm:pb-0 sm:text-[10px]"
	>
		<span
			class="shrink-0 whitespace-nowrap rounded-md bg-neutral-900/50 px-2 py-1 font-bold text-neutral-300"
		>
			{getSortLabel(sortBy)}
		</span>

		{#if selectedPosition !== 'Todas'}
			<span
				class="shrink-0 whitespace-nowrap rounded-md bg-neutral-900/50 px-2 py-1 font-bold text-neutral-300"
			>
				{getPositionLabel(selectedPosition)}
			</span>
		{/if}

		{#if selectedFoot !== 'all'}
			<span
				class="shrink-0 whitespace-nowrap rounded-md bg-neutral-900/50 px-2 py-1 font-bold text-neutral-300"
			>
				{getFootLabel(selectedFoot)}
			</span>
		{/if}
	</div>
</div>
