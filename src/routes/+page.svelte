<script>
	let { data } = $props();

	const club = $derived(data.clubProfile);
	const club_players = $derived(data.clubPlayers);

	let selectedPlayer = $state(null);
	let loading = $state(false);

	async function openPlayer(playerId) {
		loading = true;

		const response = await fetch(`/api/players/${playerId}`);

		selectedPlayer = await response.json();

		loading = false;
	}

	async function openPlayerValue(playerId) {
		loading = true;

		const response = await fetch(`/api/player_value/${playerId}`);

		const playerValue = await response.json();

		selectedPlayer.marketValue = playerValue.marketValue;

		loading = false;
	}

	async function openPlayerTransfers(playerId) {
		loading = true;

		const response = await fetch(`/api/player_transfers/${playerId}`);

		const playerTransfers = await response.json();

		selectedPlayer.transfers = playerTransfers;

		loading = false;
	}
</script>

<h1>{club.name}</h1>

<img src={club.image} alt={club.name} width="150" />

<ul>
	<li><strong>ID:</strong> {club.id}</li>
	<li><strong>Nome oficial:</strong> {club.officialName}</li>
	<li><strong>Fundação:</strong> {club.foundedOn}</li>
	<li><strong>Estádio:</strong> {club.stadiumName}</li>
	<li><strong>Capacidade:</strong> {club.stadiumSeats.toLocaleString()}</li>
	<li><strong>Sócios:</strong> {club.members.toLocaleString()}</li>
	<li><strong>Website:</strong> <a href={club.website}>{club.website}</a></li>
</ul>

<h2>Liga</h2>

<ul>
	<li>{club.league.name}</li>
	<li>{club.league.countryName}</li>
	<li>{club.league.tier}</li>
</ul>

<h2>Elenco</h2>

<ul>
	<li>Tamanho: {club.squad.size}</li>
	<li>Idade média: {club.squad.averageAge}</li>
	<li>Estrangeiros: {club.squad.foreigners}</li>
	<li>Jogadores de seleção: {club.squad.nationalTeamPlayers}</li>
</ul>

<h2>Objeto completo</h2>

<pre>{JSON.stringify(club, null, 2)}</pre>

<h2>Elenco completo</h2>

<ul>
	{#each club_players.players as player}
		<li>
			<button onclick={() => openPlayer(player.id)}>
				{player.name} - {player.position}
			</button>
		</li>
	{/each}
</ul>

{#if loading}
	<p>Carregando jogador...</p>
{/if}

{#if selectedPlayer}
	<h2>Perfil do jogador</h2>

	<img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} width="120" />

	<ul>
		<li>Nome: {selectedPlayer.name}</li>
		<li>Nome completo: {selectedPlayer.fullName}</li>
		<li>Posição: {selectedPlayer.position.main}</li>
		<li>Pé: {selectedPlayer.foot}</li>
		<li>Altura: {selectedPlayer.height} cm</li>
		<li>Nascimento: {selectedPlayer.placeOfBirth.city}, {selectedPlayer.placeOfBirth.country}</li>
		<li>Valor de mercado: € {selectedPlayer.marketValue.toLocaleString()}</li>
	</ul>

	<pre>
		{JSON.stringify(selectedPlayer, null, 2)}
	</pre>

	<button onclick={() => openPlayerValue(selectedPlayer.id)}> Valor de Mercado </button>

	{#if selectedPlayer.marketValue}
		<p>Valor de mercado atualizado: € {selectedPlayer.marketValue}</p>
	{/if}

	<button onclick={() => openPlayerTransfers(selectedPlayer.id)}> Transferências </button>

	{#if selectedPlayer.transfers}
		<h3>Transferências</h3>
		<ul>
			{#each selectedPlayer.transfers as transfer}
				<li>
					{transfer.date} - {transfer.fromClub.name} → {transfer.toClub.name} - € {transfer.fee}
				</li>
			{/each}
		</ul>
	{/if}
{/if}
