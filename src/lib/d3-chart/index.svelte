<script>
  // import { onMount } from "svelte";

  import LineChart from "./LineChart.svelte";
  export let type;
  export let chartProps = {};
  const CHART_TYPES = {
    lineChart: LineChart,
  };

  // onMount(()=>{
  //     const data = chartProps.data
  //     const yVars = chartProps.yVars
  // })
</script>

<section class="chart-container">
  <svelte:component this={CHART_TYPES[type]} {...chartProps} />
  <!-- <LineChart {...chartProps}/> -->
</section>

<style>
  .chart-container {
    /* max-width: 640px; */
    /* border: solid 1px black; */
    margin: auto;
  }
</style>
