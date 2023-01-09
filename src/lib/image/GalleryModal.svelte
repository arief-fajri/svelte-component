<script>
  import { fade } from 'svelte/transition';
  import moment from "moment";

  import { innerWidth } from '../stores';

  export let visible;
  export let data = [];

  // Used to track time of last mouse down event
  let lastMouseDown;
  let preview;
  let width;
  let maxWidth = "w-max";
  let videoPlayer;
  let time = 0;
  let duration;
  let paused = true;
  let showControls = true;
  let showControlsTimeout;
  
  // assign or remove preview based on visibility
  $: if (!visible) {
    preview = null;
  } else {
    preview = data[0] || {};
  }

  $: if (width >= $innerWidth) {
    maxWidth = "w-screen";
  } else {
    maxWidth = "w-max";
  }

  // function to download asset provided
  const download = (url, filename) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    })
    .catch(console.error);
  };

  // function to play video
  const togglePlay = (video) => {
    if (video.paused || video.ended) {
      if (video.ended) {
        lastMouseDown = new Date();
      }
      video.play();
    } else {
      video.pause();
    }
  };

  // Make the controls visible, but fade out after 2.5 seconds of inactivity
  const handleMove = (e) => {
    clearTimeout(showControlsTimeout);
    showControlsTimeout = setTimeout(() => (showControls = false), 2500);
    showControls = true;

    if (!duration) return; // video not loaded yet
    if (e.type !== "touchmove" && !(e.buttons & 1)) return; // mouse not down

    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const { left, right } = videoPlayer.getBoundingClientRect();
    time = (duration * (clientX - left)) / (right - left);
  };

  // we can't rely on the built-in click event, because it fires after a drag
  const handleMousedown = (e) => {
    lastMouseDown = new Date();
  };

  // handle mouse up event on video
  const handleMouseup = (e) => {
    if (new Date() - lastMouseDown < 300) {
      if (paused) e.target.play();
      else e.target.pause();
    }
  };
</script>

<div
  class="overlay"
  class:not-visible={!visible}
  class:is-visible={visible}
/>

