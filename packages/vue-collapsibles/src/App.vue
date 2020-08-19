<template>
  <div id="app">
    <h1>Vue Collapsibles</h1>
    <h2>Simple Collapsible Region</h2>
    <CollapsibleRegion>
      <template #toggle>
        Toggle Visibility
      </template>
      This is the hidden content
    </CollapsibleRegion>
    <h3>Not Hidden at Start</h3>
    <CollapsibleRegion start-visible>
      <template #toggle>
        Toggle Visibility
      </template>
      This is the hidden content
    </CollapsibleRegion>
    <h3>Animate Height</h3>
    <CollapsibleRegion transition-height transition-fades>
      <template #toggle>
        Toggle Visibility
      </template>
      <p>
        {{ placeholder }}
      </p>
      <p>
        {{ placeholder }}
      </p>
    </CollapsibleRegion>
  </div>
</template>

<script>
import CollapsibleRegion from '@/components/CollapsibleRegion.vue';
import placeholder from "@/assets/text-placeholder.js";
export default {
  name: 'App',
  components: {
    CollapsibleRegion
  },
  data() {
    return {
      placeholder
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
