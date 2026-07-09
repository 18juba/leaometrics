import { getClubProfile } from '$lib/server/clubProfileCache.server';

const FORTALEZA_ID = 10870

export async function load() {
    return {
        clubProfile: await getClubProfile(FORTALEZA_ID),
    };
}