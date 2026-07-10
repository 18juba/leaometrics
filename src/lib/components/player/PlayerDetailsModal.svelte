<script lang="ts">
	import PlayerMarketValueChart from './PlayerMarketValueChart.svelte';
	import PlayerTransferTimeline from './PlayerTransferTimeline.svelte';

	import { formatCurrency } from '$lib/formatters/formatCurrency';

    import type { ClubPlayers } from '$lib/types/clubPlayers';
    import type { PlayerMarketValueHistory } from '$lib/types/playerValue';
    import type { PlayerProfile } from '$lib/types/playerProfile';
    import type { PlayerTransfer, PlayerTransfers } from '$lib/types/playerTransfers';

	type ClubPlayer = ClubPlayers['players'][number];
	type Tab = 'overview' | 'market' | 'transfers';
	type LoadState = 'idle' | 'loading' | 'success' | 'error';

	let {
		player,
		onClose
	}: {
		player: ClubPlayer;
		onClose: () => void;
	} = $props();

	let activeTab = $state<Tab>('overview');

	let profile = $state<PlayerProfile | null>(null);
	let profileState = $state<LoadState>('loading');
	let profileError = $state<string | null>(null);

	let marketHistory = $state<PlayerMarketValueHistory | null>(null);
	let marketState = $state<LoadState>('idle');
	let marketError = $state<string | null>(null);

	let transfers = $state<PlayerTransfer[]>([]);
	let transfersState = $state<LoadState>('idle');
	let transfersError = $state<string | null>(null);

	const socialLinks = $derived(
		(profile?.socialMedia ?? []).filter((link) =>
			/^https?:\/\//i.test(link)
		)
	);

	const playerImage = $derived(
		profile?.imageUrl || `/images/players/${player.id}.webp`
	);

	$effect(() => {
		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	$effect(() => {
		const playerId = player.id;
		const controller = new AbortController();

		activeTab = 'overview';

		profile = null;
		profileState = 'loading';
		profileError = null;

		marketHistory = null;
		marketState = 'idle';
		marketError = null;

		transfers = [];
		transfersState = 'idle';
		transfersError = null;

		void loadProfile(playerId, controller.signal);

		return () => {
			controller.abort();
		};
	});

	async function fetchJson<T>(
		url: string,
		signal?: AbortSignal
	): Promise<T> {
		const response = await fetch(url, { signal });

		if (!response.ok) {
			throw new Error(
				`A API respondeu com o status ${response.status}.`
			);
		}

		return response.json() as Promise<T>;
	}

	async function loadProfile(
		playerId = player.id,
		signal?: AbortSignal
	) {
		profileState = 'loading';
		profileError = null;

		try {
			profile = await fetchJson<PlayerProfile>(
				`/api/players/${playerId}`,
				signal
			);

			profileState = 'success';
		} catch (error) {
			if (
				error instanceof DOMException &&
				error.name === 'AbortError'
			) {
				return;
			}

			profileState = 'error';
			profileError = getErrorMessage(error);
		}
	}

	async function loadMarketValue() {
		if (marketState === 'loading') return;

		marketState = 'loading';
		marketError = null;

		try {
			marketHistory =
				await fetchJson<PlayerMarketValueHistory>(
					`/api/player_value/${player.id}`
				);

			marketState = 'success';
		} catch (error) {
			marketState = 'error';
			marketError = getErrorMessage(error);
		}
	}

	async function loadTransfers() {
		if (transfersState === 'loading') return;

		transfersState = 'loading';
		transfersError = null;

		try {
			const payload = await fetchJson<
				PlayerTransfers | PlayerTransfer[]
			>(`/api/player_transfers/${player.id}`);

			transfers = Array.isArray(payload)
				? payload
				: payload.transfers ?? [];

			transfersState = 'success';
		} catch (error) {
			transfersState = 'error';
			transfersError = getErrorMessage(error);
		}
	}

	function selectTab(tab: Tab) {
		activeTab = tab;

		if (tab === 'market' && marketState === 'idle') {
			void loadMarketValue();
		}

		if (tab === 'transfers' && transfersState === 'idle') {
			void loadTransfers();
		}
	}

	function getErrorMessage(error: unknown) {
		if (error instanceof Error) {
			return error.message;
		}

		return 'Ocorreu um erro inesperado.';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleImageError(event: Event) {
		const image = event.currentTarget as HTMLImageElement;

		image.onerror = null;
		image.src = '/images/players/placeholder.webp';
	}

	function formatHeight(height: number) {
		if (!height) return 'N/A';

		return height > 3
			? `${height} cm`
			: `${height.toLocaleString('pt-BR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})} m`;
	}

	function formatFoot(foot: string) {
		const normalizedFoot = foot?.trim().toLowerCase();

		const translations: Record<string, string> = {
			right: 'Direito',
			left: 'Esquerdo',
			both: 'Ambos',
			rightfoot: 'Direito',
			leftfoot: 'Esquerdo',
			ambidextrous: 'Ambos',
			direito: 'Direito',
			esquerdo: 'Esquerdo',
			ambos: 'Ambos'
		};

		return translations[normalizedFoot] ?? foot ?? 'N/A';
	}

	function formatDate(value: string) {
		if (!value) return 'N/A';

		const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
			? `${value}T12:00:00`
			: value;

		const date = new Date(normalizedValue);

		if (Number.isNaN(date.getTime())) {
			return value;
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
	<button
		type="button"
		onclick={onClose}
		aria-label="Fechar detalhes do jogador"
		class="
			absolute inset-0
			cursor-default
			bg-black/80
			backdrop-blur-sm
		"
	></button>

	<section
		role="dialog"
		aria-modal="true"
		aria-labelledby="player-details-title"
		class="
			relative z-10
			flex max-h-[94vh]
			w-full max-w-6xl
			flex-col
			overflow-hidden
			rounded-3xl
			border border-(--tertiary)/10
			bg-neutral-900
			shadow-2xl shadow-black/60
		"
	>
		<button
			type="button"
			onclick={onClose}
			aria-label="Fechar"
			class="
				absolute right-4 top-4 z-30
				flex h-10 w-10
				items-center justify-center
				rounded-full
				border border-white/5
				bg-neutral-950/80
				text-xl text-neutral-300
				backdrop-blur-md
				transition-colors
				hover:bg-neutral-800
				hover:text-white
			"
		>
			×
		</button>

		<header
			class="
				relative
				flex shrink-0
				items-center gap-4
				overflow-hidden
				border-b border-(--tertiary)/5
				bg-neutral-950/35
				p-4 pr-16
				sm:p-5 sm:pr-20
			"
		>
			<div
				class="
					pointer-events-none
					absolute -left-12 top-0
					h-32 w-32
					rounded-full
					bg-(--primary)
					opacity-15 blur-3xl
				"
			></div>

			<div
				class="
					relative
					h-16 w-16
					shrink-0 overflow-hidden
					rounded-2xl
					bg-neutral-800/70
					sm:h-20 sm:w-20
				"
			>
				<img
					src={playerImage}
					alt={profile?.name || player.name}
					onerror={handleImageError}
					class="h-full w-full object-contain object-bottom"
				/>
			</div>

			<div class="relative min-w-0">
				<span
					class="
						text-[10px] font-bold uppercase
						tracking-[0.2em]
						text-(--golden)
					"
				>
					{profile?.position?.main ||
						player.position ||
						'Sem posição'}
				</span>

				<h2
					id="player-details-title"
					class="
						truncate
						text-xl font-black tracking-tight
						text-neutral-100
						sm:text-3xl
					"
				>
					{profile?.name || player.name}
				</h2>

				<p class="mt-0.5 truncate text-xs text-neutral-500 sm:text-sm">
					{profile?.fullName ||
						player.nationality?.join(' • ') ||
						'Informações do atleta'}
				</p>
			</div>

			<div class="ml-auto hidden shrink-0 text-right md:block">
				<span
					class="
						block
						text-[9px] uppercase tracking-wider
						text-neutral-500
					"
				>
					Valor atual
				</span>

				<span class="text-xl font-black text-(--golden)">
					{formatCurrency(
						profile?.marketValue ||
							Number(player.marketValue) ||
							0
					)}
				</span>
			</div>
		</header>

		<nav
			class="
				flex shrink-0
				gap-1
				overflow-x-auto
				border-b border-(--tertiary)/5
				bg-neutral-900
				p-2
				custom-scrollbar
			"
			aria-label="Seções do jogador"
		>
			<button
				type="button"
				onclick={() => selectTab('overview')}
				class={`
					shrink-0 rounded-xl
					px-4 py-2.5
					text-xs font-bold
					transition-colors
					${
						activeTab === 'overview'
							? 'bg-(--secondary) text-white'
							: 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
					}
				`}
			>
				Visão geral
			</button>

			<button
				type="button"
				onclick={() => selectTab('market')}
				class={`
					shrink-0 rounded-xl
					px-4 py-2.5
					text-xs font-bold
					transition-colors
					${
						activeTab === 'market'
							? 'bg-(--secondary) text-white'
							: 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
					}
				`}
			>
				Valorização
			</button>

			<button
				type="button"
				onclick={() => selectTab('transfers')}
				class={`
					shrink-0 rounded-xl
					px-4 py-2.5
					text-xs font-bold
					transition-colors
					${
						activeTab === 'transfers'
							? 'bg-(--secondary) text-white'
							: 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
					}
				`}
			>
				Transferências
			</button>
		</nav>

		<div class="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar sm:p-6">
			{#if activeTab === 'overview'}
				{#if profileState === 'loading'}
					<div class="animate-pulse space-y-5">
						<div class="h-24 rounded-2xl bg-neutral-800/70"></div>

						<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
							{#each Array(4) as _}
								<div class="h-24 rounded-xl bg-neutral-800/70"></div>
							{/each}
						</div>

						<div class="h-48 rounded-2xl bg-neutral-800/70"></div>
					</div>
				{:else if profileState === 'error'}
					<div
						class="
							flex min-h-80 flex-col
							items-center justify-center
							rounded-2xl
							border border-red-400/10
							bg-red-400/5
							p-6 text-center
						"
					>
						<h3 class="font-bold text-red-300">
							Não foi possível carregar o perfil
						</h3>

						<p class="mt-1 text-xs text-neutral-500">
							{profileError}
						</p>

						<button
							type="button"
							onclick={() => loadProfile()}
							class="
								mt-4 rounded-xl
								bg-(--secondary)
								px-4 py-2
								text-xs font-bold
								transition-opacity
								hover:opacity-80
							"
						>
							Tentar novamente
						</button>
					</div>
				{:else if profile}
					<div class="space-y-6">
						<div
							class="
								flex flex-col gap-5
								rounded-2xl
								border border-(--tertiary)/5
								bg-neutral-950/35
								p-5
								md:flex-row
								md:items-start
								md:justify-between
							"
						>
							<div class="max-w-2xl">
								<span
									class="
										text-[10px] font-bold uppercase
										tracking-wider text-neutral-500
									"
								>
									Perfil
								</span>

								<h3 class="mt-1 text-2xl font-black text-neutral-100">
									{profile.fullName || profile.name}
								</h3>

								{#if profile.description}
									<p
										class="
											mt-3
											text-sm leading-relaxed
											text-neutral-400
										"
									>
										{profile.description}
									</p>
								{/if}
							</div>

							<div
								class="
									rounded-xl
									bg-neutral-900/60
									p-4
									md:min-w-48 md:text-right
								"
							>
								<span
									class="
										block
										text-[9px] uppercase tracking-wider
										text-neutral-500
									"
								>
									Valor de mercado
								</span>

								<span
									class="
										mt-1 block
										text-2xl font-black
										text-(--golden)
									"
								>
									{formatCurrency(profile.marketValue || 0)}
								</span>
							</div>
						</div>

						<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
							<div class="rounded-xl bg-neutral-950/40 p-4">
								<span
									class="
										text-[10px] uppercase tracking-wider
										text-neutral-500
									"
								>
									Posição principal
								</span>

								<span
									class="
										mt-1 block
										text-sm font-bold text-neutral-200
									"
								>
									{profile.position?.main || 'N/A'}
								</span>
							</div>

							<div class="rounded-xl bg-neutral-950/40 p-4">
								<span
									class="
										text-[10px] uppercase tracking-wider
										text-neutral-500
									"
								>
									Altura
								</span>

								<span
									class="
										mt-1 block
										text-sm font-bold text-neutral-200
									"
								>
									{formatHeight(profile.height)}
								</span>
							</div>

							<div class="rounded-xl bg-neutral-950/40 p-4">
								<span
									class="
										text-[10px] uppercase tracking-wider
										text-neutral-500
									"
								>
									Pé preferido
								</span>

								<span
									class="
										mt-1 block
										text-sm font-bold text-neutral-200
									"
								>
									{formatFoot(profile.foot)}
								</span>
							</div>

							<div class="rounded-xl bg-neutral-950/40 p-4">
								<span
									class="
										text-[10px] uppercase tracking-wider
										text-neutral-500
									"
								>
									Camisa
								</span>

								<span
									class="
										mt-1 block
										text-sm font-bold text-neutral-200
									"
								>
									{profile.shirtNumber || 'N/A'}
								</span>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<section
								class="
									rounded-2xl
									border border-(--tertiary)/5
									bg-neutral-950/30
									p-5
								"
							>
								<h3
									class="
										text-xs font-bold uppercase
										tracking-wider text-neutral-400
									"
								>
									Carreira atual
								</h3>

								<div class="mt-5 space-y-4">
									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Clube
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{profile.club?.name || 'N/A'}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											No clube desde
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{formatDate(profile.club?.joined)}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Contrato até
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{formatDate(
												profile.club?.contractExpires
											)}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Outras posições
										</span>

										<span
											class="
												max-w-[65%]
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{profile.position?.other?.join(', ') ||
												'N/A'}
										</span>
									</div>
								</div>
							</section>

							<section
								class="
									rounded-2xl
									border border-(--tertiary)/5
									bg-neutral-950/30
									p-5
								"
							>
								<h3
									class="
										text-xs font-bold uppercase
										tracking-wider text-neutral-400
									"
								>
									Informações pessoais
								</h3>

								<div class="mt-5 space-y-4">
									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Naturalidade
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{[
												profile.placeOfBirth?.city,
												profile.placeOfBirth?.country
											]
												.filter(Boolean)
												.join(', ') || 'N/A'}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Cidadania
										</span>

										<span
											class="
												max-w-[65%]
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{profile.citizenship?.join(', ') ||
												'N/A'}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Agente
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{profile.agent?.name || 'N/A'}
										</span>
									</div>

									<div
										class="
											flex items-start
											justify-between gap-5
										"
									>
										<span class="text-xs text-neutral-500">
											Fornecedor
										</span>

										<span
											class="
												text-right text-sm
												font-bold text-neutral-200
											"
										>
											{profile.outfitter || 'N/A'}
										</span>
									</div>
								</div>
							</section>
						</div>

						{#if profile.relatives?.length}
							<section
								class="
									rounded-2xl
									border border-(--tertiary)/5
									bg-neutral-950/30
									p-5
								"
							>
								<h3
									class="
										text-xs font-bold uppercase
										tracking-wider text-neutral-400
									"
								>
									Parentes no futebol
								</h3>

								<div
									class="
										mt-4
										grid grid-cols-1 gap-3
										sm:grid-cols-2 lg:grid-cols-3
									"
								>
									{#each profile.relatives as relative (relative.id)}
										<div
											class="
												rounded-xl
												bg-neutral-900/60
												p-4
											"
										>
											<span
												class="
													block truncate
													text-sm font-bold
													text-neutral-200
												"
											>
												{relative.name}
											</span>

											<span
												class="
													mt-1 block
													text-[10px] uppercase
													tracking-wider
													text-neutral-500
												"
											>
												{relative.profileType ||
													'Perfil relacionado'}
											</span>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if socialLinks.length}
							<div class="flex flex-wrap gap-2">
								{#each socialLinks as link, index (link)}
									<a
										href={link}
										target="_blank"
										rel="noopener noreferrer"
										class="
											rounded-xl
											border border-(--tertiary)/5
											bg-neutral-950/40
											px-4 py-2
											text-xs font-bold
											text-neutral-300
											transition-colors
											hover:border-(--secondary)/40
											hover:text-(--secondary)
										"
									>
										Rede social {index + 1}
									</a>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{:else if activeTab === 'market'}
				<PlayerMarketValueChart
					history={marketHistory}
					loading={marketState === 'loading'}
					error={marketError}
					onRetry={loadMarketValue}
				/>
			{:else if activeTab === 'transfers'}
				<PlayerTransferTimeline
					{transfers}
					loading={transfersState === 'loading'}
					error={transfersError}
					onRetry={loadTransfers}
				/>
			{/if}
		</div>
	</section>
</div>