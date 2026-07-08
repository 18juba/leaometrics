import type { ClubPlayers } from '$lib/types/clubPlayers';
import { env } from '$env/dynamic/public';
import { formatDate } from '$lib/formatters/formatDate';
import { formatDateTime } from '$lib/formatters/formatDateTime';
import { countryDictionary } from '$lib/dictionaries/countryDictionary';
import { footDictionary } from '$lib/dictionaries/footDictionary';
import { positionsDictionary } from '$lib/dictionaries/positionsDictionary';

let cache: ClubPlayers | null = null;
let lastFetch = 0;

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getClubPlayers(club_id: number): Promise<ClubPlayers> {
    const now = Date.now();

    if (cache && now - lastFetch < CACHE_TIME) {
        return cache;
    }

    const response = await fetch(`${env.PUBLIC_API_HOST}/clubs/${club_id}/players`);

    cache = formatClubPlayers(await response.json());

    lastFetch = now;

    return cache;
}


function formatClubPlayers(clubPlayers: ClubPlayers): ClubPlayers {
    return {
        ...clubPlayers,

        updatedAt: formatDateTime(clubPlayers.updatedAt),

        players: clubPlayers.players.map((player) => ({
            ...player,

            position:
                positionsDictionary[player.position] ?? player.position,

            dateOfBirth:
                formatDate(player.dateOfBirth),

            joinedOn:
                formatDate(player.joinedOn),

            contract:
                formatDate(player.contract),

            nationality:
                player.nationality.map(
                    (country) =>
                        countryDictionary[country] ?? country
                ),

            foot:
                footDictionary[player.foot] ?? player.foot
        }))
    };
}