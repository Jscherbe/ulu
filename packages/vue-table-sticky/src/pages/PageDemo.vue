<template>
  <div class="PageTableDemo">
    <div style="height: 50vh; background-color: gray; margin: 5em 0;">
      Above the table
    </div>
    <TableSticky 
      :columns="columns" 
      :rows="rows"
      firstColumnSticky
    >
    </TableSticky>
    <div style="height: 200vh; background-color: gray; margin: 5em 0;">
      Below the table
    </div>
  </div>
</template>

<script>
  import rows from "@/data/drink-specials/data.csv";
  import { columns } from "@/data/drink-specials/config.js";
  import TableSticky from "@/components/TableSticky.vue";

  export default {
    name: 'PageTableDemo',
    components: {
      TableSticky
    },
    data() {
      return {
        rows,
        columns
      }
    },
    mounted() {
      // console.log(this);
      // console.log(Object.keys(this.rows));
    }
  }
</script>

<style lang="scss">
  .PageTableDemo {

  }
</style>