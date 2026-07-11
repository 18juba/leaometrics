<script lang="ts">
	import './globals.css';
	import './background.css';
	import '$lib/components/charts/chartTheme';

	import favicon from '$lib/assets/favicon.svg';

	import { page } from '$app/state';
	import { onNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

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
		if (pathname === '/' || pathname.startsWith('/clube')) {
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

	const isActive = (href: string) => {
		if (href === '/') {
			return page.url.pathname === '/';
		}

		return page.url.pathname.startsWith(href);
	};

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
	<aside class="sidebar-zone h-full w-56 flex items-center">
		<nav class="nav-soft">
			<ul class="flex flex-col gap-3 font-medium">
				<li
					class:active={isActive('/clube')}
					class="menu-item"
				>
					<a href="/clube" class="flex items-center gap-2">
						<img
							src="/icons/escudo.png"
							alt="Home"
							class="w-12 h-12 select-none pointer-events-none object-contain"
						/>
						<span>Clube</span>
					</a>
				</li>

				<li
					class:active={isActive('/elenco')}
					class="menu-item"
				>
					<a href="/elenco" class="flex items-center gap-2">
						<img
							src="/icons/camisa.webp"
							alt="Players"
							class="w-12 h-12 select-none pointer-events-none object-contain"
						/>
						<span>Elenco</span>
					</a>
				</li>
				<li
					class:active={isActive('/conquistas')}
					class="menu-item"
				>
					<a href="/conquistas" class="flex items-center gap-2">
						<img
							src="/icons/lampions.png"
							alt="Conquistas"
							class="w-12 h-12 select-none pointer-events-none object-contain"
						/>
						<span>Conquistas</span>
					</a>
				</li>
								<li
					class:active={isActive('/analises')}
					class="menu-item"
				>
					<a href="/analises" class="flex items-center gap-2">
						<img
							src="/icons/ball.png"
							alt="Análises"
							class="w-12 h-12 select-none pointer-events-none object-contain"
						/>
						<span>Análises</span>
					</a>
				</li>
			</ul>
		</nav>
	</aside>
	{@render children()}
</main>

<style>
	.nav-soft {
		opacity: 0.8;
		transform: translateX(-10px) scale(0.97);
		filter: brightness(0.85) blur(0.4px);

		transition:
			opacity 280ms ease,
			transform 280ms ease,
			filter 280ms ease;

		transition-delay: 5s;
	}

	.sidebar-zone:hover .nav-soft,
	.sidebar-zone:focus-within .nav-soft {
		opacity: 1;
		transform: translateX(0) scale(1);
		filter: brightness(1) blur(0);

		transition-delay: 0ms;
	}

.menu-item {
position: relative;
    width: 13rem;
    padding: .35rem .5rem;
    border-radius: .5rem;
    
    background: linear-gradient(
        90deg,
        rgb(from var(--tertiary) r g b / 0.12),
        transparent
    );
    background-size: 0% 100%;
    background-repeat: no-repeat;
    background-position: left center; 

    transition: all 200ms ease, background-size 300ms cubic-bezier(0.25, 1, 0.5, 1);
}

.menu-item:hover {
    transform: scale(1.03);
}

.menu-item::before {
	content: "";

	position: absolute;
	left: -8px;
	top: 50%;

	width: 3px;
	height: 70%;

	transform: translateY(-50%) scaleY(0);
	transform-origin: center;

	border-radius: 999px;
	background: var(--tertiary);
	box-shadow: 0 0 12px var(--tertiary);

	transition: transform 225ms ease;
}

.menu-item.active {
	background-size: 100% 100%;
}

.menu-item.active::before {
	transform: translateY(-50%) scaleY(1);
}
</style>