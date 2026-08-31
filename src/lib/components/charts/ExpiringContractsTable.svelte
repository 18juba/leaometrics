<script lang="ts">
	import type { Player } from '$lib/types/analysis';

	interface Props {
		data: Player[];
		referenceDate: string;
		limitDays?: number;
	}

	interface ExpiringPlayer {
		player: Player;
		expiresAt: string;
		daysRemaining: number;
	}

	let { data, referenceDate, limitDays = 60 }: Props = $props();

	const currencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		notation: 'compact',
		maximumFractionDigits: 1
	});

	const fullCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	});

	const dateFormatter = new Intl.DateTimeFormat('pt-BR');

	function parseISODate(value: string): Date | null {
		const normalizedValue = value.slice(0, 10);
		const [year, month, day] = normalizedValue.split('-').map(Number);

		if (!year || !month || !day) {
			return null;
		}

		const parsedDate = new Date(Date.UTC(year, month - 1, day));

		if (Number.isNaN(parsedDate.getTime())) {
			return null;
		}

		return parsedDate;
	}

	function calculateDaysRemaining(expiresAt: string, reference: string): number | null {
		const expirationDate = parseISODate(expiresAt);
		const currentReferenceDate = parseISODate(reference);

		if (!expirationDate || !currentReferenceDate) {
			return null;
		}

		const millisecondsPerDay = 1000 * 60 * 60 * 24;

		return Math.round(
			(expirationDate.getTime() - currentReferenceDate.getTime()) / millisecondsPerDay
		);
	}

	function formatDate(value: string): string {
		const parsedDate = parseISODate(value);

		if (!parsedDate) {
			return '—';
		}

		return dateFormatter.format(parsedDate);
	}

	const expiringPlayers = $derived.by<ExpiringPlayer[]>(() => {
		return data
			.map((player): ExpiringPlayer | null => {
				const expiresAt = player.analysis.contract.expiresAt ?? player.contract ?? null;

				if (!expiresAt) {
					return null;
				}

				const daysRemaining = calculateDaysRemaining(expiresAt, referenceDate);

				if (daysRemaining === null || daysRemaining < 0 || daysRemaining > limitDays) {
					return null;
				}

				return {
					player,
					expiresAt,
					daysRemaining
				};
			})
			.filter((item): item is ExpiringPlayer => item !== null)
			.sort(
				(a, b) =>
					a.daysRemaining - b.daysRemaining ||
					(b.player.marketValue ?? 0) - (a.player.marketValue ?? 0)
			);
	});

	const totalMarketValue = $derived(
		expiringPlayers.reduce((total, item) => total + (item.player.marketValue ?? 0), 0)
	);

	function getDaysLabel(days: number): string {
		if (days === 0) {
			return 'Hoje';
		}

		if (days === 1) {
			return '1 dia';
		}

		return `${days} dias`;
	}
</script>

<section
	class="
		h-full overflow-hidden
		rounded-2xl
		border border-(--tertiary)/5
		bg-neutral-800/90
	"
>
	<header
		class="
			flex items-center justify-between gap-3
			border-b border-(--tertiary)/10
			px-4 py-3
		"
	>
		<div>
			<h3 class="text-sm font-semibold text-slate-900 dark:text-white">
				Contratos próximos do vencimento
			</h3>

			<p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
				Vencimento nos próximos {limitDays} dias
			</p>
		</div>

		<div class="text-right">
			<p class="text-xs font-semibold text-slate-900 dark:text-white">
				{expiringPlayers.length}
				{expiringPlayers.length === 1 ? ' jogador' : ' jogadores'}
			</p>

			<p
				class="text-[10px] text-slate-500 dark:text-slate-400"
				title={fullCurrencyFormatter.format(totalMarketValue)}
			>
				{currencyFormatter.format(totalMarketValue)}
			</p>
		</div>
	</header>

	{#if expiringPlayers.length > 0}
		<div class="max-h-60 overflow-auto">
			<table class="w-full border-collapse text-left">
				<thead
					class="
						sticky top-0 z-10
						bg-neutral-900/95
						text-[10px] uppercase
						tracking-wider
						text-neutral-400
					"
				>
					<tr
						class="
							transition-colors
							hover:bg-neutral-900/40
						"
					>
						<th class="px-3 py-2 font-medium"> Jogador </th>

						<th class="hidden px-3 py-2 font-medium sm:table-cell"> Vencimento </th>

						<th class="px-3 py-2 text-right font-medium"> Restante </th>

						<th class="px-3 py-2 text-right font-medium"> Valor </th>
					</tr>
				</thead>

				<tbody class="divide-y divide-slate-100 dark:divide-slate-800">
					{#each expiringPlayers as item (item.player.id)}
						<tr
							class="
								transition-colors
								hover:bg-neutral-900/40
							"
						>
							<td class="px-3 py-2">
								<p
									class="max-w-[150px] truncate text-xs font-medium text-slate-900 dark:text-white"
									title={item.player.name}
								>
									{item.player.name}
								</p>

								<p class="mt-0.5 text-[10px] text-slate-400 sm:hidden">
									{formatDate(item.expiresAt)}
								</p>
							</td>

							<td
								class="hidden whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 sm:table-cell dark:text-slate-400"
							>
								{formatDate(item.expiresAt)}
							</td>

							<td class="px-3 py-2 text-right">
								<span
									class={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold ${
										item.daysRemaining <= 15
											? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
											: item.daysRemaining <= 30
												? 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300'
												: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
									}`}
								>
									{getDaysLabel(item.daysRemaining)}
								</span>
							</td>

							<td
								class="whitespace-nowrap px-3 py-2 text-right text-xs font-semibold text-slate-900 dark:text-white"
								title={item.player.marketValue !== null
									? fullCurrencyFormatter.format(item.player.marketValue)
									: 'Valor não disponível'}
							>
								{item.player.marketValue !== null
									? currencyFormatter.format(item.player.marketValue)
									: '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="px-4 py-8 text-center">
			<p class="text-xs font-medium text-slate-600 dark:text-slate-300">
				Nenhum contrato vence nos próximos {limitDays} dias.
			</p>

			<p class="mt-1 text-[10px] text-slate-400">
				Data de referência: {formatDate(referenceDate)}
			</p>
		</div>
	{/if}
</section>
