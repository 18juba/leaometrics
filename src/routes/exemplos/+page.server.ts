import { getClubProfile } from '$lib/server/clubProfileCache.server';
import { getClubPlayers } from '$lib/server/clubPlayersCache.server';

const FORTALEZA_ID = 10870

export async function load() {
    return {
        clubProfile: await getClubProfile(FORTALEZA_ID),
        clubPlayers: await getClubPlayers(FORTALEZA_ID)
    };
}