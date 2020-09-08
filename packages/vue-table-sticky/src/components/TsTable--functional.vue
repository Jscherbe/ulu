<!-- 
Simple template component to print table the same in the different 
cloned versions needed to make the sticky elements
 -->
<template functional>
  <table :class="[ data.class, data.staticClass ]">
    <thead>
      <tr 
        v-for="(row, rowIndex) in props.headerColumns"
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
    <tbody v-if="props.rows">
      <tr
        v-for="(row, rowIndex) in props.rows"
        :key="`br-${ rowIndex }`"
      >
        <td
          v-for="(column, index) in props.rowColumns"
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
    }
  }
</script>

<style lang="scss">

</style>