<script lang="ts">
	import { onMount } from 'svelte';

	let { reducedMotion = false }: { reducedMotion?: boolean } = $props();

	let isVisible = $state(false);

	function updateVisibility(): void {
		isVisible = window.scrollY > 360;
	}

	function scrollToTop(): void {
		window.scrollTo({
			top: 0,
			behavior: reducedMotion ? 'auto' : 'smooth'
		});
	}

	onMount(() => {
		updateVisibility();
	});
</script>

<svelte:window onscroll={updateVisibility} />

{#if isVisible}
	<button
		type="button"
		onclick={scrollToTop}
		class="fixed right-4 bottom-24 z-40 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-(--primary) text-white shadow-xl shadow-black/30 transition-all hover:-translate-y-1 hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-(--golden) focus-visible:ring-offset-2 focus-visible:ring-offset-(--page-bg) xl:right-8 xl:bottom-8"
		aria-label="Voltar ao topo"
		title="Voltar ao topo"
	>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.4"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
			class="h-5 w-5"
		>
			<path d="m18 15-6-6-6 6"></path>
		</svg>
		<span class="sr-only">Voltar ao topo</span>
	</button>
{/if}
