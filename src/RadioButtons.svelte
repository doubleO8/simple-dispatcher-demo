<script>
  import { createEventDispatcher } from "svelte";

  export let options = [];
  export let value = options[0][0];
  const dispatch = createEventDispatcher();

  let some_id = "rb_" + Math.random().toString(36).substr(2, 12);
  function on_change() {
    dispatch("change", { schubiduh: 123 });
  }
</script>

{#each options as option}
  <div
    class="form-check form-check-inline"
    class:active={value === option[0]}
    class:in_active={value !== option[0]}
  >
    <input
      class="form-check-input"
      type="radio"
      name={some_id}
      id="{some_id}_{option[0]}"
      value={option[0]}
      checked={value === option[0]}
      bind:group={value}
      on:change={on_change}
    />
    <label class="form-check-label" for="{some_id}_{option[0]}">
      {option[1]}
    </label>
  </div>
{/each}

<style type="text/scss">
  .in_active {
    opacity: 0.4;
  }
</style>