<div class="panel-wrapper" class:is-active={visible}>
  <div class="view relative" style="height: {data.length > 1 ? 'calc(100vh - 172px)' : '100vh'};">
    {#if preview}
      <!-- show preview -->
      <div transition:fade|local class="h-full w-full">
        {#if preview.type === "video_cloudinary"}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            class="h-full w-full video-js"
            id="my-video"
            preload="auto"
            on:mousemove={handleMove}
            on:touchmove|preventDefault={handleMove}
            on:mousedown={handleMousedown}
            on:mouseup={handleMouseup}
            bind:this={videoPlayer}
            bind:currentTime={time}
            bind:paused
            bind:duration
            src={(preview.data || {}).download_url || (preview.data || {}).url}
          >
            <track kind="captions" />
          </video>
          {#if duration && preview.type === "video_cloudinary"}
            <div class="play-pause vidicon" class:invisible={!paused} on:click={() => togglePlay(videoPlayer)}>
              <svg class="playback-icons">
                <use href="#play-icon" />
              </svg>
            </div>
            <div class="controls-bottom transition duration-300" style="opacity: {duration && showControls ? 1 : 0}">
              <div class="video-progress">
                <progress id="progress-bar" value={time / duration || 0} />
              </div>
            </div>
          {/if}
        {:else}
          <img src={(preview.data || {}).url} alt="" class="w-full h-full object-contain object-center rounded-lg" />
        {/if}
      </div>
    {/if}
  </div>
  <!-- show asset list, clicked -->
  {#if data.length > 1}
    <div class="thumbnail {maxWidth} mx-auto flex items-center gap-3 overflow-x-auto p-4 pt-0" bind:clientWidth={width}>
      {#each data as p}
        <div class="w-[160px] aspect-[4/3] flex-none overflow-hidden" on:click={() => {
            if(videoPlayer) videoPlayer.pause()
            preview = null
            duration = null
            time = 0
            setTimeout(()=>preview = p, 100)
          }}>
          <img src={p.data.thumb_url || p.data.url} alt="" class="w-full h-full object-cover object-center" />
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- download and close button -->
<div class="action flex items-center gap-3" class:not-visible={!visible} class:is-visible={visible}>
  <button class="text-white hover:scale-110 transition duration-300" on:click={()=>{
    download((preview.data || {}).download_url || (preview.data || {}).url, `downlaod-asset_${moment().format('DD-MM-YYYY')}`)
  }}>
    <svg class="sdw" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v8.5m0 0l3-3m-3 3l-3-3M5 15v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/></svg>
  </button>
  <button class="text-white hover:scale-110 transition duration-300" on:click={() => (visible = false)}>
    <svg class="sdw" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10zm0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16zm0-9.414l2.828-2.829l1.415 1.415L13.414 12l2.829 2.828l-1.415 1.415L12 13.414l-2.828 2.829l-1.415-1.415L10.586 12L7.757 9.172l1.415-1.415L12 10.586z"/></svg>
  </button>
</div>

<svg style="display: none">
  <defs>
    <symbol id="pause" viewBox="0 0 24 24">
      <path d="M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z" />
    </symbol>

    <symbol id="play-icon" viewBox="0 0 24 24">
      <path d="M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z" />
    </symbol>

    <symbol id="volume-high" viewBox="0 0 24 24">
      <path
        d="M14.016 3.234q3.047 0.656 5.016 3.117t1.969 5.648-1.969 5.648-5.016 3.117v-2.063q2.203-0.656 3.586-2.484t1.383-4.219-1.383-4.219-3.586-2.484v-2.063zM16.5 12q0 2.813-2.484 4.031v-8.063q1.031 0.516 1.758 1.688t0.727 2.344zM3 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6z"
      />
    </symbol>

    <symbol id="volume-low" viewBox="0 0 24 24">
      <path d="M5.016 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6zM18.516 12q0 2.766-2.531 4.031v-8.063q1.031 0.516 1.781 1.711t0.75 2.32z" />
    </symbol>

    <symbol id="volume-mute" viewBox="0 0 24 24">
      <path
        d="M12 3.984v4.219l-2.109-2.109zM4.266 3l16.734 16.734-1.266 1.266-2.063-2.063q-1.547 1.313-3.656 1.828v-2.063q1.172-0.328 2.25-1.172l-4.266-4.266v6.75l-5.016-5.016h-3.984v-6h4.734l-4.734-4.734zM18.984 12q0-2.391-1.383-4.219t-3.586-2.484v-2.063q3.047 0.656 5.016 3.117t1.969 5.648q0 2.203-1.031 4.172l-1.5-1.547q0.516-1.266 0.516-2.625zM16.5 12q0 0.422-0.047 0.609l-2.438-2.438v-2.203q1.031 0.516 1.758 1.688t0.727 2.344z"
      />
    </symbol>

    <symbol id="fullscreen" viewBox="0 0 24 24">
      <path
        d="M14.016 5.016h4.969v4.969h-1.969v-3h-3v-1.969zM17.016 17.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 9.984v-4.969h4.969v1.969h-3v3h-1.969zM6.984 14.016v3h3v1.969h-4.969v-4.969h1.969z"
      />
    </symbol>

    <symbol id="fullscreen-exit" viewBox="0 0 24 24">
      <path
        d="M15.984 8.016h3v1.969h-4.969v-4.969h1.969v3zM14.016 18.984v-4.969h4.969v1.969h-3v3h-1.969zM8.016 8.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 15.984v-1.969h4.969v4.969h-1.969v-3h-3z"
      />
    </symbol>

    <symbol id="pip" viewBox="0 0 24 24">
      <path
        d="M21 19.031v-14.063h-18v14.063h18zM23.016 18.984q0 0.797-0.609 1.406t-1.406 0.609h-18q-0.797 0-1.406-0.609t-0.609-1.406v-14.016q0-0.797 0.609-1.383t1.406-0.586h18q0.797 0 1.406 0.586t0.609 1.383v14.016zM18.984 11.016v6h-7.969v-6h7.969z"
      />
    </symbol>
  </defs>
</svg>

<style lang="postcss">
  .sdw {
    filter: drop-shadow(0 0 5px black);
  }
  .vidicon>svg {
    width: 78px;
    height: 78px;
    fill: #fff;
    stroke: #fff;
    cursor: pointer;
  }
  .panel-wrapper {
    position: fixed;
    transition: all 0.2s ease-out;
    /* transition-delay: 200ms; */
    z-index: 101;
    top: 50%;
    left: 50%;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
    visibility: hidden;
  }
  .is-active {
    transform: translate(-50%, -50%) scale(1);
    transition: all 0.3s ease-out;
    transition-delay: 200ms;
    opacity: 1;
    visibility: visible;
  }
  .action {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 101;
  }
  .view {
    @apply mx-auto w-max flex items-center justify-center p-4;
  }
  .play-pause {
    @apply absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .controls-bottom {
    @apply absolute left-0 right-0 px-6;
    bottom: 20px;
  }
  .video-progress {
    position: relative;
    height: 8.4px;
    margin-bottom: 10px;
  }

  progress {
    @apply rounded-full;
    display: block;
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
  }

  progress::-webkit-progress-bar {
    @apply rounded-full;
    background-color: rgba(0, 0, 0, 0.2);
  }

  progress::-webkit-progress-value {
    @apply rounded-full;
    background-color: rgba(255, 255, 255, 0.6);
  }

  .thumbnail {
    /* width: 100vw; */
    height: 172px;
  }
  .overlay {
    @apply backdrop-blur;
    /* background-color: rgba(255, 255, 255, 1); */
    background-color: rgba(0, 0, 0, 0.7);
    /* background-color: rgba(0, 0, 0); */
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 101;
    /* opacity: 0.7; */
  }
  .overlay.not-visible,
  .action.not-visible {
    visibility: hidden;
    opacity: 0;
    transition: all 500ms;
    transition-delay: 100ms;
  }
  .overlay.is-visible,
  .action.is-visible {
    visibility: visible;
    /* opacity: 0.7; */
    transition: visibility 0.5s linear 0s, opacity 500ms;
  }
</style>
