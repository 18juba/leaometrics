import type { ClubProfile } from '$lib/types/clubProfile';
import { env } from '$env/dynamic/public';

let cache: ClubProfile | null = null;
let lastFetch = 0;

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getClubProfile(club_id: number): Promise<ClubProfile> {
    const now = Date.now();

    if (cache && now - lastFetch < CACHE_TIME) {
        return cache;
    }

    const response = await fetch(`${env.PUBLIC_API_HOST}/clubs/${club_id}/profile`);

    cache = await response.json();
    lastFetch = now;

    return cache!;
}