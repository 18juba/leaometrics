<script>
	import './globals.css';
	import favicon from '$lib/assets/favicon.svg';	
	import { page } from '$app/state';

	let x = $state(0);
	let y = $state(0);

	let { children } = $props();

	function handleMouseMove(event) {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		x = (event.clientX - centerX) / centerX;
		y = (event.clientY - centerY) / centerY;
	}

	const isActive = (href) => {
		if (href === '/') return page.url.pathname === '/';

		return page.url.pathname.startsWith(href);
	};
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window onmousemove={handleMouseMove} />

<div
	class="background"
	style="
		transform: translate({x * 12}px, {y * 12}px) scale(1.1);
	"
></div>

<main class="relative w-full h-screen antialiased flex p-8">
	<aside class="sidebar-zone h-full w-56 flex items-center">
		<nav class="nav-soft">
			<ul class="flex flex-col gap-3">
				<li
					class:active={isActive('/')}
					class="menu-item"
				>
					<a href="/" class="flex items-center gap-2">
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

	transition: all .25s ease;
}

.menu-item.active {
	background: linear-gradient(
		90deg,
		rgb(from var(--tertiary) r g b / 0.12),
		transparent
	);
}

.menu-item.active::before {
	content: "";

	position: absolute;
	left: -8px;
	top: 50%;

	width: 3px;
	height: 70%;

	transform: translateY(-50%);

	border-radius: 999px;
	background: var(--tertiary);

	box-shadow: 0 0 12px var(--tertiary);
}
</style>