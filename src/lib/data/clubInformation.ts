export const clubInformation = {
	name: 'Fortaleza Esporte Clube',
	league: {
		name: 'Campeonato Brasileiro',
		tier: 'Série B'
	},
	addressLine1: 'Fortaleza',
	addressLine2: 'Ceará',
	foundedOn: '1918',
	website: 'fortaleza1918.com.br',
	stadiumName: 'Arena Castelão',
	stadiumSeats: 63_903
} as const;

export type ClubInformation = typeof clubInformation;