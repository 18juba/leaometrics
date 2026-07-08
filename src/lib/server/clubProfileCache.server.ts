import type { ClubProfile } from '$lib/types/clubProfile';
import { env } from '$env/dynamic/public';
import { formatDate } from '$lib/formatters/formatDate';
import { countryDictionary } from '$lib/dictionaries/countryDictionary';
import { tiersDictionary } from '$lib/dictionaries/tiersDictionary';

let cache: ClubProfile | null = null;
let lastFetch = 0;

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getClubProfile(club_id: number): Promise<ClubProfile> {
    const now = Date.now();

    if (cache && now - lastFetch < CACHE_TIME) {
        return cache;
    }

    const response = await fetch(`${env.PUBLIC_API_HOST}/clubs/${club_id}/profile`);

    cache = formatClubProfile(await response.json());
    lastFetch = now;

    return cache;
}

function formatClubProfile(club: ClubProfile): ClubProfile {
    return {
        ...club,
        foundedOn: formatDate(club.foundedOn),
        membersDate: formatDate(club.membersDate),
        addressLine3:
            countryDictionary[club.addressLine3] ?? club.addressLine3,
        league: {
            ...club.league,
            countryName:
                countryDictionary[club.league.countryName] ?? club.league.countryName,
            tier:
                tiersDictionary[club.league.tier] ?? club.league.tier
        }
    };
}