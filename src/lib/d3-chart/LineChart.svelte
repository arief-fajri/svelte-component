<script>
  import { scaleLinear, scaleOrdinal } from "d3-scale";
  import moment from "moment";
  // import { onMount } from "svelte";
  import Tick from "./Tick.svelte";
  import Tooltip from "./Tooltip.svelte";

  export let chartWidth;
  export let chartHeight;
  export let data;
  export let xVar;
  export let yVars;
  export let colorFunction;

  let localData = []

  $: if(data){
    localData = data.map(a=>({...a, base: 0}))
  }

  $: if(yVars){
    yVars = [...yVars, 'base']
  }

  $: xScale = scaleLinear()
    .domain([Math.min(...localData.map((d) => d[xVar])), Math.max(...localData.map((d) => d[xVar]))])
    .range([paddings.left, chartWidth - paddings.right]);

  $: yScale = scaleLinear()
    .domain([Math.min(...localData.map((d) => Math.min(...yVars.map((yVar) => d[yVar])))), Math.max(...localData.map((d) => Math.max(...yVars.map((yVar) => d[yVar]))))])
    .range([chartHeight - paddings.bottom, paddings.top])
    .nice(10);

  $: yGrid = yScale.ticks(tickNumber);
  $: xGrid = xScale.ticks(tickNumber);

  const paddings = {
    top: 20,
    left: 10,
    right: 30,
    bottom: 50,
  };

  const tickNumber = chartWidth > 480 ? 10 : 5;
  const colorScale = colorFunction === undefined ? scaleOrdinal().domain(yVars).range(["#2B5DD7", "#FEB530", "#EF2C2C", "#0C977F"]) : colorFunction;

  const idContainer = "svg-container-" + Math.random() * 1000000;
  let mousePosition = { x: null, y: null };

  function followMouse(event) {
    const svg = document.getElementById(idContainer);
    if (svg === null) return;
    const dim = svg.getBoundingClientRect();
    const positionInSVG = { x: event.clientX - dim.left, y: event.clientY - dim.top };
    mousePosition =
      positionInSVG.x > paddings.left &&
      positionInSVG.x < chartWidth - paddings.right &&
      positionInSVG.y > paddings.top &&
      positionInSVG.y < chartHeight - paddings.bottom
        ? { x: positionInSVG.x, y: positionInSVG.y }
        : { x: null, y: null };
  }

  function removePointer() {
    mousePosition = { x: null, y: null };
  }
  
  function computeSelectedXValue(value) {
    if (localData.length > 0) {
      return localData.filter((d) => xScale(d[xVar]) >= value)[0][xVar];
    }
  }
</script>

<svg width={chartWidth} height={chartHeight} on:mousemove={followMouse} on:mouseleave={removePointer} id={idContainer}>
  <g>
    <line x1="0" x2={chartWidth - paddings.right / 2} y1={chartHeight - paddings.bottom} y2={chartHeight - paddings.bottom} stroke="rgb(216, 216, 216)" stroke-width="1"/>
  </g>
  {#if localData.length > 3}
    <g>
      {#each yVars as yVar}
          <path class="path-line" d={`M${localData.map((p) => `${xScale(p[xVar])},${yScale(p[yVar])}`).join("L")}`} stroke={yVar === 'base' ? 'transparent' : colorScale(yVar)} />
      {/each}
    </g>
  {/if}
  <!-- <g>
    {#each yGrid.slice(1) as gridLine}
      <Tick x={paddings.left} y={yScale(gridLine)} value={gridLine} direction={"horizontal"} />
    {/each}
  </g> -->
  <g>
    {#each xGrid as gridLine}
      <Tick x={xScale(gridLine)} y={chartHeight - paddings.bottom} value={gridLine} direction={"vertical"} format={false} />
    {/each}
  </g>
  <g class="axis y-axis" transform="translate(0, 0)">
    {#each yGrid as tick}
      <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
        <line x2={chartWidth - paddings.right / 2} />
        <!-- <text y="-4" x="98%">{generateCurrency(tick || 0)}</text> -->
      </g>
    {/each}
  </g>
  <g class="axis x-axis">
    {#each xGrid as tick}
      <g class="tick tick-{tick}" transform="translate({xScale(tick)},{chartHeight})">
        <line y1="-{chartHeight}" y2="-{paddings.bottom}" x1="0" x2="0" />
        <!-- <text y="-2">{moment(tick).format('MMM DD')}</text> -->
      </g>
    {/each}
  </g>

  {#if mousePosition.x !== null && localData.length > 3}
    <g transform="translate({xScale(computeSelectedXValue(mousePosition.x))} 0)">
      <line x1="0" x2="0" y1={paddings.top} y2={chartHeight - paddings.bottom - 2} stroke="#757d8a" stroke-width="1" />
      {#each yVars as yVar}
        <circle cx={0} cy={yScale(localData.find((d) => d[xVar] === computeSelectedXValue(mousePosition.x))[yVar])} r="4" fill={colorScale(yVar)} />
      {/each}
    </g>
  {/if}
  {#if mousePosition.x !== null && localData.length > 3}
    <Tooltip
      labels={yVars.filter(f=> f !== 'base')}
      values={localData.find((d) => d[xVar] === computeSelectedXValue(mousePosition.x))}
      {colorScale}
      x={mousePosition.x + 180 > chartWidth ? mousePosition.x - 175 : mousePosition.x + 15}
      y={Math.max(30, mousePosition.y - (yVars.length + 2) * 25)}
      backgroundColor={"black"}
      opacity="0.5"
      textColor={"white"}
      title={"Date: " + moment(computeSelectedXValue(mousePosition.x)).format('DD MMM YYYY')}
      width="180"
      adaptTexts={false}
    />
  {/if}
</svg>

<style>
  svg {
    position: relative;
    width: 100%;
    min-height: 200px;
    height: 100%;
    overflow: auto;
    margin: auto;
  }

  .tick {
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: rgb(216, 216, 216);
    stroke-dasharray: 4;
  }

  /* .tick text {
    fill: #757d8a;
    text-anchor: end;
    font-size: 20px;
    font-weight: 500;
  } */

  .tick.tick-0 line {
    stroke-dasharray: 0;
    visibility: hidden;
  }

  /* .x-axis .tick text {
    text-anchor: middle;
    font-size: 12px;
  } */

  .path-line {
    fill: none;
    /* stroke: rgb(0,100,100); */
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 2;
    /* stroke-dasharray: 4400; */
    /* stroke-dashoffset: 0; */
    stroke-opacity: 0.8;
    /* animation: draw 5s; */
    transition: all 1s;
  }

  /* .path-area {
    transition: all 1s;
    fill: rgba(0, 100, 100, 0.2);
  } */

  @keyframes draw {
    from {
      stroke-dashoffset: 4400;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
