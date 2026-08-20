export function formatHeight(height: number | null | undefined): string {
	if (height == null) return 'N/A';
	return height > 3
		? `${height} cm`
		: `${height.toLocaleString('pt-BR', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})} m`;
}