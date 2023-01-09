<script>
  import Icon from '@iconify/svelte';

  export let inputClass = "";
  export let label = "";
  export let rows = 3;
  export let placeholder;
  export let onChange = () => {};
  export let debounceTime = 0; // in ms
  export let regex = "";
  export let value = "";
  export let errorMsg = '';
  export let minLength;
  export let isRequired = false;
  export let isError = false;
  export let msg;

  let localValue = value || "";

  let timer;
  // handle debounce function
  const onDebounce = (val) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      value = val;
      onChange(value);
    }, parseInt(debounceTime));
  };

  // get value from keypress
  const onKeyup = (e) => {
    const { value: val } = e.target;
    if (value !== val) {
      localValue = val;
      if (parseInt(debounceTime) > 0) {
        onDebounce(val);
      } else {
        value = val;
        onChange(value);
      }
    }
  };
  // check value from keypress
  const onKeydown = async (e) => {
    let val = e.target.value,
      key = e.key;

    if (key.length === 1) {
      val = `${val}${key}`;
      if (regex && typeof regex === "object" && !val.match(regex)) {
        e.preventDefault();
        return false;
      }
    } else if (key === "Backspace" && minLength && val.length === minLength) {
      e.preventDefault();
      return false;
    }
  };
</script>

<div class="w-full relative">
  <div class="flex items-center justify-between" class:text-red-500={isError}>
		<div class="label">
			<span class="font-medium">{label}</span>
			{#if isRequired}
				<span class="text-cuit-green-dark">*</span>
			{/if}
		</div>
    <div class="font-normal text-green-500 text-xs">
      {msg || ""}
    </div>
	</div>
  <div class="text-container w-full rounded-md border flex" class:border-red-500={isError}>
    <textarea
      class="w-full rounded-md py-2 px-3 resize-none {inputClass}"
      {rows}
      {placeholder}
      {value}
      class:is-error={isError}
      on:keyup={onKeyup}
      on:keydown={onKeydown}
    />
    {#if value && value.length > 0}
      <button class="h-max w-max" on:click={()=>value = ''}>
        <div class="pt-1 pr-1 text-xl text-grey">
          <Icon icon="fontisto:close" />
        </div>
      </button>
    {/if}
  </div>
  <div class="font-normal italic text-red-500 text-10px absolute right-0" style="bottom: -16px">
    {errorMsg || ""}
  </div>
</div>

<style lang="postcss">
  .label {
    @apply mb-1;
  }
  textarea:focus {
    outline: none;
    border: none;
    box-shadow: none;
  }
  textarea::placeholder {
    @apply font-semibold;
    font-size: medium;
  }
  .is-error {
    @apply border-red-500;
  }
</style>
