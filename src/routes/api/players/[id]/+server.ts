import { json } from '@sveltejs/kit';
import { getPlayerProfile } from '$lib/server/playerProfileCache.server';

export async function GET({ params }) {
    const playerId = Number(params.id);

    const player = await getPlayerProfile(playerId);

    return json(player);
}