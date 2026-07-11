<script lang="ts">
	import { page } from '$app/state';

	type NavLink = {
		href: string;
		label: string;
		icon: string;
		alt: string;
	};

	const links: NavLink[] = [
		{
			href: '/',
			label: 'Clube',
			icon: '/icons/escudo.png',
			alt: 'Clube'
		},
		{
			href: '/elenco',
			label: 'Elenco',
			icon: '/icons/camisa.webp',
			alt: 'Elenco'
		},
		{
			href: '/analises',
			label: 'Análises',
			icon: '/icons/ball.png',
			alt: 'Análises'
		},
		{
			href: '/conquistas',
			label: 'Conquistas',
			icon: '/icons/lampions.png',
			alt: 'Conquistas'
		},
	];

	function isActive(href: string) {
		return (
			page.url.pathname === href ||
			page.url.pathname.startsWith(`${href}/`)
		);
	}
</script>

<!-- Sidebar desktop -->
<aside
	class="
		sidebar-zone
		hidden h-full w-56 shrink-0
		items-center
		2xl:flex
	"
>
	<nav
		class="nav-soft w-full"
		aria-label="Navegação principal"
	>
		<ul class="flex flex-col gap-3 font-medium">
			{#each links as link (link.href)}
				<li
					class="menu-item"
					class:active={isActive(link.href)}
				>
					<a
						href={link.href}
						aria-current={isActive(link.href) ? 'page' : undefined}
						class="
							flex items-center gap-2
							outline-none
							focus-visible:ring-2
							focus-visible:ring-(--tertiary)
							focus-visible:ring-offset-2
							focus-visible:ring-offset-transparent
						"
					>
						<img
							src={link.icon}
							alt=""
							aria-hidden="true"
							class="
								h-12 w-12
								pointer-events-none
								select-none
								object-contain
							"
						/>

						<span>{link.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>

<!-- Bottom bar mobile -->
<nav
	class="
		mobile-bottom-bar
		fixed inset-x-3 bottom-3 z-50
		2xl:hidden
	"
	aria-label="Navegação principal"
>
	<ul
		class="
			grid grid-cols-4
			overflow-hidden
			rounded-2xl
			border border-(--tertiary)/10
			bg-neutral-950/80
			px-1.5 py-1.5
			shadow-2xl shadow-black/40
			backdrop-blur-xl
		"
	>
		{#each links as link (link.href)}
			<li>
				<a
					href={link.href}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class:active={isActive(link.href)}
					class="
						mobile-menu-item
						relative
						flex min-h-15
						flex-col
						items-center justify-center
						gap-0.5
						rounded-xl
						px-1 py-1.5
						text-[10px] font-semibold
						text-neutral-500
						transition-all duration-200
						outline-none
						focus-visible:ring-2
						focus-visible:ring-(--tertiary)
					"
				>
					<span
						class="
							mobile-icon-container
							relative
							flex h-8 w-10
							items-center justify-center
							rounded-lg
							transition-all duration-200
						"
					>
						<img
							src={link.icon}
							alt=""
							aria-hidden="true"
							class="
								h-7 w-7
								pointer-events-none
								select-none
								object-contain
								transition-all duration-200
							"
						/>
					</span>

					<span class="max-w-full truncate">
						{link.label}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

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
		padding: 0.35rem 0.5rem;
		border-radius: 0.5rem;

		background: linear-gradient(
			90deg,
			rgb(from var(--tertiary) r g b / 0.12),
			transparent
		);

		background-size: 0% 100%;
		background-repeat: no-repeat;
		background-position: left center;

		transition:
			transform 200ms ease,
			background-size 300ms cubic-bezier(0.25, 1, 0.5, 1);
	}

	.menu-item:hover {
		transform: scale(1.03);
	}

	.menu-item::before {
		content: '';

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

	.mobile-bottom-bar {
		padding-bottom: env(safe-area-inset-bottom);
	}

	.mobile-menu-item::before {
		content: '';

		position: absolute;
		top: 0;
		left: 50%;

		width: 0;
		height: 2px;

		transform: translateX(-50%);

		border-radius: 999px;
		background: var(--tertiary);
		box-shadow: 0 0 10px var(--tertiary);

		transition: width 200ms ease;
	}

	.mobile-menu-item.active {
		color: var(--tertiary);
		background: rgb(from var(--tertiary) r g b / 0.08);
	}

	.mobile-menu-item.active::before {
		width: 40%;
	}

	.mobile-menu-item.active .mobile-icon-container {
		background: rgb(from var(--tertiary) r g b / 0.1);
		transform: translateY(-1px);
	}

	.mobile-menu-item.active img {
		filter: drop-shadow(0 0 6px rgb(from var(--tertiary) r g b / 0.5));
		transform: scale(1.08);
	}

	@media (hover: hover) {
		.mobile-menu-item:hover {
			color: var(--tertiary);
			background: rgb(from var(--tertiary) r g b / 0.06);
		}
	}
</style>