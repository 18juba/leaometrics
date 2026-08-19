import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import type { ClubAnalysisJson } from '$lib/types/analysis';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/data/fortaleza_analysis_19-08-2026.json');

	if (!response.ok) {
		throw error(
			response.status,
			'Não foi possível carregar a análise do elenco'
		);
	}

	const analysis = (await response.json()) as ClubAnalysisJson;

	return {
		analysis
	};
};