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
</script>

<!-- Navegação persistente em telas grandes -->
<aside
	class="fixed inset-y-0 left-6 z-40 hidden w-58 items-center xl:flex"
	aria-label="Menu lateral"
>
	<div
		class="w-full rounded-3xl border border-white/10 bg-neutral-950/92 p-4 shadow-2xl shadow-black/30"
	>
		<nav aria-label="Navegação principal">
			<ul class="space-y-1">
				{#each links as link (link.href)}
					<li>
						<a
							href={resolve(link.href)}
							onpointerenter={() => void preloadBackground(link.href)}
							onfocus={() => void preloadBackground(link.href)}
							aria-current={isActive(link.href) ? 'page' : undefined}
							class={`nav-link group flex items-center gap-3 rounded-2xl px-3 py-3 outline-none transition-colors ${
								isActive(link.href)
									? 'border-white/10 bg-white/10 text-white'
									: 'text-neutral-300 hover:border-white/5 hover:bg-white/5 hover:text-white'
							}`}
						>
							<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-neutral-900/55">
								<img src={link.icon} alt="" aria-hidden="true" class="size-8 object-contain" />
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-sm font-bold">{link.label}</span>
								<span class="mt-0.5 block text-[10px] text-neutral-400">{link.description}</span>
							</span>
							<span
								class="text-sm text-neutral-400 transition-transform group-hover:translate-x-0.5"
								>{isActive(link.href) ? '' : '→'}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-5 border-t border-white/10 px-3 pt-3">
			<p class="text-xs text-neutral-400">
				Dados atualizados em
			</p>
			<p class="mt-1 text-sm font-semibold leading-4 text-neutral-200 mb-4">
				{formatDateTime(generatedAt)}
			</p>

			<p class="text-xs text-neutral-400">
				Desenvolvido por
			</p>
			<a href="https://jorge-lucas.vercel.app/" target="_blank" rel="noopener noreferrer" class="mt-1 block text-sm font-semibold leading-4 text-neutral-200 hover:underline">
				Lucas
			</a>
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
					class={`nav-link relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold outline-none transition-colors ${
						isActive(link.href)
							? 'border-white/10 bg-white/10 text-white'
							: 'text-neutral-500 hover:border-white/5 hover:bg-white/5 hover:text-neutral-200'
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
