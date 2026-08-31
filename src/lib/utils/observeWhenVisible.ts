type VisibilityCallback = () => void | Promise<void>;

const DEFAULT_ROOT_MARGIN = '240px 0px';

export function observeWhenVisible(
	element: HTMLElement,
	callback: VisibilityCallback,
	rootMargin = DEFAULT_ROOT_MARGIN
): () => void {
	if (typeof IntersectionObserver === 'undefined') {
		void callback();
		return () => undefined;
	}

	let hasStarted = false;
	const observer = new IntersectionObserver(
		(entries) => {
			if (hasStarted || !entries.some((entry) => entry.isIntersecting)) {
				return;
			}

			hasStarted = true;
			observer.disconnect();
			void callback();
		},
		{ rootMargin }
	);

	observer.observe(element);

	return () => observer.disconnect();
}
