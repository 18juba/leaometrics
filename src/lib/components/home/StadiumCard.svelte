<script lang="ts">
	import stadiumImage from '$lib/assets/optimized/castelao.jpg?enhanced';

	interface Props {
		stadiumName: string;
		stadiumSeats: number;
	}

	let { stadiumName, stadiumSeats }: Props = $props();
</script>

<section
	class="surface-card flex min-w-0 flex-col rounded-2xl p-4 sm:p-5 md:col-span-2 xl:col-span-2 xl:p-6"
	aria-labelledby="stadium-title"
>
	<div class="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
		<h2 id="stadium-title" class="text-xl font-bold tracking-tight text-neutral-100 sm:text-2xl">
			Casa do Leão
		</h2>

		<span
			class="data-value self-start rounded-full border border-(--golden)/30 bg-(--golden)/15 px-2.5 py-1.5 text-[10px] font-semibold whitespace-nowrap text-(--golden) sm:self-auto sm:text-xs"
		>
			{stadiumSeats.toLocaleString('pt-BR')} assentos
		</span>
	</div>

	<div class="relative min-h-56 flex-1 overflow-hidden rounded-xl bg-neutral-900/40 sm:min-h-72">
		<enhanced:img
			src={stadiumImage}
			alt={stadiumName}
			sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
			loading="eager"
			decoding="async"
			fetchpriority="high"
			class="h-full min-h-56 w-full object-cover sm:min-h-72"
		/>

		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-950/85 via-neutral-950/10 to-transparent"
		></div>

		<div class="absolute inset-x-4 bottom-4">
			<p class="text-lg font-bold uppercase tracking-[0.12em] text-(--golden)">
				{stadiumName}
			</p>
		</div>
	</div>
</section>
