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
		flex h-full flex-col
		min-w-0 overflow-hidden
		rounded-xl
		border border-(--tertiary)/5
		bg-neutral-800/88
		p-4
		${className}
	`}
>
	<header
		class="
			mb-3
			border-b border-(--tertiary)/10
			pb-2.5
		"
	>
		<div
			class="
				flex flex-wrap
				items-baseline
				gap-x-2 gap-y-1
			"
		>
			<span
				class="
					text-[9px] font-bold uppercase
					tracking-[0.13em]
					text-(--golden)
				"
			>
				{category}
			</span>

			<h2
				class="
					text-sm font-bold
					tracking-tight
					text-neutral-50
				"
			>
				{title}
			</h2>
		</div>

		{#if description}
			<p
				class="
					mt-1 text-[11px]
					leading-4
					text-neutral-300
				"
			>
				{description}
			</p>
		{/if}
	</header>

	<div class="flex min-h-0 min-w-0 flex-1 flex-col">
		{@render children()}
	</div>
</section>
