import { configureChartTheme } from '$lib/components/charts/chartTheme';

let themeConfigured = false;

export async function loadChart() {
	const { default: Chart } = await import('chart.js/auto');

	if (!themeConfigured) {
		configureChartTheme(Chart);
		themeConfigured = true;
	}

	return Chart;
}
