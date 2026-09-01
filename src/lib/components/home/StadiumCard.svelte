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
		<h2
			id="stadium-title"
			class="min-w-0 text-xs font-semibold tracking-wider break-words text-neutral-400 uppercase sm:text-sm"
		>
			{stadiumName}
		</h2>

		<span
			class="self-start rounded-md bg-(--golden) px-2 py-1 text-[10px] font-bold whitespace-nowrap text-(--tertiary) sm:self-auto sm:text-xs"
		>
			{stadiumSeats.toLocaleString('pt-BR')} assentos
		</span>
	</div>

	<div class="relative overflow-hidden rounded-xl bg-neutral-900/40">
		<enhanced:img
			src={stadiumImage}
			alt={stadiumName}
			sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
			loading="lazy"
			decoding="async"
			class="h-52 w-full object-cover sm:h-72 lg:h-80 xl:h-full"
		/>

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-neutral-950/50 to-transparent"
		></div>
	</div>
</section>
