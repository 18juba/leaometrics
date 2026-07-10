<script lang="ts">
	import type {
		FootFilter,
		SortOption
	} from './elenco.types';

	import {
		getFootLabel,
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
	class="
		flex flex-col gap-2
		sm:flex-row sm:items-center sm:justify-between
	"
>
	<p class="text-xs text-neutral-500">
		Exibindo

		<span class="font-bold text-neutral-300">
			{visiblePlayers}
		</span>

		de

		<span class="font-bold text-neutral-300">
			{totalPlayers}
		</span>

		atletas
	</p>

	<div class="flex flex-wrap items-center gap-2 text-[10px]">
		<span
			class="
				rounded-md bg-neutral-900/50
				px-2 py-1 font-bold text-neutral-300
			"
		>
			{getSortLabel(sortBy)}
		</span>

		{#if selectedPosition !== 'Todas'}
			<span
				class="
					rounded-md bg-neutral-900/50
					px-2 py-1 font-bold text-neutral-300
				"
			>
				{selectedPosition}
			</span>
		{/if}

		{#if selectedFoot !== 'all'}
			<span
				class="
					rounded-md bg-neutral-900/50
					px-2 py-1 font-bold text-neutral-300
				"
			>
				{getFootLabel(selectedFoot)}
			</span>
		{/if}
	</div>
</div>