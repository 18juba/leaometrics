<script lang="ts">
	import { resolve } from '$app/paths';
	import achievementsIcon from '$lib/assets/icons/lampions.png';
</script>

<svelte:head>
	<title>Leão Metrics - Conquistas</title>
	<meta
		name="description"
		content="Histórico de conquistas e campanhas do Fortaleza Esporte Clube."
	/>
</svelte:head>

<div class="page-shell w-full py-2 sm:py-3 md:py-0">
	<section class="empty-state empty-state--achievements">
		<img
			src={achievementsIcon}
			alt=""
			aria-hidden="true"
			class="h-36 w-36 object-contain sm:h-44 sm:w-44"
		/>
		<p class="empty-state__eyebrow mt-2">Acervo histórico</p>
		<h2 class="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
			A sala de conquistas vem aí.
		</h2>
		<p class="mt-3 max-w-md text-sm leading-6 text-neutral-300">
			Esta área ainda não possui dados cadastrados. Enquanto ela é preparada, acompanhe o elenco e o
			radar financeiro do clube.
		</p>
		<a href={resolve('/')} class="ui-button ui-button--secondary mt-7">Voltar ao painel do clube</a>
	</section>
</div>
