import { countryDictionary } from '$lib/dictionaries/countryDictionary';

import type { ClubPlayer, ElencoFilterState, FootFilter, SortOption } from './elenco.types';

const positionLabels: Record<string, string> = {
	Goalkeeper: 'Goleiro',
	'Centre-Back': 'Zagueiro',
	'Right-Back': 'Lateral-direito',
	'Left-Back': 'Lateral-esquerdo',
	'Defensive Midfield': 'Volante',
	'Central Midfield': 'Meio-campista central',
	'Right Midfield': 'Meia-direita',
	'Left Midfield': 'Meia-esquerda',
	'Attacking Midfield': 'Meia ofensivo',
	'Right Winger': 'Ponta-direita',
	'Left Winger': 'Ponta-esquerda',
	'Second Striker': 'Segundo atacante',
	'Centre-Forward': 'Centroavante'
};

function normalizeText(value: unknown): string {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('pt-BR')
		.trim();
}

export function getPositionLabel(position: string): string {
	return positionLabels[position] ?? position ?? 'Sem posição';
}

export function getCountryLabel(country: string): string {
	return countryDictionary[country] ?? country;
}

export function normalizeFoot(foot: string | null | undefined): Exclude<FootFilter, 'all'> | null {
	const normalized = normalizeText(foot).replace(/[\s_-]/g, '');

	if (normalized === 'right' || normalized === 'rightfoot' || normalized === 'direito') {
		return 'right';
	}

	if (normalized === 'left' || normalized === 'leftfoot' || normalized === 'esquerdo') {
		return 'left';
	}

	if (
		normalized === 'both' ||
		normalized === 'ambidextrous' ||
		normalized === 'ambidestro' ||
		normalized === 'ambos'
	) {
		return 'both';
	}

	return null;
}

export function getPositions(players: ClubPlayer[]): string[] {
	return Array.from(new Set(players.map((player) => player.position))).sort(
		(positionA, positionB) =>
			getPositionLabel(positionA).localeCompare(getPositionLabel(positionB), 'pt-BR')
	);
}

export function filterAndSortPlayers(
	players: ClubPlayer[],
	filters: ElencoFilterState
): ClubPlayer[] {
	const query = normalizeText(filters.searchTerm);

	const filteredPlayers = players.filter((player) => {
		if (filters.selectedPosition !== 'Todas' && player.position !== filters.selectedPosition) {
			return false;
		}

		if (filters.selectedFoot !== 'all' && normalizeFoot(player.foot) !== filters.selectedFoot) {
			return false;
		}

		if (!query) {
			return true;
		}

		const nationalities = player.nationality ?? [];
		const translatedNationalities = nationalities.map(getCountryLabel);
		const profile = player.profile;

		const searchableValues = [
			player.name,
			profile?.fullName,
			player.position,
			getPositionLabel(player.position),
			player.signedFrom,
			profile?.club?.name,
			...nationalities,
			...translatedNationalities
		];

		return searchableValues.some((value) => normalizeText(value).includes(query));
	});

	return [...filteredPlayers].sort((playerA, playerB) => {
		switch (filters.sortBy) {
			case 'name-asc':
				return playerA.name.localeCompare(playerB.name, 'pt-BR');

			case 'name-desc':
				return playerB.name.localeCompare(playerA.name, 'pt-BR');

			case 'age-asc':
				return numericValue(playerA.age) - numericValue(playerB.age);

			case 'age-desc':
				return numericValue(playerB.age) - numericValue(playerA.age);

			case 'height-asc':
				return numericValue(playerA.height) - numericValue(playerB.height);

			case 'height-desc':
				return numericValue(playerB.height) - numericValue(playerA.height);

			case 'value-asc':
				return numericValue(playerA.marketValue) - numericValue(playerB.marketValue);

			case 'value-desc':
			default:
				return numericValue(playerB.marketValue) - numericValue(playerA.marketValue);
		}
	});
}

function numericValue(value: number | null | undefined): number {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : 0;
}

export function getSortLabel(sortBy: SortOption): string {
	const labels: Record<SortOption, string> = {
		'name-asc': 'Nome: A → Z',
		'name-desc': 'Nome: Z → A',
		'age-asc': 'Mais jovens',
		'age-desc': 'Mais experientes',
		'height-asc': 'Mais baixos',
		'height-desc': 'Mais altos',
		'value-asc': 'Menor valor',
		'value-desc': 'Maior valor'
	};

	return labels[sortBy];
}

export function getFootLabel(foot: FootFilter): string {
	const labels: Record<FootFilter, string> = {
		all: 'Todos os pés',
		right: 'Pé direito',
		left: 'Pé esquerdo',
		both: 'Ambidestro'
	};

	return labels[foot];
}
