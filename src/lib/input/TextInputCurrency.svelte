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
  export let msg = '';

  let showPassword;
  $: localValue = formattingNumber(value);

  const formattingNumber = (number) => new Intl.NumberFormat().format(number);

  const isValid = () => {
    if (isError || (maxLength && maxLength < value.length)) {
      return false;
    }
    return true;
  };

  // on event listener
  let timer;
  const onDebounce = (val) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      value = val;
      onChange(value);
    }, parseInt(debounceTime));
  };

  const onKeyup = (e) => {
    const { value: val } = e.target;
    if (value !== val) {
      const replaced = val.replaceAll(',', '');
      const tempVal = isNaN(replaced) ? parseFloat(replaced) : Number(replaced);
      localValue = formattingNumber(tempVal);

      if (parseInt(debounceTime) > 0) {
        onDebounce(val);
      } else {
        value = tempVal;
        onChange(value);
      }
    }
  };

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
  <div class="relative w-full">
    <input
      type="text"
      bind:value={localValue}
      pattern="[0-9]"
      class="w-full border rounded-md py-2 px-2 h-10 {inputClass}"
      style={inputStyle}
      {placeholder}
      class:is-error={!isValid(isError) || isError}
      class:text-grey-dark={isDisabled}
      on:keyup={onKeyup}
      on:keydown={onKeydown}
      required={isRequired}
      disabled={isDisabled}
      on:focus={onFocus}
    />
    {#if !icon && isPassword}
      <button
        class="icon-right text-2xl"
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
    <div class="icon-right text-2xl {iconClass}">
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
