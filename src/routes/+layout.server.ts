import type { PageServerLoad } from './$types';
import { loadClubAnalysis } from '$lib/data/loadAnalysis';

export const load: PageServerLoad = async ({ fetch }) => {
	const analysis = await loadClubAnalysis(fetch);
	return { analysis };
};