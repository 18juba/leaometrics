import type {
	ClubPlayer,
	ElencoFilterState,
	FootFilter,
	SortOption
} from './elenco.types';

type SortDirection = 'asc' | 'desc';

export function filterAndSortPlayers(
	players: ClubPlayer[],
	filters: ElencoFilterState
) {
	const normalizedSearch = normalizeText(filters.searchTerm);

	const filtered = players.filter((player) => {
		const matchesPosition =
			filters.selectedPosition === 'Todas' ||
			player.position === filters.selectedPosition;

		const matchesFoot =
			filters.selectedFoot === 'all' ||
			normalizeFoot(player.foot) === filters.selectedFoot;

		if (!matchesPosition || !matchesFoot) {
			return false;
		}

		if (!normalizedSearch) {
			return true;
		}

		const searchableContent = [
			player.name,
			player.position,
			player.signedFrom,
			player.foot,
			...(player.nationality ?? [])
		]
			.map(normalizeText)
			.join(' ');

		return searchableContent.includes(normalizedSearch);
	});

	return filtered.toSorted((a, b) =>
		comparePlayers(a, b, filters.sortBy)
	);
}

export function getPositions(players: ClubPlayer[]) {
	return [
		...new Set(
			players
				.map((player) => player.position?.trim())
				.filter(
					(position): position is string =>
						Boolean(position)
				)
		)
	].toSorted((a, b) =>
		a.localeCompare(b, 'pt-BR', {
			sensitivity: 'base'
		})
	);
}

export function getMarketValue(player: ClubPlayer) {
	const value = Number(player.marketValue);

	return Number.isFinite(value) ? value : 0;
}

export function getPlayerAge(player: ClubPlayer) {
	const value = Number(player.age);

	return Number.isFinite(value) && value > 0
		? value
		: null;
}

export function getPlayerHeightInCm(player: ClubPlayer) {
	const value = Number(player.height);

	if (!Number.isFinite(value) || value <= 0) {
		return null;
	}

	return value <= 3 ? value * 100 : value;
}

export function normalizeFoot(
	value: string | null | undefined
): Exclude<FootFilter, 'all'> | 'unknown' {
	const normalized = normalizeText(value).replace(
		/[\s_-]/g,
		''
	);

	if (
		[
			'right',
			'rightfoot',
			'direito',
			'destro'
		].includes(normalized)
	) {
		return 'right';
	}

	if (
		[
			'left',
			'leftfoot',
			'esquerdo',
			'canhoto'
		].includes(normalized)
	) {
		return 'left';
	}

	if (
		[
			'both',
			'bothfeet',
			'ambidextrous',
			'ambidestro',
			'ambidextra',
			'ambos'
		].includes(normalized)
	) {
		return 'both';
	}

	return 'unknown';
}

export function normalizeText(
	value: string | null | undefined
) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

export function getSortLabel(sortBy: SortOption) {
	const labels: Record<SortOption, string> = {
		none: 'Ordem original',
		'name-asc': 'Nome de A a Z',
		'name-desc': 'Nome de Z a A',
		'age-asc': 'Mais jovens primeiro',
		'age-desc': 'Mais experientes primeiro',
		'height-asc': 'Mais baixos primeiro',
		'height-desc': 'Mais altos primeiro',
		'value-asc': 'Menor valor primeiro',
		'value-desc': 'Maior valor primeiro'
	};

	return labels[sortBy];
}

export function getFootLabel(foot: FootFilter) {
	const labels: Record<FootFilter, string> = {
		all: 'Todos os pés',
		right: 'Pé direito',
		left: 'Pé esquerdo',
		both: 'Ambidestro'
	};

	return labels[foot];
}

export function formatDateTime(
	value: string | null | undefined
) {
	if (!value) return 'N/A';

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat('pt-BR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

function comparePlayers(
	a: ClubPlayer,
	b: ClubPlayer,
	sortBy: SortOption
) {
	let result = 0;

	switch (sortBy) {
		case 'name-asc':
			result = compareNames(a.name, b.name);
			break;

		case 'name-desc':
			result = compareNames(b.name, a.name);
			break;

		case 'age-asc':
			result = compareNullableNumbers(
				getPlayerAge(a),
				getPlayerAge(b),
				'asc'
			);
			break;

		case 'age-desc':
			result = compareNullableNumbers(
				getPlayerAge(a),
				getPlayerAge(b),
				'desc'
			);
			break;

		case 'height-asc':
			result = compareNullableNumbers(
				getPlayerHeightInCm(a),
				getPlayerHeightInCm(b),
				'asc'
			);
			break;

		case 'height-desc':
			result = compareNullableNumbers(
				getPlayerHeightInCm(a),
				getPlayerHeightInCm(b),
				'desc'
			);
			break;

		case 'value-asc':
			result =
				getMarketValue(a) -
				getMarketValue(b);
			break;

		case 'value-desc':
			result =
				getMarketValue(b) -
				getMarketValue(a);
			break;

		case 'none':
			return 0;
	}

	/*
	 * Critério secundário para manter a ordenação
	 * previsível quando os valores forem iguais.
	 */
	return result || compareNames(a.name, b.name);
}

function compareNames(a: string, b: string) {
	return a.localeCompare(b, 'pt-BR', {
		sensitivity: 'base'
	});
}

function compareNullableNumbers(
	a: number | null,
	b: number | null,
	direction: SortDirection
) {
	/*
	 * Valores desconhecidos ficam sempre no final,
	 * tanto na ordem crescente quanto na decrescente.
	 */
	if (a === null && b === null) return 0;
	if (a === null) return 1;
	if (b === null) return -1;

	return direction === 'asc'
		? a - b
		: b - a;
}