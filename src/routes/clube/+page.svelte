<script>
    import { formatCurrency } from '$lib/formatters/formatCurrency';
    import { bandeirasPt } from '$lib/dictionaries/flagsDictionary';

    let { data } = $props();

    const club = $derived(data.clubProfile);

    let sortOrder = $state('desc');

    function toggleOrder() {
        sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    }

const club_players = $derived(
    (data.clubPlayers?.players ?? []).toSorted((a, b) => {
        const valA = Number(a.marketValue) || 0;
        const valB = Number(b.marketValue) || 0;
        
        return sortOrder === 'desc' ? valB - valA : valA - valB;
    })
);
</script>

<div class="w-full min-h-screen flex items-center justify-center">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
<div
    class="
        lg:col-span-3
        bg-neutral-800/50
        border border-(--tertiary)/5
        rounded-2xl p-6
        backdrop-blur-lg
        relative overflow-hidden group
    "
>
    <div
        class="
            absolute -right-10 -top-10
            w-40 h-40
            bg-(--primary)
            opacity-10
            rounded-full blur-3xl
            transition-all
            group-hover:opacity-20
        "
    ></div>

    <div
        class="
            relative
            flex flex-col
            md:flex-row
            md:items-start
            md:justify-between
            gap-8
        "
    >
        <div class="flex items-start gap-4">
            <img
                src="/images/escudo.png"
                alt={club.name}
                class="w-20 h-20 object-contain shrink-0"
            />

            <div class="min-w-0">
                <span
                    class="
                        text-xs font-semibold uppercase
                        tracking-wider text-(--golden)
                    "
                >
                    {club.league.name} ({club.league.tier})
                </span>

                <h1 class="text-3xl font-bold tracking-tight mt-1">
                    {club.name}
                </h1>

                <p class="text-sm opacity-60">
                    {club.addressLine1}, {club.addressLine2}
                </p>
            </div>
        </div>

        <div
            class="
                md:text-right
                md:border-l
                md:border-(--tertiary)/10
                md:pl-8
                shrink-0
            "
        >
            <span
                class="
                    text-xs font-semibold uppercase
                    tracking-wider opacity-60 block
                "
            >
                Valor total do elenco
            </span>

            <span
                class="
                    block mt-1
                    text-3xl sm:text-4xl lg:text-5xl
                    font-black tracking-tight
                    text-(--golden)
                "
            >
                {formatCurrency(club.currentMarketValue)}
            </span>
        </div>
    </div>

    <div
        class="
            relative
            flex
            gap-14 mt-8 pt-4
            border-t border-(--tertiary)/10
        "
    >
        <div>
            <span class="text-xs opacity-60 block">
                Fundado em
            </span>

            <span class="font-medium">
                {club.foundedOn || 'N/A'}
            </span>
        </div>

        <div class="min-w-0">
            <span class="text-xs opacity-60 block">
                Site
            </span>

            <a
                href={`https://${club.website}`}
                target="_blank"
                rel="noopener noreferrer"
                class="
                    text-sm font-bold
                    hover:text-(--secondary)
                    hover:underline
                    block truncate mt-1
                "
            >
                {club.website?.replace('www.', '') || 'N/A'}
            </a>
        </div>

        <div>
            <span class="text-xs opacity-60 block">
                Atletas no Elenco
            </span>

            <span class="font-bold">
                {club.squad.size}
            </span>
        </div>

                            <div>
            <span class="text-xs opacity-60 block">
                Média de Idade
            </span>

            <span class="font-bold">
                {club.squad.averageAge}
            </span>
        </div>

                            <div>
            <span class="text-xs opacity-60 block">
                Atletas Estrangeiros
            </span>

            <span class="font-bold">
                {club.squad.foreigners}
            </span>
        </div>
    </div>
</div>

        <div class="lg:col-span-2 bg-neutral-800/50 border border-(--tertiary)/5 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-lg">
            <div>
                <div class="flex justify-between items-center mb-4 text-sm">
                    <h2 class="font-semibold uppercase tracking-wider opacity-60">{club.stadiumName}</h2>
                    <span class="px-2 py-0.5 font-bold rounded-md bg-(--golden)">{club.stadiumSeats?.toLocaleString()} assentos</span>
                </div>
                <img src="/images/castelao.jpg" alt={club.stadiumName} class="w-full h-96 object-cover rounded-lg"/>
            </div>
        </div>


        <div class="bg-neutral-800/50 border border-(--tertiary)/5 rounded-2xl p-6 backdrop-blur-lg flex flex-col justify-between">
            <div>
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-sm font-semibold uppercase tracking-wider opacity-60">Jogadores {sortOrder === 'asc' ? 'menos' : 'mais'} valiosos <span class="ml-1 text-[10px] opacity-60">(10 total)</span></h2>
                        <button 
        onclick={toggleOrder}
        class="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-(--secondary) hover:bg-(--secondary)/80 cursor-pointer"
    >
        <span class="inline-block" class:rotate-180={sortOrder === 'asc'}>
            ↓
        </span>
    </button>
                </div>
                
<div class="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
    {#each club_players.slice(0, 10) as player, i (player.id)}
        <div class="relative overflow-hidden flex items-center justify-between p-2 rounded-lg bg-neutral-900/30 hover:bg-neutral-900/60 transition-colors">
            <div class="flex items-center gap-3">
                <img 
                    src={`/images/players/${player.id}.webp`} 
                    alt={player.name} 
                    class="w-12 h-12 object-contain bg-(--tertiary)/20 rounded-full"
                    onerror={(event) => event.target.src = '/images/players/placeholder.webp'}
                />
                <div>
                    <span class="text-sm font-medium text-neutral-200 block max-w-40">{player.name} 					<span
						class="
							inline-flex h-7 min-w-8 ml-2
							items-center
							rounded-lg
						  text-lg leading-none
						"
						title={player.nationality}
						aria-label={player.nationality}
					>
						<span aria-hidden="true">
							{bandeirasPt[player.nationality[0]] ?? '🌎'}
						</span>
					</span></span>
                    <span class="text-[10px] text-neutral-400 uppercase tracking-tight">{player.position} • {player.age} anos</span>
                </div>
            </div>
            <span class="text-xs font-black text-(--golden)">{formatCurrency(player.marketValue)}</span>
        </div>
    {/each}
</div>
            </div>
            
            <a href="/elenco" class="w-full mt-4 py-2 bg-(--secondary) hover:bg-(--secondary)/80 text-xs font-semibold rounded-xl transition-colors duration-100 cursor-pointer text-center">
                Ver Elenco Completo
            </a>
        </div>

    </div>
</div>