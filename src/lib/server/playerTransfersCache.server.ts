import type { PlayerTransfers } from '$lib/types/playerTransfers';
import { env } from '$env/dynamic/public';
import { formatDate } from '$lib/formatters/formatDate';
import { formatDateTime } from '$lib/formatters/formatDateTime';

const cache = new Map<
	number,
	{
		data: PlayerTransfers;
		lastFetch: number;
	}
>();

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getPlayerTransfers(player_id: number): Promise<PlayerTransfers> {
	const now = Date.now();

	const cached = cache.get(player_id);

	if (cached && now - cached.lastFetch < CACHE_TIME) {
		return cached.data;
	}

	const response = await fetch(`${env.PUBLIC_API_HOST}/players/${player_id}/transfers`);

	const data = formatPlayerTransfers(await response.json());

	cache.set(player_id, {
		data,
		lastFetch: now
	});

	return data;
}

function formatPlayerTransfers(playerTransfers: PlayerTransfers): PlayerTransfers {
	return {
		...playerTransfers,

		updatedAt: formatDateTime(playerTransfers.updatedAt),

		transfers: playerTransfers.transfers.map((transfer) => ({
			...transfer,
			date: formatDate(transfer.date)
		}))
	};
}