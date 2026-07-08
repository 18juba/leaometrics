import type { PlayerProfile } from '$lib/types/playerProfile';
import { env } from '$env/dynamic/public';
import { formatDate } from '$lib/formatters/formatDate';
import { formatDateTime } from '$lib/formatters/formatDateTime';
import { countryDictionary } from '$lib/dictionaries/countryDictionary';
import { footDictionary } from '$lib/dictionaries/footDictionary';
import { positionsDictionary } from '$lib/dictionaries/positionsDictionary';

const cache = new Map<
	number,
	{
		data: PlayerProfile;
		lastFetch: number;
	}
>();

const CACHE_TIME = 86400000; // 24 Hours in milliseconds

export async function getPlayerProfile(player_id: number): Promise<PlayerProfile> {
	const now = Date.now();

	const cached = cache.get(player_id);

	if (cached && now - cached.lastFetch < CACHE_TIME) {
		return cached.data;
	}

	const response = await fetch(`${env.PUBLIC_API_HOST}/players/${player_id}/profile`);

	const data = formatPlayerProfile(await response.json());

	cache.set(player_id, {
		data,
		lastFetch: now
	});

	return data;
}

function formatPlayerProfile(player: PlayerProfile): PlayerProfile {
	return {
		...player,

		updatedAt: formatDateTime(player.updatedAt),

		placeOfBirth: {
			...player.placeOfBirth,
			country: countryDictionary[player.placeOfBirth.country] ?? player.placeOfBirth.country
		},

		citizenship: player.citizenship.map((country) => countryDictionary[country] ?? country),

		position: {
			main: positionsDictionary[player.position.main] ?? player.position.main,

			other: player.position.other.map((position) => positionsDictionary[position] ?? position)
		},

		foot: footDictionary[player.foot] ?? player.foot,

		club: {
			...player.club,

			joined: formatDate(player.club.joined),

			contractExpires: formatDate(player.club.contractExpires)
		}
	};
}
