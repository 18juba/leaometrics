import achievementsBackground from '$lib/assets/backgrounds/achievements_background.jpg';
import analysisBackground from '$lib/assets/backgrounds/analysis_background.jpg';
import mainBackground from '$lib/assets/backgrounds/main_background.webp';
import teamBackground from '$lib/assets/backgrounds/team_background.jpg';

const backgroundSources = [
	mainBackground,
	teamBackground,
	achievementsBackground,
	analysisBackground
];

const loadedBackgrounds = new Set<string>();
const pendingBackgrounds = new Map<string, Promise<void>>();

function getBackgroundSource(pathname: string): string {
	if (pathname.startsWith('/elenco')) return teamBackground;
	if (pathname.startsWith('/conquistas')) return achievementsBackground;
	if (pathname.startsWith('/analises')) return analysisBackground;

	return mainBackground;
}

export function preloadBackground(pathname: string): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();

	const source = getBackgroundSource(pathname);

	if (loadedBackgrounds.has(source)) return Promise.resolve();

	const pending = pendingBackgrounds.get(source);
	if (pending) return pending;

	const request = new Promise<void>((resolve) => {
		const image = new window.Image();
		let settled = false;

		const finish = (loaded: boolean) => {
			if (settled) return;
			settled = true;

			if (loaded) {
				loadedBackgrounds.add(source);
			}

			resolve();
		};

		image.decoding = 'async';
		image.onload = () => {
			if (typeof image.decode === 'function') {
				void image
					.decode()
					.catch(() => undefined)
					.finally(() => finish(true));
				return;
			}

			finish(true);
		};
		image.onerror = () => finish(false);
		image.src = source;
	});

	pendingBackgrounds.set(source, request);
	void request.then(() => pendingBackgrounds.delete(source));

	return request;
}

export function preloadAllBackgrounds(): Promise<void[]> {
	return Promise.all(backgroundSources.map((source) => preloadBackground(getPathname(source))));
}

function getPathname(source: string): string {
	if (source === teamBackground) return '/elenco';
	if (source === achievementsBackground) return '/conquistas';
	if (source === analysisBackground) return '/analises';

	return '/';
}
