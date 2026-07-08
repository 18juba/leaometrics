export type ClubProfile = {
    id: number;
    url: string;
    name: string;
    officialName: string;
    image: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    tel: string;
    fax: string;
    website: string;
    foundedOn: string;
    members: number;
    membersDate: string;
    stadiumName: string;
    stadiumSeats: number;
    currentTransferRecord: number;
    currentMarketValue: number;
    squad: {
        size: number;
        averageAge: number;
        foreigners: number;
        nationalTeamPlayers: number;
    };
    league: {
        id: string;
        name: string;
        countryId: number;
        countryName: string;
        tier: string;
    }
}