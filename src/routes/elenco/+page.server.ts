import { getClubPlayers } from '$lib/server/clubPlayersCache.server';

const FORTALEZA_ID = 10870

export async function load() {
    return {
        clubPlayers: await getClubPlayers(FORTALEZA_ID)
    };
}