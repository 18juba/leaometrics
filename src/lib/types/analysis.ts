export type ISODateString = string;
export type PlayerId = string;
export type ClubId = string;

export type PlayerPosition =
	| 'Goalkeeper'
	| 'Centre-Back'
	| 'Right-Back'
	| 'Left-Back'
	| 'Defensive Midfield'
	| 'Central Midfield'
	| 'Right Midfield'
	| 'Left Midfield'
	| 'Attacking Midfield'
	| 'Right Winger'
	| 'Left Winger'
	| 'Second Striker'
	| 'Centre-Forward';

export type PreferredFoot = 'right' | 'left' | 'both';

export type AgeGroup = 'up_to_21' | '22_to_25' | '26_to_29' | '30_to_33' | '34_plus';

export type ContractStatus =
	'active' | 'expires_within_6_months' | 'expires_within_12_months' | 'expired' | 'unknown';

export type MarketValueTrend = 'up' | 'down' | 'stable' | 'unknown';

export type RequestResource = 'profile' | 'market_value' | 'transfers';

/**
 * Estrutura principal do arquivo JSON.
 */
export interface ClubAnalysisJson {
	generatedAt: ISODateString;
	source: AnalysisSource;
	club: ClubSummary;
	squadAnalysis: SquadAnalysis;
	players: Player[];
}

export interface AnalysisSource {
	host: string;
	clubId: ClubId;
	clubDataUpdatedAt: ISODateString;
	analysisReferenceDate: ISODateString;
}

export interface ClubSummary {
	id: ClubId;
	playerCount: number;
}

export interface SquadAnalysis {
	playerCount: number;
	totalMarketValue: number;
	averageMarketValue: number;
	medianMarketValue: number;
	averageAge: number;
	averageHeight: number;
	totalTransfers: number;

	byPosition: PositionAnalysis[];
	byNationality: NationalityAnalysis[];
	byFoot: FootAnalysis[];
	byAgeGroup: AgeGroupAnalysis[];
	byContractStatus: ContractStatusAnalysis[];

	mostValuablePlayers: ValuablePlayer[];
	dataQuality: SquadDataQuality;
}

export interface PositionAnalysis {
	position: PlayerPosition;
	playerCount: number;
	totalMarketValue: number;
	averageMarketValue: number;
	averageAge: number;
	averageHeight: number;
}

export interface NationalityAnalysis {
	nationality: string;
	playerCount: number;
}

export interface FootAnalysis {
	foot: PreferredFoot;
	playerCount: number;
}

export interface AgeGroupAnalysis {
	ageGroup: AgeGroup;
	playerCount: number;
}

export interface ContractStatusAnalysis {
	contractStatus: ContractStatus;
	playerCount: number;
}

export interface ValuablePlayer {
	playerId: PlayerId;
	name: string;
	position: PlayerPosition;
	age: number;
	marketValue: number;
}

export interface SquadDataQuality {
	playersWithIssues: number;
	issueCount: number;
	issues: PlayerDataQualityIssue[];
}

export interface PlayerDataQualityIssue {
	playerId: PlayerId;
	name: string;
	issues: string[];
}

export interface Player {
	id: PlayerId;
	name: string;
	position: PlayerPosition;
	dateOfBirth: ISODateString;
	age: number;
	nationality: string[];

	/**
	 * Ausente quando a altura não pôde ser obtida.
	 */
	height?: number;

	foot: PreferredFoot;
	joinedOn: ISODateString;
	signedFrom: string;

	/**
	 * Pode não existir quando a data do contrato é desconhecida.
	 */
	contract?: ISODateString;

	/**
	 * Campo eventual, como suspensão ou outra situação especial.
	 */
	status?: string;

	/**
	 * Pode ser null quando não há valor de mercado disponível.
	 */
	marketValue: number | null;

