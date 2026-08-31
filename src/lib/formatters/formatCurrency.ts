export const formatCurrency = (value: number | null | undefined) => {
	if (!value) return 'N/A';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(value);
};
