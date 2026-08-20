import type { LayoutServerLoad } from './$types';
import { loadClubAnalysis } from '$lib/data/loadAnalysis';

export const load: LayoutServerLoad = async ({ fetch }) => {
	const analysis = await loadClubAnalysis(fetch);
	return { analysis };
};