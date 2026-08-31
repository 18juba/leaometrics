<script lang="ts">
	import type { Picture } from '@sveltejs/enhanced-img';

	import { getPlayerImage, playerPlaceholder } from '$lib/data/playerImages';

	interface Props {
		playerId: string;
		alt: string;
		class?: string;
		sizes?: string;
		loading?: 'eager' | 'lazy';
	}

	let { playerId, alt, class: className = '', sizes, loading = 'lazy' }: Props = $props();

	const image = $derived<Picture | null>(getPlayerImage(playerId));

	function handleImageError(event: Event): void {
		const element = event.currentTarget as HTMLImageElement;

		element.onerror = null;

		if (playerPlaceholder) {
			element.src = playerPlaceholder.img.src;
		}
	}
</script>

{#if image}
	<enhanced:img
		src={image}
		{alt}
		{sizes}
		{loading}
		decoding="async"
		onerror={handleImageError}
		class={className}
	/>
{:else}
	<img
		src={playerPlaceholder?.img.src ?? ''}
		{alt}
		{loading}
		decoding="async"
		onerror={handleImageError}
		class={className}
	/>
{/if}
