<script>
    let { data } = $props();

    const club = $derived(data.clubProfile);
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