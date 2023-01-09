<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "@iconify/svelte";
  // props
  export let isReady
  export let columns;
  export let rows;
  export let c_rows;
  export let sortOrders = [1, -1];
  // READ AND WRITE
  export let sortBy = "";
  export let sortOrder = sortOrders?.[0] || 1;
  export let loading;
  // READ ONLY
  export let onTop = 0;
  export let headerTitleClass = "";
  export let classNameTable = "";
  export let classNameThead = "";
  export let classNameTbody = "";
  export let classNameRow = "";
  export let classNameCell = "";
  export let addSelection = false;
  export let disableSelect = false
  export let selectedIndex = [];
  export let disableSelectAll = false;
  export let alreadySelected = [];
  export let emptyRender = true
  export let isStickyleft

  let checkAll
  let columnByKey; 
  let sortFunction = () => "";

  const dispatch = createEventDispatcher();
  // convert array  to string
  const asStringArray = (v) => []
      .concat(v)
      .filter((v) => typeof v === "string" && v !== "")
      .join(" ");
  
  // react header selection when row selected
  $: if(selectedIndex){
    const cantCheck = c_rows.filter(r=>r.isCantCheck)
    if(selectedIndex.length > 0 && selectedIndex.length >= c_rows.length - cantCheck.length - alreadySelected.length){
      checkAll = true
    }else{
      checkAll = false
    }
  }

  // generate column data
  $: {
    columnByKey = {};
    columns.forEach((col) => {
      columnByKey[col.key] = col;
    });
  }

  // maping data for each row
  $: c_rows = rows
    .map((r) =>
      Object.assign({}, r, {
        // internal row property for sort order
        $sortOn: sortFunction(r),
      })
    ).sort((a, b) => {
      if (!sortBy) return 0;
      else if (a.$sortOn > b.$sortOn) return sortOrder;
      else if (a.$sortOn < b.$sortOn) return -sortOrder;
      return 0;
    });

  // handle column sorter
  $: {
    let col = columnByKey[sortBy];
    if (col !== undefined && col.sortable === true && typeof col.value === "function") {
      sortFunction = (r) => col.value(r);
    }
  }

  // update sorting order
  const updateSortOrder = (colKey) => {
    return colKey === sortBy ? sortOrders[(sortOrders.findIndex((o) => o === sortOrder) + 1) % sortOrders.length] : sortOrders[0];
  };

  // handle click each column header
  const handleClickCol = (event, col) => {
    if (col.sortable) {
      sortOrder = updateSortOrder(col.key);
      sortBy = sortOrder ? col.key : undefined;
    }
    dispatch("clickCol", { event, col, key: col.key });
  };

  // handle click each row
  const handleClickRow = (event, row) => {
    dispatch("clickRow", { event, row });
  };

  // handle click each cell on row
  const handleClickCell = (event, row, key) => {
    dispatch("clickCell", { event, row, key });
  };

  // handle click each selected cell on row
  const handleClickSelect = (event, row)=>{
    dispatch("clickSelect", { event, row });
  }
</script>