	profile: PlayerProfile;
	marketValueData: PlayerMarketValueData;
	transferData: PlayerTransferData;
	analysis: PlayerAnalysis;
	requestErrors: PlayerRequestError[];
}

export interface PlayerProfile {
	updatedAt?: ISODateString;
	id?: PlayerId;
	url?: string;
	name?: string;
	description?: string;
	fullName?: string;
	nameInHomeCountry?: string;
	imageUrl?: string;

	placeOfBirth?: PlaceOfBirth;

	height?: number;
	citizenship?: string[];
	isRetired?: boolean;

	position?: PlayerProfilePosition;
	foot?: PreferredFoot;
	shirtNumber?: string;

	club?: PlayerProfileClub;
	marketValue?: number;
	agent?: PlayerAgent;
	outfitter?: string;

	socialMedia?: string[];

	/**
	 * Atualmente aparece como objeto vazio no JSON,
	 * mas fica preparado para receber dados futuramente.
	 */
	trainerProfile?: Record<string, unknown>;

	relatives?: PlayerRelative[];
}

export interface PlaceOfBirth {
	city: string;
	country: string;
}

export interface PlayerProfilePosition {
	main: PlayerPosition;
	other: PlayerPosition[];
}

export interface PlayerProfileClub {
	id: ClubId;
	name: string;
	joined: ISODateString;
	contractExpires?: ISODateString;
	contractOption?: string;
}

export interface PlayerAgent {
	name?: string;
	url?: string;
}

export interface PlayerRelative {
	id: string;
	name: string;
	profileType: string;
	url: string;
}

export interface PlayerMarketValueData {
	updatedAt?: ISODateString;
	id?: PlayerId;
	marketValue?: number;
	marketValueHistory: MarketValueHistoryItem[];

	/**
	 * As propriedades são dinâmicas:
	 * Worldwide, Fortaleza, Brazil, Centre-Back, Year 1999 etc.
	 */
	ranking?: Record<string, number>;
}

export interface MarketValueHistoryItem {
	age: number;
	date: ISODateString;
	clubId: ClubId;
	clubName: string;

	/**
	 * Alguns registros históricos não possuem valor.
	 */
	marketValue?: number;
}

export interface PlayerTransferData {
	updatedAt?: ISODateString;
	id?: PlayerId;
	transfers: PlayerTransfer[];
	youthClubs?: string[];
}

export interface PlayerTransfer {
	id: string;
	clubFrom: TransferClub;
	clubTo: TransferClub;
	date: ISODateString;
	upcoming: boolean;
	season: string;

	/**
	 * Nem todas as transferências possuem estes valores.
	 */
	marketValue?: number;
	fee?: number;
}

export interface TransferClub {
	id: ClubId;
	name: string;
}

export interface PlayerAnalysis {
	ageGroup: AgeGroup;
	contract: PlayerContractAnalysis;
	marketValue: PlayerMarketValueAnalysis;
	transferCount: number;
	clubsInTransferHistory: number;
	dataQualityIssues: string[];
}

export interface PlayerContractAnalysis {
	expiresAt: ISODateString | null;
	daysRemaining: number | null;
	status: ContractStatus;
}

export interface PlayerMarketValueAnalysis {
	current: number | null;

	firstRecorded: RecordedMarketValue | null;
	latestRecorded: RecordedMarketValue | null;
	peak: MarketValuePeak | null;

	changeFromFirst: number | null;
	changeFromFirstPercent: number | null;

	changeFromPeak: number | null;
	changeFromPeakPercent: number | null;

	lastUpdateChange: number | null;
	lastUpdateChangePercent: number | null;

	trend: MarketValueTrend;
}

export interface RecordedMarketValue {
	date: ISODateString;
	marketValue: number;
}

export interface MarketValuePeak {
	date: ISODateString;
	age: number;
	clubId: ClubId;
	clubName: string;
	marketValue: number;
}

export interface PlayerRequestError {
	resource: RequestResource;
	error: string;
}
