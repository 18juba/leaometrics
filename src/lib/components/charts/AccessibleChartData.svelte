<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		summaryId: string;
		summary: string;
		tableLabel: string;
		children: Snippet;
	}

	let { summaryId, summary, tableLabel, children }: Props = $props();
</script>

<p id={summaryId} class="sr-only">{summary}</p>

<div class="mt-auto pt-3">
	<details class="overflow-hidden rounded-xl border border-(--tertiary)/10 bg-neutral-950/20">
		<summary
			class="
					cursor-pointer select-none px-3 py-2
					text-[10px] font-semibold text-neutral-300
					outline-none transition-colors
					hover:bg-neutral-900/50 hover:text-white
					focus-visible:ring-2 focus-visible:ring-(--secondary)
				"
		>
			{tableLabel}
		</summary>

		<div class="overflow-x-auto border-t border-(--tertiary)/10 px-3 py-3">
			{@render children()}
		</div>
	</details>
</div>
