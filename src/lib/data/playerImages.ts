import type { Picture } from '@sveltejs/enhanced-img';

const playerImageModules = import.meta.glob('/src/lib/assets/optimized/players/*.webp', {
	eager: true,
	import: 'default',
	query: {
		enhanced: true
	}
}) as Record<string, Picture>;

function getPlayerImagePath(playerId: string): string {
	return `/src/lib/assets/optimized/players/${playerId}.webp`;
}

export function getPlayerImage(playerId: string): Picture | null {
	return playerImageModules[getPlayerImagePath(playerId)] ?? null;
}

export const playerPlaceholder = playerImageModules[getPlayerImagePath('placeholder')];
