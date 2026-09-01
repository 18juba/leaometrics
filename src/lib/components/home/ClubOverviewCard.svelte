<script lang="ts">
	import crestImage from '$lib/assets/optimized/escudo.png?enhanced';

	import { formatCurrency } from '$lib/formatters/formatCurrency';
	import type { ClubInformation } from '$lib/data/clubInformation';

	interface Props {
		name: string;
		league: ClubInformation['league'];
		addressLine1: string;
		addressLine2: string;
		foundedOn: string;
		website: string;
		currentMarketValue: number;
		squadSize: number;
		foreigners: number;
	}

	let {
		name,
		league,
		addressLine1,
		addressLine2,
		foundedOn,
		website,
		currentMarketValue,
		squadSize,
		foreigners
	}: Props = $props();
</script>

<section
	class="surface-card surface-card--accent group relative overflow-hidden rounded-2xl p-4 sm:p-5 md:col-span-2 xl:col-span-3 xl:p-6"
	aria-labelledby="club-overview-title"
>
	<div
		class="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-(--secondary)/15 blur-3xl"
	></div>

	<div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
		<div class="flex min-w-0 items-start gap-3 sm:gap-4">
			<enhanced:img
				src={crestImage}
				alt={name}
				decoding="async"
				class="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
			/>

			<div class="min-w-0 flex-1">
				<span class="block text-[10px] sm:text-xs font-semibold tracking-[0.12em] text-(--golden)">
					{league.name} · {league.tier}
				</span>

				<h2
					id="club-overview-title"
					class="mt-1 text-lg font-bold leading-[0.92] tracking-tight wrap-break-word sm:text-4xl"
				>
					{name}
				</h2>

				<p class="mt-1 text-xs text-neutral-400 wrap-break-word sm:text-sm">
					{addressLine1}, {addressLine2}
				</p>
			</div>
		</div>

		<div
			class="min-w-0 border-t border-(--tertiary)/10 pt-4 lg:shrink-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 lg:text-right"
		>
			<span class="block text-[9px] font-semibold tracking-widest text-neutral-400">
				Valor total do elenco
			</span>

			<span
				class="data-value mt-1 block text-3xl font-semibold tracking-tight text-(--golden) wrap-break-word sm:text-4xl xl:text-5xl"
			>
				{formatCurrency(currentMarketValue)}
			</span>
		</div>
	</div>

	<div
		class="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-(--tertiary)/10 pt-4 sm:mt-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5"
	>
		<div class="min-w-0">
			<span class="block text-xs text-neutral-500">Fundado em</span>
			<span class="data-value mt-1 block truncate text-sm font-medium text-neutral-100">
				{foundedOn || 'N/A'}
			</span>
		</div>

		<div class="min-w-0">
			<span class="block text-xs text-neutral-500">Site</span>
			<a
				href={`https://${website}`}
				target="_blank"
				rel="noopener noreferrer"
				title={website}
				class="mt-1 block truncate text-sm font-bold text-neutral-100 transition-colors hover:text-(--secondary) hover:underline"
			>
				{website?.replace('www.', '') || 'N/A'}
			</a>
		</div>

		<div class="min-w-0">
			<span class="block text-xs text-neutral-500">Atletas</span>
			<span class="data-value mt-1 block text-sm font-semibold text-neutral-100">{squadSize}</span>
		</div>

		<div class="min-w-0">
			<span class="block text-xs text-neutral-500">Estrangeiros</span>
			<span class="data-value mt-1 block text-sm font-semibold text-neutral-100">{foreigners}</span>
		</div>
	</div>
</section>