<div class="pb-4 relative" >
    <table class="{asStringArray(classNameTable)}">
      <thead class="truncate {asStringArray(classNameThead)}">
        <tr class="sticky z-[1]" style="top: {onTop}px">
          <!--render haeder columns selection start-->
          {#if addSelection}
            <th class="w-[70px] border-y border-grey-light p-3 border-y border-grey-light" class:button-disabled={!isReady}>
              <div class="w-full flex justify-center">
                <label class="checkbox-container" class:button-disabled={!isReady}>
                  <input
                    type="checkbox"
                    name="radio"
                    bind:checked={checkAll}
                    disabled={disableSelectAll || disableSelect || !isReady}
                    on:click={() => {
                      checkAll = !checkAll
                      if(c_rows.length) {
                        if(checkAll){
                          selectedIndex = c_rows.map(a=>a.id)
                        }else{
                          selectedIndex = []
                        }
                      }
                    }}
                  />
                  <span 
                    class="checkmark bg-white border {checkAll && !disableSelectAll ? 'border-transparent bg-yellow-dark' : 'bg-white border-grey'} {disableSelectAll || disableSelect ? 'button-disabled bg-grey/[.5]' : 'hover:bg-yellow-dark hover:border-transparent'}" 
                    class:opacity-20={loading}
                    class:bg-grey={loading}
                  />
                </label>
              </div>
            </th>
          {/if}
          <!--render haeder columns selection end-->

          <!--render haeder columns cell start-->
          {#each columns as col, i}
            <th 
              on:click={(e) => {
                if(isReady) handleClickCol(e, col)
              }} 
              class={asStringArray([col.sortable ? "isSortable" : "", col.headerClass])} 
              class:left-sticky={i === 0 && isStickyleft}
              class:header-disabled={!isReady}
            >
              <div class="{col.sortable && sortBy === col.key ? 'header-sort' : ''} border-y border-grey-light py-3 px-6">
                <p class={headerTitleClass}>
                  {@html col.renderTitle ? col.renderTitle() : col.title}
                </p>
                {#if col.sortable}
                  <div style="font-size: 16px;" class="flex-none w-4">
                    {#if sortBy === col.key}
                      <div>
                        <Icon icon={sortOrder === 1 ? "bytesize:arrow-bottom" : "bytesize:arrow-top"} />
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            </th>
          {/each}
          <!--render haeder columns cell end-->
        </tr>
      </thead>

      <tbody class={asStringArray(classNameTbody)} id="table-body">
        {#if c_rows.length && rows.length}
          <!--render table row start-->
          {#each c_rows as row, n}
            <tr
              on:click={(e) => {
                handleClickRow(e, row);
              }}
              class="{asStringArray([classNameRow])} { alreadySelected.find(a => a.id === row.id) ? 'bg-[#eee]' : 'bg-white odd:bg-stone-50'} hover:bg-yellow-100 "
            >
              <!--render cell selection on row start-->
              {#if addSelection}
                <td class="w-10">
                  {#if alreadySelected.find(a => a.id === row.id) && row.isValid}
                    <label class="checkbox-container button-disabled" >
                      <input
                        disabled
                        checked
                        type="checkbox"
                        name="radio"
                        value={row.id}
                      />
                      <span class="checkmark button-disabled bg-grey-dark" />
                    </label>
                  {:else if row.isCantCheck || disableSelect}
                    <div class="w-[21px] h-[21px] rounded bg-grey opacity-30 border button-disabled">

                    </div>
                  {:else}
                    <label class="checkbox-container" class:button-disabled={!isReady}>
                      <input
                        type="checkbox"
                        name="radio"
                        value={row.id}
                        disabled={!isReady}
                        bind:group={selectedIndex}
                        on:change={(e) => {
                          handleClickSelect(e, row)
                          
                        }}
                      />
                      <span class="checkmark border hover:bg-yellow-dark hover:border-transparent {selectedIndex.includes(row.id) ? 'border-transparent bg-yellow-dark' : 'bg-white border-grey'}" />
                    </label>
                  {/if}
                </td>
              {/if}
              <!--render cell selection on row end-->

              <!--render cell on row start-->
              {#each columns as col, i}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <td
                  on:click={(e) => {
                    handleClickCell(e, row, col.key);
                  }}
                  class="{asStringArray([col.class, classNameCell])} data-columns"
                  class:header-disabled={!isReady}
                  class:left-sticky={i === 0 && isStickyleft}
                  class:bg-inherit={i===0}
                  style={col.style}
                >
                  {#if col.renderComponent}
                    <svelte:component this={col.renderComponent.component || col.renderComponent} {...col.renderComponent.props || {}} {row} {col} />
                  {:else}
                    {@html col.renderValue ? col.renderValue(row) : col.value(row)}
                  {/if}
                </td>
              {/each}
              <!--render cell on row end-->
            </tr>
          {/each}
          <!--render table row end-->
        {/if}
        <!--render table loader-->
        {#if loading}
          {#each Array(5) as a}
            <tr class="animate-pulse">
              {#if addSelection}
                <td class="w-10">
                  <div class="placeholder bg-[#ddd] rounded" style="height: 28px; width: 36px" />
                </td>
              {/if}
              {#each columns as col}
                <td
                  class={asStringArray([col.class, classNameCell])}
                  style={col.style}
                >
                  <div class="placeholder bg-[#ddd] rounded" style="height: 28px;" />
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  {#if !c_rows.length && !rows.length && !loading && emptyRender}
    <div class="flex flex-col justify-center items-center" style="min-height: calc(100vh - {onTop}px - 300px);">
      <img src="/img/icon/empty.svg" alt="" class="mx-auto" />
      <div class="mt-4">
        <slot name="emptyMessage">
          <p class="text-center text-grey">There is no data yet</p>
        </slot>
      </div>
      
    </div>
  {/if}
</div>

<style lang="postcss">
  .placeholder {
		background: #eee;
		background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
		background-size: 200% 400%;
		animation: 1.5s shine linear infinite;
	}

	@keyframes shine {
		to {
			background-position-x: -200%;
		}
	}
  .first-loading {
    @apply w-full h-56 flex items-center justify-center;
  }
  table {
    width: 100%;
    user-select: none;
  }
  .isSortable {
    cursor: pointer;
    user-select: none;
  }
  .header-sort {
    @apply flex items-center justify-between gap-1;
  }
  .isClickable {
    cursor: pointer;
  }
  thead th {
    @apply font-medium bg-white;
    z-index: 1;
  }
  td {
    @apply py-3 px-6;
  }

  .header-disabled {
    cursor: not-allowed !important;
    color: #999 !important;
  }

  .left-sticky {
    position: sticky;
    left: 0;
    /* z-index: 2; */
    /* background: inherit; */
  }
  
  .checkbox-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  /* Hide the browser's default checkbox */
  .checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* Create a custom checkbox */
  .checkmark {
    position: relative;
    top: 0;
    left: 0;
    height: 21px;
    width: 21px;
    /* background-color: #eee; */
    border-radius: 5px;
  }

  /* Create the checkmark/indicator (hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }

  /* Show the checkmark when checked */
  .checkbox-container input:checked ~ .checkmark:after {
    display: block;
  }

  /* Style the checkmark/indicator */
  .checkbox-container .checkmark:after {
    left: 25%;
    top: 48%;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg) translate(-50%, -50%);
  }
</style>
