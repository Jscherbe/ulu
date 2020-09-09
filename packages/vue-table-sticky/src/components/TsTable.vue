<!-- 
  Simple template component to print table the same in the different 
  cloned versions needed to make the sticky elements

  Note:
  - cannot use functional component here, can't refs in parent component
 -->
<template>
  <table>
    <thead>
      <tr 
        v-for="(row, rowIndex) in headerColumns"
        :key="`hr-${ rowIndex }`"
        :id="isActual && row.id"
        :style="{
          height: row.height
        }"
      >
        <th 
          v-for="(column, index) in row.columns"
          :key="`hc-${ index }`"
          :id="isActual && column.id"
          :rowspan="column.rowspan"
          :colspan="column.colspan"
          :style="{
            width: column.width
          }"
        >
          {{ column.name }}
        </th>
      </tr>
    </thead>
    <tbody v-if="rows">
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
</template>

<script>
  const required = true;

  export default {
    name: 'TsTable',
    props: {
      headerColumns: {
        type: Array,
        required: true
      },
      rows: {
        type: Array,
      },
      rowColumns: {
        type: Array,
      },
      /**
       * Is the actual table not a clone for sticky headers
       */
      isActual: {
        type: Boolean
      }
    },
    mounted() {
      console.log('this.headerColumns', this.headerColumns);
    }
  }
</script>

<style lang="scss">

</style>