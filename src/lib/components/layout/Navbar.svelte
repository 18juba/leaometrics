<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	import analysisIcon from '$lib/assets/icons/ball.png';
	import clubIcon from '$lib/assets/icons/escudo.png';
	import achievementsIcon from '$lib/assets/icons/lampions.png';
	import squadIcon from '$lib/assets/icons/camisa.webp';
	import { preloadBackground } from '$lib/utils/backgroundPreload';
	import { formatDateTime } from '$lib/formatters/formatDateTime';

	let { generatedAt }: { generatedAt: string } = $props();

	type NavLink = {
		href: '/' | '/elenco' | '/analises' | '/conquistas';
		label: string;
		description: string;
		icon: string;
	};

	const links: NavLink[] = [
		{
			href: '/',
			label: 'Clube',
			description: 'Visão geral',
			icon: clubIcon
		},
		{
			href: '/elenco',
			label: 'Elenco',
			description: 'Atletas e filtros',
			icon: squadIcon
		},
		{
			href: '/analises',
			label: 'Análises',
			description: 'Dados e indicadores',
			icon: analysisIcon
		},
		{
			href: '/conquistas',
			label: 'Conquistas',
			description: 'Histórico do clube',
			icon: achievementsIcon
		}
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';

		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function getCurrentLabel(pathname: string): string {
		return links.find((link) => isPathActive(link.href, pathname))?.label ?? 'Clube';
	}

	function isPathActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';

		return pathname === href || pathname.startsWith(`${href}/`);
	}
</script>

<!-- Cabeçalho compacto para telas menores -->
<header
	class="fixed inset-x-4 top-4 z-40 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-neutral-950/95 px-3 py-2.5 shadow-2xl shadow-black/20 sm:inset-x-6 xl:hidden"
>
	<p class="text-xs">
		Dados atualizados em {formatDateTime(generatedAt)}
	</p>

	<span class="ui-chip shrink-0">{getCurrentLabel(page.url.pathname)}</span>
</header>

<!-- Navegação persistente em telas grandes -->
<aside
	class="fixed inset-y-0 left-6 z-40 hidden w-56 items-center xl:flex"
	aria-label="Menu lateral"
>
	<div
		class="w-full rounded-3xl border border-white/10 bg-neutral-950/90 p-3 shadow-2xl shadow-black/20"
	>
		<nav aria-label="Navegação principal">
			<ul class="space-y-1.5">
				{#each links as link (link.href)}
					<li>
						<a
							href={resolve(link.href)}
							onpointerenter={() => void preloadBackground(link.href)}
							onfocus={() => void preloadBackground(link.href)}
							aria-current={isActive(link.href) ? 'page' : undefined}
							class={`group flex items-center gap-3 rounded-2xl px-3 py-3 outline-none transition-colors ${
								isActive(link.href)
									? 'bg-white/10 text-white'
									: 'text-neutral-300 hover:bg-white/5 hover:text-white'
							}`}
						>
							<img src={link.icon} alt="" aria-hidden="true" class="size-10 object-contain" />
							<span class="min-w-0 flex-1">
								<span class="block text-sm font-bold">{link.label}</span>
							</span>
							<span
								class="text-sm text-neutral-300 transition-transform group-hover:translate-x-0.5"
								>{isActive(link.href) ? '' : '→'}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-5 border-t border-white/10 px-3 pt-3">
			<p class="text-sm leading-4">
				Dados atualizados em {formatDateTime(generatedAt)}
			</p>
		</div>
	</div>
</aside>

<!-- Navegação inferior para telas menores -->
<nav class="fixed inset-x-3 bottom-3 z-50 xl:hidden" aria-label="Navegação principal">
	<ul
		class="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-neutral-950/95 p-1.5 shadow-2xl shadow-black/30"
	>
		{#each links as link (link.href)}
			<li class="min-w-0">
				<a
					href={resolve(link.href)}
					onpointerenter={() => void preloadBackground(link.href)}
					onfocus={() => void preloadBackground(link.href)}
					aria-current={isActive(link.href) ? 'page' : undefined}
					class={`relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold outline-none transition-colors ${
						isActive(link.href)
							? 'bg-white/10 text-white'
							: 'text-neutral-500 hover:bg-white/5 hover:text-neutral-200'
					}`}
				>
					<span class="grid h-8 w-9 place-items-center rounded-lg">
						<img src={link.icon} alt="" aria-hidden="true" class="h-7 w-7 object-contain" />
					</span>
					<span class="max-w-full truncate">{link.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
