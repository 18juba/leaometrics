<script>
	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import { bandeirasPt } from '$lib/dictionaries/flagsDictionary';

	let { data } = $props();

	const club = $derived(data.clubProfile);

	let sortOrder = $state('desc');

	function toggleOrder() {
		sortOrder =
			sortOrder === 'desc'
				? 'asc'
				: 'desc';
	}

	const club_players = $derived(
		(data.clubPlayers?.players ?? []).toSorted(
			(a, b) => {
				const valA =
					Number(a.marketValue) || 0;

				const valB =
					Number(b.marketValue) || 0;

				return sortOrder === 'desc'
					? valB - valA
					: valA - valB;
			}
		)
	);

	function handlePlayerImageError(event) {
		const image = event.currentTarget;

		image.onerror = null;
		image.src =
			'/images/players/placeholder.webp';
	}
</script>

<svelte:head>
	<title>LeãoFut - Clube</title>

	<meta
		name="description"
		content="Informações gerais, estádio, elenco e valor de mercado do clube."
	/>
</svelte:head>

<div
	class="
		w-full min-w-0
		py-2
		sm:py-3
		md:py-0
	"
>
	<div
		class="
			mx-auto
			grid w-full
			max-w-[1800px]
			grid-cols-1
			gap-3

			sm:gap-4

			md:grid-cols-2

			xl:grid-cols-3
			xl:gap-6
            pb-30
            2xl:pb-8
		"
	>
		<!-- Informações principais -->
		<section
			class="
				group
				relative overflow-hidden
				rounded-xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-4
				backdrop-blur-lg

				sm:rounded-2xl
				sm:p-5

				md:col-span-2

				xl:col-span-3
				xl:p-6
			"
		>
			<div
				class="
					pointer-events-none
					absolute -right-10 -top-10
					h-40 w-40
					rounded-full
					bg-(--primary)
					opacity-10
					blur-3xl
					transition-opacity duration-300
					group-hover:opacity-20
				"
			></div>

			<div
				class="
					relative
					flex flex-col
					gap-5

					lg:flex-row
					lg:items-start
					lg:justify-between
					lg:gap-8
				"
			>
				<div
					class="
						flex min-w-0
						items-start gap-3

						sm:gap-4
					"
				>
					<img
						src="/images/escudo.png"
						alt={club.name}
						class="
							h-16 w-16
							shrink-0
							object-contain

							sm:h-20 sm:w-20
						"
					/>

					<div class="min-w-0 flex-1">
						<span
							class="
								block
								text-[10px] font-semibold
								uppercase tracking-wider
								text-(--golden)

								sm:text-xs
							"
						>
							{club.league.name}
							({club.league.tier})
						</span>

						<h1
							class="
								mt-1
								wrap-break-word
								text-2xl font-bold
								tracking-tight

								sm:text-3xl
							"
						>
							{club.name}
						</h1>

						<p
							class="
								mt-1
								wrap-break-word
								text-xs
								text-neutral-400

								sm:text-sm
							"
						>
							{club.addressLine1},
							{club.addressLine2}
						</p>
					</div>
				</div>

				<div
					class="
						min-w-0
						border-t
						border-(--tertiary)/10
						pt-4

						lg:shrink-0
						lg:border-l
						lg:border-t-0
						lg:pl-8
						lg:pt-0
						lg:text-right
					"
				>
					<span
						class="
							block
							text-[10px] font-semibold
							uppercase tracking-wider
							text-neutral-400

							sm:text-xs
						"
					>
						Valor total do elenco
					</span>

					<span
						class="
							mt-1 block
							wrap-break-word
							text-3xl font-black
							tracking-tight
							text-(--golden)

							sm:text-4xl

							xl:text-5xl
						"
					>
						{formatCurrency(
							club.currentMarketValue
						)}
					</span>
				</div>
			</div>

			<div
				class="
					relative
					mt-5
					grid grid-cols-2
					gap-x-4 gap-y-4
					border-t
					border-(--tertiary)/10
					pt-4

					sm:mt-8
					sm:grid-cols-3
					sm:gap-x-6

					lg:grid-cols-5
				"
			>
				<div class="min-w-0">
					<span
						class="
							block
							text-[10px]
							text-neutral-500

							sm:text-xs
						"
					>
						Fundado em
					</span>

					<span
						class="
							mt-1 block
							truncate
							text-sm font-medium
						"
					>
						{club.foundedOn || 'N/A'}
					</span>
				</div>

				<div class="min-w-0">
					<span
						class="
							block
							text-[10px]
							text-neutral-500

							sm:text-xs
						"
					>
						Site
					</span>

					<a
						href={`https://${club.website}`}
						target="_blank"
						rel="noopener noreferrer"
						title={club.website}
						class="
							mt-1 block
							truncate
							text-sm font-bold
							transition-colors
							hover:text-(--secondary)
							hover:underline
						"
					>
						{club.website?.replace(
							'www.',
							''
						) || 'N/A'}
					</a>
				</div>

				<div class="min-w-0">
					<span
						class="
							block
							text-[10px]
							text-neutral-500

							sm:text-xs
						"
					>
						Atletas
					</span>

					<span
						class="
							mt-1 block
							text-sm font-bold
						"
					>
						{club.squad.size}
					</span>
				</div>

				<div class="min-w-0">
					<span
						class="
							block
							text-[10px]
							text-neutral-500

							sm:text-xs
						"
					>
						Estrangeiros
					</span>

					<span
						class="
							mt-1 block
							text-sm font-bold
						"
					>
						{club.squad.foreigners}
					</span>
				</div>
			</div>
		</section>

		<!-- Estádio -->
		<section
			class="
				flex min-w-0
				flex-col
				rounded-xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-4
				backdrop-blur-lg

				sm:rounded-2xl
				sm:p-5

				md:col-span-2

				xl:col-span-2
				xl:p-6
			"
		>
			<div
				class="
					mb-3
					flex flex-col
					gap-2

					sm:mb-4
					sm:flex-row
					sm:items-center
					sm:justify-between
				"
			>
				<h2
					class="
						min-w-0
						break-words
						text-xs font-semibold
						uppercase tracking-wider
						text-neutral-400

						sm:text-sm
					"
				>
					{club.stadiumName}
				</h2>

				<span
					class="
						self-start
						whitespace-nowrap
						rounded-md
						bg-(--golden)
						px-2 py-1
						text-[10px] font-bold
						text-(--tertiary)

						sm:self-auto
						sm:text-xs
					"
				>
					{club.stadiumSeats?.toLocaleString(
						'pt-BR'
					)}
					assentos
				</span>
			</div>

			<div
				class="
					relative
					overflow-hidden
					rounded-xl
					bg-neutral-900/40
				"
			>
				<img
					src="/images/castelao.jpg"
					alt={club.stadiumName}
					class="
						h-52 w-full
						object-cover

						sm:h-72

						lg:h-80

						xl:h-full
					"
				/>

				<div
					class="
						pointer-events-none
						absolute inset-x-0 bottom-0
						h-20
						bg-linear-to-t
						from-neutral-950/50
						to-transparent
					"
				></div>
			</div>
		</section>

		<!-- Jogadores mais/menos valiosos -->
		<section
			class="
				flex min-w-0
				flex-col
				rounded-xl
				border border-(--tertiary)/5
				bg-neutral-800/50
				p-4
				backdrop-blur-lg

				sm:rounded-2xl
				sm:p-5

				md:col-span-2

				xl:col-span-1
				xl:p-6
			"
		>
			<div
				class="
					mb-4
					flex items-start
					justify-between
					gap-3
				"
			>
				<h2
					class="
						min-w-0
						text-xs font-semibold
						uppercase tracking-wider
						text-neutral-400

						sm:text-sm
					"
				>
					Jogadores
					{sortOrder === 'asc'
						? 'menos'
						: 'mais'}
					valiosos

					<span
						class="
							ml-1
							whitespace-nowrap
							text-[9px]
							text-neutral-500

							sm:text-[10px]
						"
					>
						(10 total)
					</span>
				</h2>

				<button
					type="button"
					onclick={toggleOrder}
					aria-label={
						sortOrder === 'desc'
							? 'Exibir jogadores menos valiosos'
							: 'Exibir jogadores mais valiosos'
					}
					title={
						sortOrder === 'desc'
							? 'Ordenar do menor valor'
							: 'Ordenar do maior valor'
					}
					class="
						flex h-8 w-8
						shrink-0
						cursor-pointer
						items-center justify-center
						rounded-lg
						bg-(--secondary)
						text-sm font-bold
						transition-colors
						hover:bg-(--secondary)/80
					"
				>
					<span
						class="
							inline-block
							transition-transform
							duration-200
						"
						class:rotate-180={
							sortOrder === 'asc'
						}
					>
						↓
					</span>
				</button>
			</div>

			<div
				class="
					max-h-[28rem]
					flex-1
					space-y-2.5
					overflow-y-auto
					overscroll-contain
					pr-1
					custom-scrollbar

					sm:space-y-3
				"
			>
				{#each club_players.slice(0, 10) as player, i (player.id)}
					<div
						class="
							grid
							grid-cols-[minmax(0,1fr)_auto]
							items-center
							gap-2
							overflow-hidden
							rounded-lg
							bg-neutral-900/30
							p-2
							transition-colors
							hover:bg-neutral-900/60

							sm:gap-3
						"
					>
						<div
							class="
								flex min-w-0
								items-center gap-2

								sm:gap-3
							"
						>
							<img
								src={`/images/players/${player.id}.webp`}
								alt={player.name}
								onerror={handlePlayerImageError}
								class="
									h-10 w-10
									shrink-0
									rounded-full
									bg-(--tertiary)/20
									object-contain

									sm:h-12 sm:w-12
								"
							/>

							<div class="min-w-0 flex-1">
								<div
									class="
										flex min-w-0
										items-center
										gap-1.5
									"
								>
									<span
										class="
											min-w-0
											truncate
											text-xs font-medium
											text-neutral-200

											sm:text-sm
										"
										title={player.name}
									>
										{player.name}
									</span>

									<span
										class="
											shrink-0
											text-base leading-none

											sm:text-lg
										"
										title={
											player.nationality?.[0] ??
											'Nacionalidade não informada'
										}
										aria-label={
											player.nationality?.[0] ??
											'Nacionalidade não informada'
										}
									>
										<span aria-hidden="true">
											{bandeirasPt[
												player
													.nationality?.[0]
											] ?? '🌎'}
										</span>
									</span>
								</div>

								<span
									class="
										mt-0.5 block
										truncate
										text-[9px]
										uppercase tracking-tight
										text-neutral-400

										sm:text-[10px]
									"
								>
									{player.position}
									•
									{player.age
										? `${player.age} anos`
										: 'Idade N/A'}
								</span>
							</div>
						</div>

						<span
							class="
								shrink-0
								whitespace-nowrap
								pl-1
								text-[10px] font-black
								text-(--golden)

								sm:pl-2
								sm:text-xs
							"
						>
							{formatCurrency(
								player.marketValue
							)}
						</span>
					</div>
				{/each}
			</div>

			<a
				href="/elenco"
				class="
					mt-4
					w-full
					rounded-xl
					bg-(--secondary)
					px-4 py-2.5
					text-center
					text-xs font-semibold
					transition-colors
					hover:bg-(--secondary)/80
				"
			>
				Ver elenco completo
			</a>
		</section>
	</div>
</div>