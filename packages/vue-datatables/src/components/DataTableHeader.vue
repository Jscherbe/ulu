<template>
  <div class="DataTable__table">
    <table class="DataTable__table">
      <thead>
        <tr 
          v-for="(row, rowIndex) in headerRows"
          :key="`hr-${ rowIndex }`"
        >
          <th 
            v-for="(column, index) in row"
            :key="`hc-${ index }`"
            :id="column.id"
            :rowspan="column.rowspan"
            :colspan="column.colspan"
          >{{ column.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, rowIndex) in rows"
          :key="`br-${ rowIndex }`"
        >
          <td
            v-for="(column, index) in rowColumns"
            :key="`bc-${ index }`"
            :headers="column.headers.join(' ')"
          >
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
  export default {
    name: 'DataTableTable',
    props: {
      headerRows: Array
    }
  }
</script>

<style lang="less">
  @import "~@Less/vars";
  .DataTableTable {

  }
</style>