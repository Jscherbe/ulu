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
        v-for="(row, rowIndex) in headerRows"
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
          :class="column.class"
          :style="{
            width: column.width
          }"
        >
          <template v-if="column.title">
            {{ column.title }}
          </template>
        </th>
      </tr>
    </thead>
    <tbody v-if="rows">
      <tr
        v-for="(row, rowIndex) in rows"
        :key="`br-${ rowIndex }`"
        :id="isActual && row.id"
        :style="{
          height: row.height
        }"
      >
        <td
          v-for="(column, index) in rowColumns"
          :key="`bc-${ index }`"
          :headers="column.headers.join(' ')"
          :class="column.classValue"
          :style="{
            width: columnWidth
          }"
        >
          <template v-if="$scopedSlots[column.slot]">
            <slot 
              :name="column.slot" 
              :row="row.data" 
              :column="column"
              :rowIndex="rowIndex"
            />
          </template>
          <template v-else>
            {{ value({ row, column, rowIndex }) }}
          </template>
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
      headerRows: {
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
      },
      columnWidth: {
        type: String
      }
    },
    methods: {
      value({ row, column, rowIndex }) {
        const value = column.value;
        return value ? value({ row: row.data, column, rowIndex }) : row.data[column.key];
      }
    }
  }
</script>