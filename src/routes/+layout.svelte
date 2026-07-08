<script>
	import './globals.css';
	import favicon from '$lib/assets/favicon.svg';

	let x = $state(0);
	let y = $state(0);

	let { children } = $props();

	function handleMouseMove(event) {
		const centerX = window.innerWidth / 2;
		const centerY = window.innerHeight / 2;

		x = (event.clientX - centerX) / centerX;
		y = (event.clientY - centerY) / centerY;
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window onmousemove={handleMouseMove} />

<div
	class="background"
	style="
		transform: translate({x * 12}px, {y * 12}px) scale(1.08);
	"
></div>

{@render children()}
