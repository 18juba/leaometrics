import { footDictionary } from '$lib/dictionaries/footDictionary';

export function formatFoot(foot: string | null | undefined): string {
	if (!foot) return 'N/A';
	const key = foot.trim().toLowerCase().replace(/[\s_-]/g, '');
	const normalized =
		key === 'rightfoot' || key === 'direito' ? 'right'
		: key === 'leftfoot' || key === 'esquerdo' ? 'left'
		: key === 'ambidextrous' || key === 'ambidestro' || key === 'ambos' ? 'both'
		: key;
	return footDictionary[normalized] ?? footDictionary[foot] ?? foot;
}