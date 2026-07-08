export type PlayerTransfers = {
    updatedAt: string;
    id: number;
    transfers: PlayerTransfer[];
};

export type PlayerTransfer = {
    id: number;
    clubFrom: TransferClub;
    clubTo: TransferClub;
    date: string;
    upcoming: boolean;
    season: string;
    marketValue?: number;
};

export type TransferClub = {
    id: number;
    name: string;
};