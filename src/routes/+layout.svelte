<script lang="ts">
	import './globals.css';
	import './background.css';
	import '$lib/components/charts/chartTheme';

	import favicon from '$lib/assets/favicon.svg';

	import { page } from '$app/state';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children } = $props();

	let x = $state(0);
	let y = $state(0);

	type TransitionPhase = 'idle' | 'cover' | 'reveal';

	let transitionPhase = $state<TransitionPhase>('idle');
	let transitionId = 0;

	const COVER_DURATION = 450;
	const REVEAL_DURATION = 850;

	const backgroundImages = [
		'/images/main_background.webp',
		'/images/team_background.jpg',
		'/images/achievements_background.jpg',
		'/images/analysis_background.jpg',
	];

	function wait(duration: number) {
		return new Promise<void>((resolve) => {
			window.setTimeout(resolve, duration);
		});
	}

	function handleMouseMove(event: MouseEvent) {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		x = (event.clientX - centerX) / centerX;
		y = (event.clientY - centerY) / centerY;
	}

	function getBackgroundClass(pathname: string) {
		if (pathname === '/') {
			return 'main-background';
		}

		if (pathname.startsWith('/elenco')) {
			return 'team-background';
		}

		if (pathname.startsWith('/conquistas')) {
			return 'achievements-background';
		}

		if (pathname.startsWith('/analises')) {
			return 'analysis-background';
		}

		return 'main-background';
	}

	let backgroundClass = $derived(
		getBackgroundClass(page.url.pathname)
	);

	onMount(() => {
		for (const src of backgroundImages) {
			const image = new Image();
			image.src = src;
		}
	});

	onNavigate(async ({ from, to }) => {
		if (!from?.url || !to?.url) return;

		if (from.url.pathname === to.url.pathname) return;

		const currentTransition = ++transitionId;

		transitionPhase = 'cover';

		await wait(COVER_DURATION);

		return () => {
			if (currentTransition !== transitionId) return;

			transitionPhase = 'reveal';

			window.setTimeout(() => {
				if (currentTransition === transitionId) {
					transitionPhase = 'idle';
				}
			}, REVEAL_DURATION);
		};
	});
</script>


<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window onmousemove={handleMouseMove} />

<div class="background-stage" aria-hidden="true">
	<div
		class="background-parallax"
		style:transform={`
			translate(${x * 12}px, ${y * 12}px)
			scale(1.1)
		`}
	>
		<div
			class="background-image {backgroundClass}"
			class:background-cover={transitionPhase === 'cover'}
			class:background-reveal={transitionPhase === 'reveal'}
		></div>
	</div>

	<div
		class="background-curtain"
		class:curtain-cover={transitionPhase === 'cover'}
		class:curtain-reveal={transitionPhase === 'reveal'}
	></div>

	<!-- Vinheta permanente -->
	<div class="background-vignette"></div>
</div>

<main class="relative w-full h-screen antialiased flex p-8">
	<Navbar />
	{@render children()}
</main>