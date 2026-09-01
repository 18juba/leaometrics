<script lang="ts">
	import { resolve } from '$app/paths';
	import achievementsIcon from '$lib/assets/icons/lampions.png';
</script>

<svelte:head>
	<title>LeãoFut - Conquistas</title>
	<meta
		name="description"
		content="Histórico de conquistas e campanhas do Fortaleza Esporte Clube."
	/>
</svelte:head>

<div class="page-shell w-full py-2 sm:py-3 md:py-0">
	<section class="empty-state">
		<img src={achievementsIcon} alt="Nenhuma conquista encontrada" />
		<h2 class="mt-5 text-xl font-black tracking-tight text-white sm:text-2xl">
			Esta análise está em preparação
		</h2>
		<a href={resolve('/')} class="ui-button ui-button--secondary mt-6">Voltar para a visão geral</a>
	</section>
</div>
