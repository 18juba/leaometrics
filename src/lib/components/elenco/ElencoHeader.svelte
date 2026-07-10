<script lang="ts">
	import { formatCurrency } from '$lib/formatters/formatCurrency';

	import type { ClubPlayer } from './elenco.types';

	import {
		formatDateTime,
		getMarketValue,
		getPlayerAge
	} from './elenco.utils';

	let {
		players,
		updatedAt
	}: {
		players: ClubPlayer[];
		updatedAt?: string;
	} = $props();

	const totalMarketValue = $derived(
		players.reduce(
			(total, player) =>
				total + getMarketValue(player),
			0
		)
	);

	const averageAge = $derived.by(() => {
		const ages = players
			.map(getPlayerAge)
			.filter(
				(age): age is number =>
					age !== null
			);

		if (!ages.length) return 0;

		return (
			ages.reduce(
				(total, age) => total + age,
				0
			) / ages.length
		);
	});

	const mostValuablePlayer = $derived(
		players.toSorted(
			(a, b) =>
				getMarketValue(b) -
				getMarketValue(a)
		)[0] ?? null
	);
</script>

<section
	class="
		group relative overflow-hidden rounded-2xl
		border border-(--tertiary)/5 bg-neutral-800/50
		p-6 backdrop-blur-lg sm:p-8
	"
>
	<div
		class="
			pointer-events-none absolute -right-16 -top-16
			h-56 w-56 rounded-full bg-(--primary)
			opacity-10 blur-3xl transition-opacity
			group-hover:opacity-20
		"
	></div>

	<div
		class="
			relative flex flex-col gap-8
			lg:flex-row lg:items-end lg:justify-between
		"
	>
		<div>
			<h1 class="mt-2 text-xl font-black tracking-tight sm:text-4xl">
				Elenco do Fortaleza
			</h1>

			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
				Explore o perfil dos atletas, evolução de valor
				de mercado e histórico de transferências.
			</p>

			<p class="mt-4 text-[10px] uppercase tracking-wider text-(--golden)">
				Última atualização: {formatDateTime(updatedAt)}
			</p>
		</div>

		<div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
			<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Atletas
				</span>

				<span class="mt-1 block text-2xl font-black text-neutral-100">
					{players.length}
				</span>
			</div>

			<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Idade média
				</span>

				<span class="mt-1 block text-2xl font-black text-neutral-100">
					{averageAge.toLocaleString('pt-BR', {
						minimumFractionDigits: 1,
						maximumFractionDigits: 1
					})}
				</span>
			</div>

			<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Mais valioso
				</span>

				<span
					class="mt-1 block max-w-32 truncate text-sm font-black text-neutral-100"
					title={mostValuablePlayer?.name}
				>
					{mostValuablePlayer?.name || 'N/A'}
				</span>

				<span class="text-xs font-bold text-(--golden)">
					{formatCurrency(
						mostValuablePlayer
							? getMarketValue(mostValuablePlayer)
							: 0
					)}
				</span>
			</div>

			<div class="min-w-32 rounded-xl bg-neutral-900/40 p-4">
				<span class="text-[10px] uppercase tracking-wider text-neutral-500">
					Valor total
				</span>

				<span class="mt-1 block text-lg font-black text-(--golden)">
					{formatCurrency(totalMarketValue)}
				</span>
			</div>
		</div>
	</div>
</section>