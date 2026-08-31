<script lang="ts">
	import { onMount, tick } from 'svelte';

	import PlayerMarketValueChart from './PlayerMarketValueChart.svelte';
	import PlayerTransferTimeline from './PlayerTransferTimeline.svelte';

	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import { formatHeight } from '$lib/formatters/formatHeight';
	import { formatFoot } from '$lib/formatters/formatFoot';
	import { countryDictionary } from '$lib/dictionaries/countryDictionary';
	import { getPositionLabel } from '$lib/components/elenco/elenco.utils';

	import type { ClubPlayer } from '$lib/components/elenco/elenco.types';

	type Tab = 'overview' | 'market' | 'transfers';

	let {
		player,
		onClose
	}: {
		player: ClubPlayer;
		onClose: () => void;
	} = $props();

	let activeTab = $state<Tab>('overview');
	let dialogElement = $state<HTMLElement | null>(null);
	let closeButtonElement = $state<HTMLButtonElement | null>(null);

	let previouslyFocused: HTMLElement | null = null;

	const FOCUSABLE_SELECTOR = [
		'a[href]',
		'button:not([disabled])',
		'textarea:not([disabled])',
		'input:not([disabled])',
		'select:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(', ');

	const profile = $derived(player.profile ?? null);
	const marketHistory = $derived(player.marketValueData ?? null);
	const transfers = $derived(player.transferData?.transfers ?? []);
	const requestErrors = $derived(player.requestErrors ?? []);

	const hasDetailedProfile = $derived(Boolean(profile && Object.keys(profile).length > 0));

	const socialLinks = $derived(
		(profile?.socialMedia ?? []).filter((link) => /^https?:\/\//i.test(link))
	);

	const playerImage = $derived(profile?.imageUrl || `/images/players/${player.id}.webp`);

	const translatedNationalities = $derived(
		(player.nationality ?? []).map((country) => countryDictionary[country] ?? country)
	);

	const translatedCitizenships = $derived(
		(profile?.citizenship ?? []).map((country) => countryDictionary[country] ?? country)
	);

	const tabs = [
		{ value: 'overview' as const, label: 'Visão geral' },
		{ value: 'market' as const, label: 'Valorização' },
		{ value: 'transfers' as const, label: 'Transferências' }
	];

	$effect(() => {
		if (player.id) {
			activeTab = 'overview';
		}
	});

	function getFocusableElements(): HTMLElement[] {
		if (!dialogElement) return [];

		return Array.from(dialogElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
			(element) =>
				!element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
		);
	}

	function selectTab(tab: Tab): void {
		activeTab = tab;
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}

		if (event.key !== 'Tab' || !dialogElement) return;

		const focusable = getFocusableElements();

		if (focusable.length === 0) {
			event.preventDefault();
			dialogElement.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (event.shiftKey) {
			if (active === first || !dialogElement.contains(active)) {
				event.preventDefault();
				last.focus();
			}
			return;
		}

		if (active === last || !dialogElement.contains(active)) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleImageError(event: Event): void {
		const image = event.currentTarget as HTMLImageElement;
		image.onerror = null;
		image.src = '/images/players/placeholder.webp';
	}

	function formatDate(value: string | null | undefined): string {
		if (!value) return 'N/A';

		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
		if (!match) return value;

		const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

		if (Number.isNaN(date.getTime())) return value;

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(date);
	}

	function translateCountry(country: string | null | undefined): string {
		if (!country) return '';
		return countryDictionary[country] ?? country;
	}

	onMount(() => {
		previouslyFocused = document.activeElement as HTMLElement | null;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		void tick().then(() => {
			if (closeButtonElement) {
				closeButtonElement.focus();
			} else {
				dialogElement?.focus();
			}
		});

		return () => {
			document.body.style.overflow = previousOverflow;
			previouslyFocused?.focus?.();
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
	<button
		type="button"
		tabindex="-1"
		onclick={onClose}
		aria-label="Fechar detalhes do jogador"
		class="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
	></button>

	<section
		bind:this={dialogElement}
		aria-labelledby="player-details-title"
		tabindex="-1"
		class="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-(--tertiary)/10 bg-neutral-900 shadow-2xl shadow-black/60 outline-none"
	>
		<button
			bind:this={closeButtonElement}
			type="button"
			onclick={onClose}
			aria-label="Fechar"
			class="absolute top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-neutral-950/80 text-xl text-neutral-300 backdrop-blur-md transition-colors hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-(--secondary) focus-visible:outline-none"
		>
			×
		</button>

		<header
			class="relative flex shrink-0 items-center gap-4 overflow-hidden border-b border-(--tertiary)/5 bg-neutral-950/35 p-4 pr-16 sm:p-5 sm:pr-20"
		>
			<div
				class="pointer-events-none absolute top-0 -left-12 h-32 w-32 rounded-full bg-(--primary) opacity-15 blur-3xl"
			></div>

			<div
				class="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-800/70 sm:h-20 sm:w-20"
			>
				<img
					src={playerImage}
					alt={profile?.name || player.name}
					onerror={handleImageError}
					class="h-full w-full object-contain object-bottom"
				/>
			</div>

			<div class="relative min-w-0">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-[10px] font-bold tracking-[0.2em] text-(--golden) uppercase">
						{getPositionLabel(profile?.position?.main || player.position)}
					</span>

					{#if requestErrors.length > 0}
						<span
							class="rounded-md bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-amber-300 uppercase"
							title="Algumas informações não foram obtidas quando o arquivo foi gerado"
						>
							Dados parciais
						</span>
					{/if}
				</div>

				<h2
					id="player-details-title"
					class="truncate text-xl font-black tracking-tight text-neutral-100 sm:text-3xl"
				>
					{profile?.name || player.name}
				</h2>

				<p class="mt-0.5 truncate text-xs text-neutral-500 sm:text-sm">
					{profile?.fullName || translatedNationalities.join(' • ') || 'Informações do atleta'}
				</p>
			</div>

			<div class="ml-auto hidden shrink-0 text-right md:block">
				<span class="block text-[9px] tracking-wider text-neutral-500 uppercase">
					Valor atual
				</span>
				<span class="text-xl font-black text-(--golden)">
					{formatCurrency(profile?.marketValue ?? player.marketValue ?? 0)}
				</span>
			</div>
		</header>

		<div
			role="tablist"
			aria-label="Seções do jogador"
			class="custom-scrollbar flex shrink-0 gap-1 overflow-x-auto border-b border-(--tertiary)/5 bg-neutral-900 p-2"
		>
			{#each tabs as tab (tab.value)}
				<button
					type="button"
					role="tab"
					id={`player-tab-${tab.value}`}
					aria-selected={activeTab === tab.value}
					aria-controls={`player-tabpanel-${tab.value}`}
					tabindex={activeTab === tab.value ? 0 : -1}
					onclick={() => selectTab(tab.value)}
					class={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-(--secondary) focus-visible:outline-none ${
						activeTab === tab.value
							? 'bg-(--secondary) text-white'
							: 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
					}`}
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<div
			id={`player-tabpanel-${activeTab}`}
			role="tabpanel"
			aria-labelledby={`player-tab-${activeTab}`}
			class="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
		>
			{#if activeTab === 'overview'}
				<div class="space-y-5">
					{#if !hasDetailedProfile}
						<div
							class="rounded-xl border border-amber-400/10 bg-amber-400/5 px-4 py-3 text-xs text-amber-200"
						>
							O perfil detalhado não estava disponível quando o arquivo foi gerado. Os dados básicos
							do elenco continuam disponíveis abaixo.
						</div>
					{/if}

					<div
						class="flex flex-col gap-4 rounded-2xl border border-(--tertiary)/5 bg-neutral-950/35 p-4 sm:p-5 md:flex-row md:items-start md:justify-between"
					>
						<div class="min-w-0 max-w-2xl">
							<span class="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
								Perfil
							</span>
							<h3 class="mt-1 truncate text-xl font-black text-neutral-100 sm:text-2xl">
								{profile?.fullName || profile?.name || player.name}
							</h3>
							<p class="mt-1 text-xs text-neutral-500">
								{translatedNationalities.join(' • ') || 'Nacionalidade não informada'}
							</p>
						</div>

						<div class="rounded-xl bg-neutral-900/60 p-3 md:min-w-48 md:text-right">
							<span class="block text-[9px] tracking-wider text-neutral-500 uppercase">
								Valor de mercado
							</span>
							<span class="mt-1 block text-2xl font-black text-(--golden)">
								{formatCurrency(profile?.marketValue ?? player.marketValue ?? 0)}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] tracking-wider text-neutral-500 uppercase">
								Posição principal
							</span>
							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{getPositionLabel(profile?.position?.main || player.position)}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] tracking-wider text-neutral-500 uppercase"> Altura </span>
							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{formatHeight(profile?.height ?? player.height)}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] tracking-wider text-neutral-500 uppercase">
								Pé preferido
							</span>
							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{formatFoot(profile?.foot ?? player.foot)}
							</span>
						</div>

						<div class="rounded-xl bg-neutral-950/40 p-4">
							<span class="text-[10px] tracking-wider text-neutral-500 uppercase"> Camisa </span>
							<span class="mt-1 block text-sm font-bold text-neutral-200">
								{profile?.shirtNumber || 'N/A'}
							</span>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<section class="rounded-2xl border border-(--tertiary)/5 bg-neutral-950/30 p-5">
							<h3 class="text-xs font-bold tracking-wider text-neutral-400 uppercase">
								Carreira atual
							</h3>

							<div class="mt-5 space-y-4">
								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Clube</span>
									<span class="text-right text-sm font-bold text-neutral-200">
										{profile?.club?.name || 'Fortaleza'}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">No clube desde</span>
									<span class="text-right text-sm font-bold text-neutral-200">
										{formatDate(profile?.club?.joined ?? player.joinedOn)}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Contrato até</span>
									<span class="text-right text-sm font-bold text-neutral-200">
										{formatDate(
											profile?.club?.contractExpires ??
												player.analysis.contract.expiresAt ??
												player.contract
										)}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Contratado de</span>
									<span class="max-w-[65%] text-right text-sm font-bold text-neutral-200">
										{player.signedFrom || 'N/A'}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Outras posições</span>
									<span class="max-w-[65%] text-right text-sm font-bold text-neutral-200">
										{profile?.position?.other?.map(getPositionLabel).join(', ') || 'N/A'}
									</span>
								</div>
							</div>
						</section>

						<section class="rounded-2xl border border-(--tertiary)/5 bg-neutral-950/30 p-5">
							<h3 class="text-xs font-bold tracking-wider text-neutral-400 uppercase">
								Informações pessoais
							</h3>

							<div class="mt-5 space-y-4">
								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Naturalidade</span>
									<span class="max-w-[65%] text-right text-sm font-bold text-neutral-200">
										{[profile?.placeOfBirth?.city, translateCountry(profile?.placeOfBirth?.country)]
											.filter(Boolean)
											.join(', ') || 'N/A'}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Cidadania</span>
									<span class="max-w-[65%] text-right text-sm font-bold text-neutral-200">
										{translatedCitizenships.join(', ') ||
											translatedNationalities.join(', ') ||
											'N/A'}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Agente</span>
									<span class="text-right text-sm font-bold text-neutral-200">
										{profile?.agent?.name || 'N/A'}
									</span>
								</div>

								<div class="flex items-start justify-between gap-5">
									<span class="text-xs text-neutral-500">Fornecedor</span>
									<span class="text-right text-sm font-bold text-neutral-200">
										{profile?.outfitter || 'N/A'}
									</span>
								</div>
							</div>
						</section>
					</div>

					{#if profile?.relatives?.length}
						<section class="rounded-2xl border border-(--tertiary)/5 bg-neutral-950/30 p-5">
							<h3 class="text-xs font-bold tracking-wider text-neutral-400 uppercase">
								Parentes no futebol
							</h3>

							<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{#each profile.relatives as relative (relative.id)}
									<div class="rounded-xl bg-neutral-900/60 p-4">
										<span class="block truncate text-sm font-bold text-neutral-200">
											{relative.name}
										</span>
										<span class="mt-1 block text-[10px] tracking-wider text-neutral-500 uppercase">
											{relative.profileType || 'Perfil relacionado'}
										</span>
									</div>
								{/each}
							</div>
						</section>
					{/if}

					{#if socialLinks.length}
						<div class="flex flex-wrap gap-2">
							{#each socialLinks as link, index (link)}
								<!-- External URL is intentionally not passed through SvelteKit's route resolver. -->
								<!-- eslint-disable svelte/no-navigation-without-resolve -->
								<a
									href={link}
									target="_blank"
									rel="noopener noreferrer"
									class="rounded-xl border border-(--tertiary)/5 bg-neutral-950/40 px-4 py-2 text-xs font-bold text-neutral-300 transition-colors hover:border-(--secondary)/40 hover:text-(--secondary) focus-visible:ring-2 focus-visible:ring-(--secondary) focus-visible:outline-none"
								>
									Rede social {index + 1}
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							{/each}
						</div>
					{/if}
				</div>
			{:else if activeTab === 'market'}
				<PlayerMarketValueChart history={marketHistory} />
			{:else if activeTab === 'transfers'}
				<PlayerTransferTimeline {transfers} />
			{/if}
		</div>
	</section>
</div>
