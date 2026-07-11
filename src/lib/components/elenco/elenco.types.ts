import type { Player } from '$lib/types/analysis';

export type ClubPlayer = Player;

export type FootFilter =
	| 'all'
	| 'right'
	| 'left'
	| 'both';

export type SortOption =
	| 'name-asc'
	| 'name-desc'
	| 'age-asc'
	| 'age-desc'
	| 'height-asc'
	| 'height-desc'
	| 'value-asc'
	| 'value-desc';

export interface ElencoFilterState {
	searchTerm: string;
	selectedPosition: string;
	selectedFoot: FootFilter;
	sortBy: SortOption;
}
