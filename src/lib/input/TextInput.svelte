<script>
  import Icon from "@iconify/svelte";

  export let inputClass = "";
  export let inputStyle = "";
  export let icon = "";
  export let value = "";
  export let iconClass = "";
  export let label = "";
  export let regex = "";
  export let placeholder = "";
  export let debounceTime = 0; // in ms
  export let minLength;
  export let maxLength;
  export let onChange = () => {};
  export let type = "text";
  export let isRequired = false;
  export let isError = false;
  export let isDisabled = false;
  export let errorMsg = "";
  export let onFocus = () => {};
  export let isPassword;
  export let isNumber;
  export let isCurrency;
  export let msg;
  export let prefix = ''
  export let autocomplete;

  let showPassword;
  let localValue = value || "";
  let timer;

  // reactive rendering when input type is number
  $: if(isNumber){
    value = value.replace(/[^0-9 ]/g, '')
  }

  // reactive rendering when input type is currency
  $: if(isCurrency){
    value = formatCurrency(value);
  }

  // check validation
  const isValid = () => {
    if (isError || (maxLength && maxLength < localValue.length)) {
      return false;
    }
    return true;
  };

  // generate currency
  const formatCurrency = (n) => {
    let nominalString = n.replace(/[^.\d]/g, '').toString(),
    split = nominalString.split('.'),
    over = split[0].length % 3,
    number = split[0].substr(0, over),
    ribuan = split[0].substr(over).match(/\d{3}/gi);
    if(ribuan){
        let separator = over ? ',' : '';
        number += separator + ribuan.join(',');
    }
    number = split[1] != undefined ? number + '.' + split[1] : number;
    return number;
  }

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
      let tempVal = val
      if(isCurrency){
        tempVal = val.replace(',', '')
      }
      localValue = tempVal;
      if (parseInt(debounceTime) > 0) {
        onDebounce(tempVal);
      } else {
        value = tempVal;
        onChange(value);
      }
    }
  };

  // check value from keypress
  const onKeydown = async (e) => {
    let val = e.target.value,
      key = e.key || '';

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
  <div class="flex items-center justify-between">
    <div class="label" class:text-red-500={isError}>
      <span class="font-medium">{label}</span>
      {#if isRequired}
        <span class="text-cuit-green-dark">*</span>
      {/if}
    </div>
    <div class="font-normal text-green-500 text-xs">
      {msg || ""}
    </div>
  </div>
  <div class="relative flex items-center w-full border rounded-md py-2 px-2 h-10 {inputClass}" class:is-error={!isValid(isError) || isError}>
    {#if prefix}
      <div class="pr-2">
        <p>IDR</p>
      </div>
    {/if}
    
    <input
      {type}
      {value}
      class="w-full"
      style={inputStyle}
      {placeholder}
      
      class:text-grey-dark={isDisabled}
      on:keyup={onKeyup}
      on:keydown={onKeydown}
      required={isRequired}
      disabled={isDisabled}
      on:focus={onFocus}
      {autocomplete}
    />
    {#if !icon && isPassword}
      <button
        class="text-2xl"
        on:click={() => {
          showPassword = !showPassword;
          type === "password" ? (type = "text") : (type = "password");
        }}
      >
        {#if showPassword}
          <Icon icon="bi:eye-fill" />
        {:else}
          <Icon icon="bi:eye-slash-fill" />
        {/if}
      </button>
    {/if}
    <div class="text-2xl {iconClass}">
      <Icon {icon} />
    </div>
  </div>
  <div class="font-normal italic text-red-500 text-10px absolute right-0" style="bottom: -16px">
    {errorMsg || ""}
  </div>
</div>

<style lang="postcss">
  .label {
    @apply mb-1;
  }
  input::placeholder {
    color: rgba(170, 170, 170, 0.6);
  }
  .is-error {
    @apply border-red-500;
  }
  .icon-right {
    @apply absolute top-1/2 right-0;
    transform: translate(-50%, -50%);
  }
</style>
