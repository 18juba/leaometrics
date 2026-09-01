<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		category: string;
		title: string;
		description?: string;
		children: Snippet;
		class?: string;
	}

	let { category, title, description, children, class: className = '' }: Props = $props();
</script>

<section
	class={`
		surface-card chart-card flex h-full flex-col
		min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5
		${className}
	`}
>
	<header class="mb-5 border-b border-(--tertiary)/10 pb-4">
		<div class="flex items-center gap-2">
			<span class="text-[9px] font-semibold tracking-[0.12em] text-(--golden)">
				{category}
			</span>
			<span class="h-px flex-1 bg-linear-to-r from-(--golden)/45 to-transparent"></span>
		</div>

		<h2 class="mt-2 text-[1.55rem] font-bold leading-none tracking-tight text-neutral-50">
			{title}
		</h2>

		{#if description}
			<p class="mt-2 text-xs leading-5 text-neutral-300">
				{description}
			</p>
		{/if}
	</header>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col">
		{@render children()}
	</div>
</section>
