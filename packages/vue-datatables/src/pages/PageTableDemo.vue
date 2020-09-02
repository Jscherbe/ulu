<template>
  <div class="PageTableDemo">
    <DataTable 
      :columns="columns" 
      :rows="rows"
    >
    </DataTable>
  </div>
</template>

<script>
  import rows from "@/data/drink-specials/data.csv";
  import { columns } from "@/data/drink-specials/config.js";
  import DataTable from "@/components/DataTable.vue";

  export default {
    name: 'PageTableDemo',
    components: {
      DataTable
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