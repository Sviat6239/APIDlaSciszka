<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <section id="center">
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/App.vue</code> and save to test <code>HMR</code></p>
    </div>
    <button class="counter" @click="count++">Count is {{ count }}</button>
  </section>

  <section id="spacer"></section>
</template>
