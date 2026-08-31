type ChartConstructor = typeof import('chart.js/auto').default;

export function configureChartTheme(Chart: ChartConstructor): void {
	Chart.defaults.color = '#d4d4d4';

	Chart.defaults.font.family = ['Saira', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'].join(
		', '
	);

	Chart.defaults.font.size = 12;

	Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

	Chart.defaults.plugins.legend.labels.color = '#e5e5e5';
	Chart.defaults.plugins.legend.labels.font = {
		size: 11,
		weight: 500
	};

	Chart.defaults.plugins.legend.labels.padding = 14;

	Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(23, 23, 23, 0.96)';

	Chart.defaults.plugins.tooltip.titleColor = '#fafafa';
	Chart.defaults.plugins.tooltip.bodyColor = '#e5e5e5';
	Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.14)';

	Chart.defaults.plugins.tooltip.borderWidth = 1;
	Chart.defaults.plugins.tooltip.padding = 12;
	Chart.defaults.plugins.tooltip.cornerRadius = 8;

	Chart.defaults.plugins.tooltip.titleFont = {
		size: 13,
		weight: 700
	};

	Chart.defaults.plugins.tooltip.bodyFont = {
		size: 12,
		weight: 500
	};
}
