export type PlayerMarketValueHistory = {
    updatedAt: string;
    id: number;
    marketValue: number;
    marketValueHistory: MarketValueHistoryEntry[];
    ranking: Record<string, unknown>;
};

export type MarketValueHistoryEntry = {
    age: number;
    date: string;
    clubId: number;
    clubName: string;
    marketValue: number;
};