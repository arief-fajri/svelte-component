<script>
  // import { innerHeight, innerWidth } from '../stores';

  export let visible = false;
  export let customeClass = 'mx-auto';
  export let position = 'bottom'; // center, top, bottom, left, right
  export let rounded = true;
  export let addPadding = true;
  export let bgPanel = ''
  export let onScroll = (s) => {};
  export let onClose = () => {};
  export let preventClose = false;

  let contentHeight, contentWidth, innerHeight, innerWidth;
  $: if(contentHeight >= innerHeight || contentWidth >= innerWidth){
    rounded = false;
  }else{
    rounded = true;
  }

</script>

<svelte:window bind:innerHeight={innerHeight} bind:innerWidth={innerWidth}/>

<!-- dark-nearly-transparant background -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="overlay"
  class:not-visible={!visible}
  class:is-visible={visible}
  on:click={() => {
    if (!preventClose) {
      visible = false;
      onClose();
    }
  }}
/>

<!-- content -->
<div
  class="panel-wrapper overflow-auto {bgPanel} panel-{position} {contentHeight <= innerHeight || rounded
    ? `radius-panel-${position}`
    : ''} 
	{position === 'center' && rounded && contentHeight <= innerHeight ? 'rounded-xl' : ''}"
  class:is-active={visible}
  style=" --height: {contentHeight}px; --width: {contentWidth}px"
  on:scroll={(s)=>onScroll(s)}
>
  <div class="panel-content">
    <div
      class="relative {customeClass}"
      class:p-6={addPadding}
      bind:clientHeight={contentHeight}
      bind:clientWidth={contentWidth}
    >
      <slot />
    </div>
  </div>
</div>

<style lang="postcss">
  .panel-wrapper {
    @apply bg-white;
    position: fixed;
    transition: 0.3s ease-out;
    z-index: 1000;
    max-width: 100vw;
    min-height: 100px;
    max-height: 100vh;
  }
  .panel-top.is-active,
  .panel-bottom.is-active,
  .panel-left.is-active,
  .panel-right.is-active {
    transform: translate(0);
  }
  .panel-center.is-active {
    transform: translate(-50%, -50%) scale(1);
  }

  .panel-center {
    height: var(--height);
    width: var(--width) ;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
  }
  .panel-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform: translateY(100%);
    min-height: 120px;
    max-height: 100vh;
    height: var(--height);
  }
  .panel-top {
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform: translateY(-100%);
    min-height: 200px;
    max-height: 100vh;
    height: var(--height);
  }
  .panel-left {
    top: 0;
    bottom: 0;
    left: 0;
    min-width: 200px;
    max-width: 100vw;
    width: var(--width);
    transform: translateX(-100%);
  }
  .panel-right {
    top: 0;
    bottom: 0;
    right: 0;
    min-width: 200px;
    max-width: 100vw;
    width: var(--width);
    transform: translateX(100%);
  }

  .radius-panel-bottom {
    @apply rounded-t-3xl;
  }
  .radius-panel-top {
    @apply rounded-b-3xl;
  }

  .radius-panel-left,
  .radius-panel-right {
    @apply rounded-none;
  }

  .panel-content {
    @apply bg-white mx-auto;
  }
  .close-button {
    @apply absolute p-1 bg-white rounded-lg;
    top: 7px;
    right: 7px;
    z-index: 1000;
  }
  .alt-close-button {
    @apply absolute border p-1 rounded-full;
    top: 0;
    right: 0;
    transform: translate(-50%, -50%);
  }
  .overlay {
    @apply md:cursor-pointer;
    background-color: rgba(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 101;
    /* opacity: 0.7; */
  }
  .overlay.not-visible {
    visibility: hidden;
    opacity: 0;
    transition: all 500ms;
  }
  .overlay.is-visible {
    /* Add the blur effect */
    -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
    visibility: visible;
    /* opacity: 0.7; */
    transition: visibility 0.5s linear 0s, opacity 500ms;
  }
</style>
