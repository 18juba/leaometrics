import { json } from '@sveltejs/kit';
import { getPlayerTransfers } from '$lib/server/playerTransfersCache.server';

export async function GET({ params }) {
	const playerId = Number(params.id);

	const playerTransfers = await getPlayerTransfers(playerId);

	return json(playerTransfers);
}