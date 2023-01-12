<script>
	import { onMount } from "svelte";
    import {renderImages} from '$lib/utilities/loadImage'

    const img = [
        {low: '/img/low/h1.jpeg', high: '/img/high/h1.jpeg'},
        {low: '/img/low/h2.jpeg', high: '/img/high/h2.jpeg'},
        {low: '/img/low/h3.jpeg', high: '/img/high/h3.jpeg'},
        {low: '/img/low/h4.jpeg', high: '/img/high/h4.jpeg'},
        {low: '/img/low/h5.jpeg', high: '/img/high/h5.jpeg'},
        {low: '/img/low/h6.jpeg', high: '/img/high/h6.jpeg'},
        {low: '/img/low/h7.jpeg', high: '/img/high/h7.jpeg'},
        {low: '/img/low/h8.jpeg', high: '/img/high/h8.jpeg'},
        {low: '/img/low/h9.jpeg', high: '/img/high/h9.jpeg'},
    ]

    onMount(()=>{
        renderImages()
    })
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#each img as img}
    <div class="w-screen h-screeen">
        <img src={img.low} data-src={img.high} alt="" class="h-full w-full ">
    </div>
{/each}