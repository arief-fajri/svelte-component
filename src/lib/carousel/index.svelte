<script>
	import Siema from './siema';
	import { onMount, createEventDispatcher } from 'svelte';

	export let perPage = 3;
	export let loop = true;
	export let autoplay = 0;
	export let duration = 200;
	export let easing = 'ease-out';
	export let startIndex = 0;
	export let draggable = true;
	export let multipleDrag = true;
	export let dots = false;
	export let controls = true;
	export let threshold = 20;
	export let rtl = false;

	let currentIndex = startIndex;
	let siema;
	let controller;
	let timer;
	let isReady;

	const dispatch = createEventDispatcher();

	$: pips = controller ? controller.innerElements : [];
	$: currentPerPage = controller ? controller.perPage : perPage;
	$: totalDots = controller ? Math.ceil(controller.innerElements.length / currentPerPage) : [];

	onMount(() => {
		controller = new Siema({
			selector: siema,
			perPage: typeof perPage === 'object' ? perPage : Number(perPage),
			loop,
			duration,
			easing,
			startIndex,
			draggable,
			multipleDrag,
			threshold,
			rtl,
			onChange: handleChange,
			onInit: () => {
				isReady = true;
			}
		});

		if (autoplay) {
			timer = setInterval(right, autoplay);
		}

		return () => {
			autoplay && clearInterval(timer);
			controller.destroy();
		};
	});

	export function isDotActive(currentIndex, dotIndex) {
		if (currentIndex < 0) currentIndex = pips.length + currentIndex;
		return (
			currentIndex >= dotIndex * currentPerPage &&
			currentIndex < dotIndex * currentPerPage + currentPerPage
		);
	}

	export function left() {
		controller.prev();
	}

	export function right() {
		controller.next();
	}

	export function go(index) {
		controller.goTo(index);
	}

	export function pause() {
		clearInterval(timer);
	}

	export function resume() {
		if (autoplay) {
			timer = setInterval(right, autoplay);
		}
	}

	function handleChange(event) {
		currentIndex = controller.currentSlide;
		dispatch('change', {
			currentSlide: controller.currentSlide,
			slideCount: controller.innerElements.length
		});
	}

	function resetInterval(node, condition) {
		function handleReset(event) {
			pause();
			resume();
		}

		if (condition) {
			node.addEventListener('click', handleReset);
		}

		return {
			destroy() {
				node.removeEventListener('click', handleReset);
			}
		};
	}
</script>

<div class="carousel-container">
	<div class="carousel">
		<div class="slides {isReady ? 'visible' : 'invisible flex'}" bind:this={siema}>
			<slot />
		</div>

		{#if !isReady}
			<div class="absolute top-0 left-0 right-0 bottom-0 rounded-xl placeholder" />
		{/if}

		{#if dots}
			<ul>
				{#each { length: totalDots } as _, i}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<li
						on:click={() => go(i * currentPerPage)}
						class={isDotActive(currentIndex, i) ? 'active' : ''}
					/>
				{/each}
			</ul>
		{/if}
	</div>
	{#if controls}
		<button class="left" on:click={left} use:resetInterval={autoplay} aria-label="left">
			<slot name="left-control" />
		</button>
		<button class="right" on:click={right} use:resetInterval={autoplay} aria-label="right">
			<slot name="right-control" />
		</button>
	{/if}
</div>

<style>
	.carousel-container {
		width: 100%;
		position: relative;
	}
	.carousel {
		position: relative;
		width: calc(100% - 120px);
		margin: 0 auto;
		justify-content: center;
		align-items: center;
	}

	button {
		position: absolute;
		width: 40px;
		height: 40px;
		top: 50%;
		z-index: 50;
		margin-top: -20px;
		border: none;
		background-color: transparent;
	}
	button:focus {
		outline: none;
	}

	.left {
		left: 0;
	}

	.right {
		right: 0;
	}
	ul {
		list-style-type: none;
		position: absolute;
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: -30px;
		padding: 0;
	}
	ul li {
		margin: 6px;
		border-radius: 100%;
		background-color: rgba(255, 255, 255, 0.5);
		height: 8px;
		width: 8px;
	}
	ul li:hover {
		background-color: rgba(255, 255, 255, 0.85);
	}
	ul li.active {
		background-color: rgba(255, 255, 255, 1);
	}

	.placeholder {
		background: linear-gradient(110deg, #ececec 8%, #fff 18%, #ececec 33%);
		background-size: 200% 400%;
		animation: 1.5s shine linear infinite;
	}

	@keyframes shine {
		to {
			background-position-x: -200%;
		}
	}

	@media only screen and (max-width: 600px) {
		.carousel {
			width: calc(100% - 40px);
		}
	}
</style>
