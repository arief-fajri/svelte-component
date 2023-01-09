<script>
  import { v4 as uuid } from '@lukeed/uuid';
  import Icon from '@iconify/svelte';

  export let label = "Upload Image";
  export let pictArr = []
  export let onUpload = () => {};
  export let noMore = false;
  export let onClick = () => {};
  export let onRemove = () => {};
  export let isError = false;
  export let errorMsg = '';
  export let isRequired;

  let id = uuid();
</script>

<!-- show image and video preview -->
<div class="w-full">
  <p class="font-medium mb-3" class:text-red-500={isError}>
    {label}
    {#if isRequired}
      <span class="text-cuit-green-dark">*</span>
    {/if}
  </p>
  <div class="flex flex-wrap gap-4">
    {#if pictArr.length > 0}
      {#each pictArr as p}
        <div class="img-thumb" class:border-red-500={isError}>
          {#if p.type === 'image_cloudinary' || p.data.url.includes('.m3u8')}
            <img src={p.type === 'image_cloudinary' ? p.data.url : p.data.thumb_url} alt="" class="w-full h-full object-cover object-center rounded-lg" />
          {:else}
            <video src={p.data.download_url || p.data.url} class="w-full h-full object-cover object-center rounded-lg">
              <track kind="captions">
            </video>
          {/if}
          {#if !p.status || (p.status && (p.status === 'uploaded' || p.status === 'error' || p.status === 'waiting'))}
            <button class="absolute text-red text-xl" style="top:0; right: 0; transform: translate(50%, -50%)" on:click={() => onRemove(p.client_id)}>
              <Icon icon="ep:circle-close-filled" />
            </button>
          {/if}
        </div>
      {/each}
    {/if}
    {#if !noMore}
      <div class="relative">
        <input type="file" id={`upload-photo-${id}`} class="absolute w-px h-px opacity-0" accept=".jpeg,.jpg,.png,.mp4" on:click={onClick} on:change={onUpload} />
        <label for={`upload-photo-${id}`} class="rounded-lg w-24 h-24 border flex items-center justify-center cursor-pointer text-4xl" class:border-red-500={isError}>
          <Icon icon="eva:plus-fill" />
        </label>
        {#if isError}
          &nbsp;<span class="font-normal italic text-red-500 text-xs">{errorMsg}</span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .img-thumb {
    @apply rounded-lg w-24 h-24 relative border;
  }
</style>