<script lang="ts">
	import './globals.css';
	import './background.css';

	import favicon from '$lib/assets/favicon.svg';

	import { page } from '$app/state';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import { preloadAllBackgrounds, preloadBackground } from '$lib/utils/backgroundPreload';

	let { children } = $props();

	let x = $state(0);
	let y = $state(0);
	let parallaxEnabled = $state(false);

	type TransitionPhase = 'idle' | 'cover' | 'reveal';

	let transitionPhase = $state<TransitionPhase>('idle');
	let transitionId = 0;

	const COVER_DURATION = 280; // ms
	const REVEAL_DURATION = 480; // ms

	function wait(duration: number) {
		return new Promise<void>((resolve) => {
			window.setTimeout(resolve, duration);
		});
	}

	function handleMouseMove(event: MouseEvent) {
		if (!parallaxEnabled) return;

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

	let backgroundClass = $derived(getBackgroundClass(page.url.pathname));

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const pointerQuery = window.matchMedia('(pointer: fine)');
		const idleWindow = window as Window & {
			requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
			cancelIdleCallback?: (handle: number) => void;
		};
		let idleRequest: number | undefined;
		let timeoutRequest: number | undefined;

		function updateParallaxPreference() {
			parallaxEnabled = pointerQuery.matches && !motionQuery.matches;

			if (!parallaxEnabled) {
				x = 0;
				y = 0;
			}
		}

		updateParallaxPreference();

		motionQuery.addEventListener('change', updateParallaxPreference);
		pointerQuery.addEventListener('change', updateParallaxPreference);

		const preloadRemainingBackgrounds = () => {
			void preloadAllBackgrounds();
		};

		if (typeof idleWindow.requestIdleCallback === 'function') {
			idleRequest = idleWindow.requestIdleCallback(preloadRemainingBackgrounds, { timeout: 1200 });
		} else {
			timeoutRequest = window.setTimeout(preloadRemainingBackgrounds, 300);
		}

		return () => {
			motionQuery.removeEventListener('change', updateParallaxPreference);
			pointerQuery.removeEventListener('change', updateParallaxPreference);

			if (idleRequest !== undefined && typeof idleWindow.cancelIdleCallback === 'function') {
				idleWindow.cancelIdleCallback(idleRequest);
			}

			if (timeoutRequest !== undefined) {
				window.clearTimeout(timeoutRequest);
			}
		};
	});

	onNavigate(async ({ from, to }) => {
		if (!from?.url || !to?.url) return;
		if (from.url.pathname === to.url.pathname) return;

		const currentTransition = ++transitionId;
		const backgroundReady = preloadBackground(to.url.pathname);

		transitionPhase = 'cover';

		await Promise.all([wait(COVER_DURATION), backgroundReady]);

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

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window onmousemove={handleMouseMove} />

<div class="background-stage" aria-hidden="true">
	<div
		class="background-parallax"
		style:transform={parallaxEnabled
			? `translate(${x * 12}px, ${y * 12}px) scale(1.1)`
			: 'translate(0px, 0px) scale(1.1)'}
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

	<div class="background-vignette"></div>
</div>

<main class="relative flex h-screen w-full p-8 antialiased">
	<Navbar />
	{@render children()}
</main>
