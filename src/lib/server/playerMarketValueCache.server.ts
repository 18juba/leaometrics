import type { PlayerMarketValueHistory } from '$lib/types/playerValue';
import { env } from '$env/dynamic/public';
import { formatDate } from '$lib/formatters/formatDate';
import { formatDateTime } from '$lib/formatters/formatDateTime';

const cache = new Map<
	number,
	{
		data: PlayerMarketValueHistory;
		lastFetch: number;
	}
>();

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getPlayerValue(player_id: number): Promise<PlayerMarketValueHistory> {
	const now = Date.now();

	const cached = cache.get(player_id);

	if (cached && now - cached.lastFetch < CACHE_TIME) {
		return cached.data;
	}

	const response = await fetch(`${env.PUBLIC_API_HOST}/players/${player_id}/market_value`);

	const data = formatPlayerValue(await response.json());

	cache.set(player_id, {
		data,
		lastFetch: now
	});

	return data;
}

function formatPlayerValue(player: PlayerMarketValueHistory): PlayerMarketValueHistory {
	return {
		...player,

		updatedAt: formatDateTime(player.updatedAt),

		marketValueHistory: player.marketValueHistory.map((entry) => ({
			...entry,
			date: formatDate(entry.date)
		}))
	};
}