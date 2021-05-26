import { writable } from "svelte/store";

const providers_default = {
  bmazon: {
    name: "B-Mazon",
    up: true,
    data: "17",
  },
  bzure: {
    name: "B-Zure",
    up: true,
    data: "23",
  },
  booglecloud: {
    name: "Boogle Cloud",
    up: true,
    data: "17",
  },
};

export let providers = writable(providers_default);
export let log_items = writable([]);
