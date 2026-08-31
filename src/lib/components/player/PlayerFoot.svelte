<script lang="ts">
	let {
		foot,
		size = 'sm'
	}: {
		foot: string | null | undefined;
		size?: 'sm' | 'md' | 'lg';
	} = $props();

	const normalizedFoot = $derived(
		foot
			?.trim()
			.toLocaleLowerCase('pt-BR')
			.replace(/[\s_-]/g, '') ?? ''
	);

	const leftActive = $derived(
		['left', 'leftfoot', 'esquerdo', 'both', 'ambidextrous', 'ambidestro', 'ambos'].includes(
			normalizedFoot
		)
	);

	const rightActive = $derived(
		['right', 'rightfoot', 'direito', 'both', 'ambidextrous', 'ambidestro', 'ambos'].includes(
			normalizedFoot
		)
	);

	const sizeClass = $derived(size === 'lg' ? 'h-7 w-7' : size === 'md' ? 'h-6 w-6' : 'h-5 w-5');

	const label = $derived(
		['both', 'ambidextrous', 'ambidestro', 'ambos'].includes(normalizedFoot)
			? 'Jogador ambidestro'
			: ['left', 'leftfoot', 'esquerdo'].includes(normalizedFoot)
				? 'Pé dominante esquerdo'
				: ['right', 'rightfoot', 'direito'].includes(normalizedFoot)
					? 'Pé dominante direito'
					: 'Pé dominante não informado'
	);
</script>

<span class="inline-flex shrink-0 items-center gap-1" role="img" aria-label={label} title={label}>
	<svg
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 297 297"
		aria-hidden="true"
		class={`${sizeClass} fill-current transition-all duration-200 ${
			leftActive ? 'text-(--tertiary) drop-shadow-[0_0_5px_currentColor]' : 'text-neutral-500/60'
		}`}
	>
		<g>
			<path
				d="m148.5,0c-36.451,0.001-65.999,66-65.999,99.5 0,24.28 8.668,73.774 13.438,99.18 1.812,9.647 3.562,15.82 14.728,15.82h37.833 37.833c11.166,0 12.916-6.173 14.728-15.82 4.77-25.405 13.438-74.899 13.438-99.18 0-33.5-29.548-99.499-65.999-99.5z"
			/>
			<path
				d="m187.999,231.5h-79c-5.5,0-10.833,4-10.833,9.5v6.5c0,27.338 22.162,49.5 49.5,49.5 27.338,0 49.5-22.162 49.5-49.5v-6.5c0-5.5-3.667-9.5-9.167-9.5z"
			/>
		</g>
	</svg>

	<svg
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 297 297"
		aria-hidden="true"
		class={`${sizeClass} -scale-x-100 fill-current transition-all duration-200 ${
			rightActive ? 'text-(--tertiary) drop-shadow-[0_0_5px_currentColor]' : 'text-neutral-500/60'
		}`}
	>
		<g>
			<path
				d="m148.5,0c-36.451,0.001-65.999,66-65.999,99.5 0,24.28 8.668,73.774 13.438,99.18 1.812,9.647 3.562,15.82 14.728,15.82h37.833 37.833c11.166,0 12.916-6.173 14.728-15.82 4.77-25.405 13.438-74.899 13.438-99.18 0-33.5-29.548-99.499-65.999-99.5z"
			/>
			<path
				d="m187.999,231.5h-79c-5.5,0-10.833,4-10.833,9.5v6.5c0,27.338 22.162,49.5 49.5,49.5 27.338,0 49.5-22.162 49.5-49.5v-6.5c0-5.5-3.667-9.5-9.167-9.5z"
			/>
		</g>
	</svg>
</span>
