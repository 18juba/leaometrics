export type PlayerTransfer = {
	id: string | number;
	clubFrom: TransferClub;
	clubTo: TransferClub;
	date: string;
	upcoming: boolean;
	season: string;
	marketValue?: number;
	fee?: number;
};

export type TransferClub = {
	id: string | number;
	name: string;
};

export type MarketValueHistoryEntry = {
	age: number;
	date: string;
	clubId: string | number;
	clubName: string;
	marketValue: number;
};
