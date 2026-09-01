<script lang="ts">
	import { getFlagCode, getFlagUrl } from '$lib/dictionaries/flagsDictionary';

	interface Props {
		country: string;
		class?: string;
		sizes?: string;
	}

	let { country, class: className = '', sizes = '40px' }: Props = $props();

	let hasError = $state(false);

	const code = $derived(getFlagCode(country));
	const source = $derived(getFlagUrl(country));

	function handleImageError(): void {
		hasError = true;
	}
</script>

{#if source && !hasError}
	<img
		src={source}
		alt=""
		aria-hidden="true"
		loading="lazy"
		decoding="async"
		{sizes}
		class={className}
		onerror={handleImageError}
	/>
{:else}
	<span
		class={`inline-flex items-center justify-center rounded-md bg-neutral-800 px-1 text-[9px] font-bold uppercase tracking-wide text-neutral-400 ${className}`}
		aria-hidden="true"
	>
		{code ?? '??'}
	</span>
{/if}
