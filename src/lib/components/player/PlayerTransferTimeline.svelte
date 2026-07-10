<script lang="ts">
	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { PlayerTransfer } from '$lib/types/player';

	type TransferWithFee = PlayerTransfer & {
		fee?: number;
	};

	let {
		transfers,
		loading = false,
		error = null,
		onRetry
	}: {
		transfers: TransferWithFee[];
		loading?: boolean;
		error?: string | null;
		onRetry?: () => void;
	} = $props();

	/*
	 * Ordem cronológica crescente:
	 * transferência mais antiga -> transferência mais recente.
	 *
	 * Não usamos new Date() para ordenar, evitando qualquer interferência
	 * de fuso horário ou interpretação diferente da string.
	 */
	const sortedTransfers = $derived.by(() => {
		return [...(transfers ?? [])].sort((a, b) => {
			const dateDifference =
				getIsoDateKey(a.date) - getIsoDateKey(b.date);

			if (dateDifference !== 0) {
				return dateDifference;
			}

			/*
			 * Critério secundário para manter uma ordenação estável
			 * quando duas transferências possuem a mesma data.
			 */
			return String(a.id).localeCompare(String(b.id), 'pt-BR', {
				numeric: true
			});
		});
	});

	function getIsoDateKey(value: string | null | undefined) {
		if (!value) return Number.MAX_SAFE_INTEGER;

		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

		if (!match) {
			return Number.MAX_SAFE_INTEGER;
		}

		const [, year, month, day] = match;

		return Number(`${year}${month}${day}`);
	}

	function parseIsoDate(value: string) {
		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

		if (!match) return null;

		const year = Number(match[1]);
		const month = Number(match[2]) - 1;
		const day = Number(match[3]);

		/*
		 * Meio-dia local evita que alterações de fuso movam a data
		 * para o dia anterior.
		 */
		const date = new Date(year, month, day, 12);

		return Number.isNaN(date.getTime()) ? null : date;
	}

	function formatDate(value: string) {
		const date = parseIsoDate(value);

		if (!date) {
			return value || 'Data não informada';
		}

		return new Intl.DateTimeFormat('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function formatSeason(season: string) {
		return season || 'Temporada não informada';
	}
</script>

{#if loading}
	<div class="space-y-4 animate-pulse">
		{#each Array(4) as _, index (index)}
			<div class="flex gap-4">
				<div
					class="
						mt-5
						h-4 w-4
						shrink-0
						rounded-full
						bg-neutral-700
					"
				></div>

				<div
					class="
						h-32 w-full
						rounded-2xl
						bg-neutral-800/70
					"
				></div>
			</div>
		{/each}
	</div>
{:else if error}
	<div
		class="
			flex min-h-72 flex-col
			items-center justify-center
			rounded-2xl
			border border-red-400/10
			bg-red-400/5
			p-6 text-center
		"
	>
		<span class="text-sm font-bold text-red-300">
			Não foi possível carregar as transferências
		</span>

		<p class="mt-1 text-xs text-neutral-500">
			{error}
		</p>

		{#if onRetry}
			<button
				type="button"
				onclick={onRetry}
				class="
					mt-4
					rounded-xl
					bg-(--secondary)
					px-4 py-2
					text-xs font-bold
					transition-opacity
					hover:opacity-80
				"
			>
				Tentar novamente
			</button>
		{/if}
	</div>
{:else if sortedTransfers.length}
	<div>
		<div class="mb-5 flex items-center justify-between gap-4">
			<div>
				<h3 class="text-sm font-bold text-neutral-200">
					Linha do tempo da carreira
				</h3>

				<p class="mt-1 text-xs text-neutral-500">
					Da transferência mais antiga para a mais recente
				</p>
			</div>

			<span
				class="
					shrink-0
					rounded-lg
					bg-neutral-950/40
					px-3 py-1.5
					text-[10px] font-bold uppercase tracking-wider
					text-neutral-400
				"
			>
				{sortedTransfers.length}
				{sortedTransfers.length === 1 ? 'movimentação' : 'movimentações'}
			</span>
		</div>

		<div class="relative">
			<div
				class="
					absolute
					bottom-6 left-[7px] top-6
					w-px
					bg-(--tertiary)/10
				"
			></div>

			<div class="space-y-5">
				{#each sortedTransfers as transfer, index (transfer.id)}
					<article class="relative flex gap-4">
						<div
							class={`
								relative z-10 mt-5
								flex h-[15px] w-[15px]
								shrink-0 items-center justify-center
								rounded-full
								border-[3px] border-neutral-900
								${
									transfer.upcoming
										? 'bg-(--golden)'
										: index === sortedTransfers.length - 1
											? 'bg-(--secondary)'
											: 'bg-neutral-500'
								}
							`}
						></div>

						<div
							class="
								group
								w-full
								rounded-2xl
								border border-(--tertiary)/5
								bg-neutral-950/35
								p-4
								transition-colors
								hover:bg-neutral-950/55
								sm:p-5
							"
						>
							<div
								class="
									flex flex-col gap-3
									sm:flex-row
									sm:items-start
									sm:justify-between
								"
							>
								<div>
									<div class="flex flex-wrap items-center gap-2">
										<span
											class="
												text-[10px] font-bold uppercase
												tracking-wider text-neutral-500
											"
										>
											{formatSeason(transfer.season)}
										</span>

										{#if transfer.upcoming}
											<span
												class="
													rounded-md
													bg-(--golden)/10
													px-2 py-0.5
													text-[9px] font-bold uppercase
													tracking-wider text-(--golden)
												"
											>
												Transferência futura
											</span>
										{:else if index === sortedTransfers.length - 1}
											<span
												class="
													rounded-md
													bg-(--secondary)/10
													px-2 py-0.5
													text-[9px] font-bold uppercase
													tracking-wider text-(--secondary)
												"
											>
												Mais recente
											</span>
										{/if}
									</div>

									<span
										class="
											mt-1 block
											text-xs font-medium
											text-neutral-400
										"
									>
										{formatDate(transfer.date)}
									</span>
								</div>

								{#if transfer.fee || transfer.marketValue}
									<div
										class="
											flex gap-5
											sm:justify-end
											sm:text-right
										"
									>
										{#if transfer.fee}
											<div>
												<span
													class="
														block
														text-[9px] uppercase tracking-wider
														text-neutral-500
													"
												>
													Valor da transferência
												</span>

												<span
													class="
														mt-0.5 block
														text-sm font-black
														text-(--secondary)
													"
												>
													{formatCurrency(transfer.fee)}
												</span>
											</div>
										{/if}

										{#if transfer.marketValue}
											<div>
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
														mt-0.5 block
														text-sm font-black
														text-(--golden)
													"
												>
													{formatCurrency(transfer.marketValue)}
												</span>
											</div>
										{/if}
									</div>
								{/if}
							</div>

							<div
								class="
									mt-5
									grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
									items-center gap-3
								"
							>
								<div class="min-w-0">
									<span
										class="
											block
											text-[9px] uppercase tracking-wider
											text-neutral-500
										"
									>
										Clube anterior
									</span>

									<span
										class="
											mt-1 block truncate
											text-sm font-bold
											text-neutral-200
										"
										title={transfer.clubFrom?.name}
									>
										{transfer.clubFrom?.name || 'Não informado'}
									</span>
								</div>

								<div
									class="
										flex h-9 w-9
										items-center justify-center
										rounded-full
										bg-neutral-800
										text-(--secondary)
										transition-transform
										group-hover:translate-x-1
									"
								>
									→
								</div>

								<div class="min-w-0 text-right">
									<span
										class="
											block
											text-[9px] uppercase tracking-wider
											text-neutral-500
										"
									>
										Novo clube
									</span>

									<span
										class="
											mt-1 block truncate
											text-sm font-bold
											text-neutral-200
										"
										title={transfer.clubTo?.name}
									>
										{transfer.clubTo?.name || 'Não informado'}
									</span>
								</div>
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div
		class="
			flex min-h-72
			items-center justify-center
			rounded-2xl
			border border-dashed border-(--tertiary)/10
			bg-neutral-950/20
			p-6 text-center
		"
	>
		<p class="text-sm text-neutral-500">
			Não há transferências disponíveis para este atleta.
		</p>
	</div>
{/if}