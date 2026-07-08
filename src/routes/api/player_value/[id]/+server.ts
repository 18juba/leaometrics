import { json } from '@sveltejs/kit';
import { getPlayerValue } from '$lib/server/playerMarketValueCache.server';

export async function GET({ params }) {
	const playerId = Number(params.id);

	const playerValue = await getPlayerValue(playerId);

	return json(playerValue);
}