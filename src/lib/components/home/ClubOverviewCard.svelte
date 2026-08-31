<script lang="ts">
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
	class="group relative overflow-hidden rounded-xl border border-(--tertiary)/5 bg-neutral-800/50 p-4 backdrop-blur-lg sm:rounded-2xl sm:p-5 md:col-span-2 xl:col-span-3 xl:p-6"
>
	<div
		class="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-(--primary) opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
	></div>

	<div class="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
		<div class="flex min-w-0 items-start gap-3 sm:gap-4">
			<img
				src="/images/escudo.png"
				alt={name}
				class="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
			/>

			<div class="min-w-0 flex-1">
				<span
					class="block text-[10px] font-semibold tracking-wider text-(--golden) uppercase sm:text-xs"
				>
					{league.name} ({league.tier})
				</span>

				<h1 class="mt-1 text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">
					{name}
				</h1>

				<p class="mt-1 text-xs text-neutral-400 wrap-break-word sm:text-sm">
					{addressLine1}, {addressLine2}
				</p>
			</div>
		</div>

		<div
			class="min-w-0 border-t border-(--tertiary)/10 pt-4 lg:shrink-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 lg:text-right"
		>
			<span
				class="block text-[10px] font-semibold tracking-wider text-neutral-400 uppercase sm:text-xs"
			>
				Valor total do elenco
			</span>

			<span
				class="mt-1 block text-3xl font-black tracking-tight text-(--golden) wrap-break-word sm:text-4xl xl:text-5xl"
			>
				{formatCurrency(currentMarketValue)}
			</span>
		</div>
	</div>

	<div
		class="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-(--tertiary)/10 pt-4 sm:mt-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-5"
	>
		<div class="min-w-0">
			<span class="block text-[10px] text-neutral-500 sm:text-xs">Fundado em</span>
			<span class="mt-1 block truncate text-sm font-medium">
				{foundedOn || 'N/A'}
			</span>
		</div>

		<div class="min-w-0">
			<span class="block text-[10px] text-neutral-500 sm:text-xs">Site</span>
			<a
				href={`https://${website}`}
				target="_blank"
				rel="noopener noreferrer"
				title={website}
				class="mt-1 block truncate text-sm font-bold transition-colors hover:text-(--secondary) hover:underline"
			>
				{website?.replace('www.', '') || 'N/A'}
			</a>
		</div>

		<div class="min-w-0">
			<span class="block text-[10px] text-neutral-500 sm:text-xs">Atletas</span>
			<span class="mt-1 block text-sm font-bold">{squadSize}</span>
		</div>

		<div class="min-w-0">
			<span class="block text-[10px] text-neutral-500 sm:text-xs">Estrangeiros</span>
			<span class="mt-1 block text-sm font-bold">{foreigners}</span>
		</div>
	</div>
</section>
