<script>
  import { Row, Button, Col, CustomInput } from "sveltestrap";
  import { Alert } from "sveltestrap";
  import RadioButtons from "./RadioButtons.svelte";

  import { log_items, providers } from "./stores.js";

  const strategy_options = [
    ["shuffle", "Erste erfolgreiche Abfrage"],
    ["first", "Erster Anbieter"],
    ["same", "Zwei übereinstimmende Ergebnisse"],
  ];

  let latest = false;

  let strategy = strategy_options[0][0];

  function shuffled(unshuffled) {
    /* Stolen from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array */
    return unshuffled
      .map((a) => ({ sort: Math.random(), value: a }))
      .sort((a, b) => a.sort - b.sort)
      .map((a) => a.value);
  }

  async function add_log_entry(msg, kind_value) {
    if (typeof kind_value === "undefined") {
      kind_value = "info";
    }
    $log_items.push({
      dt: new Date().toISOString(),
      message: msg,
      kind: kind_value,
    });
  }

  async function data_fetching_simulation() {
    let data = null;
    let provider_keys = Object.keys($providers);
    let quorum = new Map();
    $log_items = [];

    add_log_entry(`Strategie: ${strategy}...`);

    if (strategy === "shuffle") {
      provider_keys = shuffled(Object.keys($providers));
    } else if (strategy === "first") {
      provider_keys = [Object.keys($providers)[0]];
    }

    for (const key of provider_keys) {
      const value = $providers[key];
      let current_data = null;

      console.info(`Trying ${value.name} with strategy ${strategy}...`);
      add_log_entry(`Versuche Datenabruf von ${value.name}...`);

      if (value.up === false) {
        add_log_entry(
          `${value.name} ist momentan nicht erreichbar.`,
          "warning"
        );
      } else {
        current_data = value.data;
      }

      if (current_data === null) {
        add_log_entry(`${value.name} lieferte keine Daten`, "warning");
      }

      if (current_data !== null) {
        console.info(`got data from ${value.name}: ${current_data}`);
        add_log_entry(`${value.name}: ${current_data}`);

        if (!quorum.has(current_data)) {
          quorum.set(current_data, 1);
        } else {
          quorum.set(current_data, 1 + quorum.get(current_data));
        }
      }

      if (strategy === "same") {
        // evaluate
        if (quorum.get(current_data) >= 2) {
          data = current_data;
          console.info(`Got enough votes for ${current_data}`);
          add_log_entry(
            `Genug Übereinstimmungen für '${current_data}'`,
            "info"
          );
          break;
        } else {
          console.info(`Not enough votes for ${current_data}`);
          add_log_entry(
            `Nicht genug Übereinstimmungen für '${current_data}'`,
            "warning"
          );
        }
      } else {
        if (current_data !== null) {
          data = current_data;
          add_log_entry(`OK, ${current_data}`, "info");
          break;
        }
      }
    }

    if (data === null) {
      add_log_entry(`Keine Daten erhalten`, "error");
    } else {
      add_log_entry(`Daten erfolgreich abgerufen: '${data}'`, "success");
    }

    return data;
  }

  async function refresh() {
    latest = false;
    latest = await data_fetching_simulation();
  }
</script>

<section class="container mt-5">
  <Row>
    <Col>
      <h1>Simulierte Cloud Provider</h1>
    </Col>
  </Row>

  <div class="row">
    <div class="col-1">Erreichbar</div>
    <div class="col">Name</div>
    <div class="col">Datensatz</div>
  </div>

  {#each Object.entries($providers) as [key, value]}
    <div class="row">
      <div class="col-1">
        <CustomInput
          type="switch"
          id="{key}_visibility_toggle"
          name="{key}_visibility_toggle"
          bind:checked={value.up}
        />
      </div>
      <div class="col">
        {value.name}
      </div>
      <div class="col">
        {value.data}
      </div>
    </div>
  {/each}
</section>

<section class="container mt-3">
  <Row>
    <Col>
      <h1>Strategie für die Datenabfrage</h1>
    </Col>
  </Row>
  <Row>
    <Col>
      <RadioButtons
        options={strategy_options}
        bind:value={strategy}
        on:change={() => refresh()}
      />
    </Col>
  </Row>
</section>

<section class="container mt-5 mb-5">
  <Row>
    <Col>
      <h1>Datenabfrage</h1>
    </Col>
  </Row>

  <Row>
    <Col class="pl-5 pr-5">
      <Button color="primary" on:click={refresh}>Simuliere Datenabruf</Button>
    </Col>
  </Row>
</section>

<section class="container mt-3">
  <Row>
    <Col>
      <h2>Ergebnis</h2>
    </Col>
  </Row>
  <Row>
    <Col>
      {#if latest === false}
        <Alert color="info">Noch keine Daten abgerufen</Alert>
      {:else if latest === null}
        <Alert color="warning">Keine Daten erhalten</Alert>
      {:else}
        <Alert color="success">Erhaltener Datensatz ist '{latest}'</Alert>
      {/if}
    </Col>
  </Row>
</section>

<section class="container mt-2">
  <Row>
    <Col>
      <h2>Logbuch</h2>
    </Col>
  </Row>
  <Row>
    <Col>
      {#if $log_items.length === 0}
        <Alert color="info">Es gibt noch keine Log Einträge.</Alert>
      {:else}
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Zeit</th>
              <th>Eintrag</th>
            </tr>
          </thead>
          <tbody>
            {#each $log_items as log_item}
              <tr
                class:warning={log_item.kind === "warning"}
                class:info={log_item.kind === "info"}
                class:error={log_item.kind === "error"}
                class:success={log_item.kind === "success"}
              >
                <td>{log_item.dt}</td>
                <td>{log_item.message}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </Col>
  </Row>
</section>

<style type="text/scss">
  $my-h1-colour: #3e3e3e;
  $my-text-colour: #aa0000;

  @media (min-width: 640px) {
    section {
      max-width: none;
    }
  }

  tr.error td {
    background-color: rgba(170, 0, 0, 0.1);
  }
  tr.warning td {
    background-color: rgba(170, 170, 0, 0.1);
  }
  tr.info td {
    background-color: rgba(0, 0, 170, 0.1);
  }
  tr.success td {
    background-color: rgba(0, 170, 0, 0.5);
  }
</style>
