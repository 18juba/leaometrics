import type { ClubPlayers } from '$lib/types/clubPlayers';

export type ClubPlayer = ClubPlayers['players'][number];

export type FootFilter =
	| 'all'
	| 'right'
	| 'left'
	| 'both';

export type SortOption =
	| 'none'
	| 'name-asc'
	| 'name-desc'
	| 'age-asc'
	| 'age-desc'
	| 'height-asc'
	| 'height-desc'
	| 'value-asc'
	| 'value-desc';

export type ElencoFilterState = {
	searchTerm: string;
	selectedPosition: string;
	selectedFoot: FootFilter;
	sortBy: SortOption;
};