<script>
	export let src;
	export let alt;
	export let customeClass = '';
	export let customeStyle = '';
	export let isProfilePicture = false;
	export let onClick = () => {}
	export let noLazyLoad = false;

	let loaded = noLazyLoad;
	let error = false;
</script>

<!-- render loading, error or image if ready -->
<div class="relative w-full h-full">
	{#if error}
		{#if isProfilePicture}
			<img src="/img/icon/profile-big.svg" alt="profile-pic" class={`${customeClass} loaded`} loading="lazy" style={customeStyle} />
		{:else}
			<div
				class={`w-full h-full flex justify-center items-center font-bold text-cuit-gray-dark text-center bg-cuit-gray ${customeClass}`}
			>
				Failed to Load Asset
			</div>
		{/if}
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<img
			{src}
			{alt}
			class:loaded
			loading="lazy"
			class={customeClass}
			style={customeStyle}
			on:click={onClick}
			on:load={() => {
				loaded = true
			}}
			on:error={() => {
				loaded = true
				error = true
			}}
		/>
	{/if}
	{#if !loaded}
		<div class="imgLoader">
			<div class="placeholder"></div>
		  </div>
	{/if}
</div>

<style lang="postcss">
	img {
		opacity: 0;
		transition: opacity 1200ms ease-out;
	}
	img.loaded {
		opacity: 1;
	}
	.imgLoader {
    @apply absolute flex items-center justify-center;
    width: 100%;
    height: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* background-color: rgba(0, 0, 0, 0.5); */
  }
  .placeholder {
	@apply rounded-xl;
    width: 100%;
    height: 100%;
    /* @apply bg-grey-lighter; */
    background: #fff0c9;
    background: linear-gradient(110deg, #fff0c9 8%, #fef7e5 18%, #fff0c9 33%);
    /* border-radius: 5px; */
    background-size: 200% 800%;
    animation: 1.5s shine linear infinite;
  }

  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
</style>
