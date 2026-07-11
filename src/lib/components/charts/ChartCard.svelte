<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		category: string;
		title: string;
		description?: string;
		children: Snippet;
		class?: string;
	}

	let {
		category,
		title,
		description,
		children,
		class: className = ''
	}: Props = $props();
</script>

<section
	class={`
		min-w-0 overflow-hidden
		rounded-2xl
		border border-white/10
		bg-neutral-800/60
		p-5
		shadow-lg shadow-black/10
		backdrop-blur-lg
		${className}
	`}
>
	<header class="mb-5 border-b border-white/10 pb-4">
		<p
			class="
				text-xs font-bold uppercase
				tracking-[0.14em]
				text-(--golden)
			"
		>
			{category}
		</p>

		<h2
			class="
				mt-1.5 text-base font-bold
				tracking-tight text-neutral-50
			"
		>
			{title}
		</h2>

		{#if description}
			<p
				class="
					mt-1.5 text-sm leading-relaxed
					text-neutral-300
				"
			>
				{description}
			</p>
		{/if}
	</header>

	<div class="min-w-0">
		{@render children()}
	</div>
</section>