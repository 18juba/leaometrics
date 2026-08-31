export type PlayerProfile = {
	updatedAt: string;
	id: number;
	url: string;
	name: string;
	description: string;
	fullName: string;
	imageUrl: string;
	placeOfBirth: {
		city: string;
		country: string;
	};
	height: number;
	citizenship: string[];
	isRetired: boolean;
	position: {
		main: string;
		other: string[];
	};
	foot: string;
	shirtNumber: string;
	club: {
		id: number;
		name: string;
		joined: string;
		contractExpires: string;
	};
	marketValue: number;
	agent: {
		name: string;
		url?: string;
	};
	outfitter: string;
	socialMedia: string[];
	trainerProfile: Record<string, unknown>;
	relatives: PlayerRelative[];
};

export type PlayerRelative = {
	id: number;
	url: string;
	name: string;
	profileType: string;
};
