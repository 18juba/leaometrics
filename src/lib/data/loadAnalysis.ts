import { error } from '@sveltejs/kit';
import type { ClubAnalysisJson } from '$lib/types/analysis';
import { ANALYSIS_JSON_PATH } from './analysisData';

export async function loadClubAnalysis(fetchFn: typeof fetch) {
	const response = await fetchFn(ANALYSIS_JSON_PATH);

	if (!response.ok) {
		throw error(response.status, 'Não foi possível carregar a análise do elenco');
	}

	return (await response.json()) as ClubAnalysisJson;
}
