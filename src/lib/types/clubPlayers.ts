export type ClubPlayers = {
	updatedAt: string;
	id: number;
	players: {
		id: number;
		name: string;
		position: string;
		dateOfBirth: string;
		age: number;
		nationality: string[];
		height: number;
		foot: string;
		joinedOn: string;
		signedFrom: string;
		contract: string;
		marketValue: number;
	}[];
};
