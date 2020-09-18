<template>
  <table>
    <caption 
      v-if="caption" 
      class="TableSticky__hidden-visually"
    >
      {{ caption }}
    </caption>
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
          scope="col"
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
        <component
          v-for="(column, index) in rowColumns"
          :is="column.rowHeader ? 'th' : 'td'"
          :id="column.rowHeader && column.getRowHeaderId(rowIndex)"
          :scope="column.rowHeader && 'row'"
          :key="`bc-${ index }`"
          :headers="getCellHeaders(column, rowIndex)"
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
        </component>
      </tr>
    </tbody>
  </table>
</template>

<script>
  const required = true;

  export default {
    name: 'TsTable',
    props: {
      caption: String,
      idPrefix: String,
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
      },
      getCellHeaders(column, rowIndex) {
        const headers = column.headers.join(' ');
        console.log(column);
        const rowHeaders = column.getRowHeaders(rowIndex);
        const s = rowHeaders.length ? " " : "";
        return `${ headers }${ s }${ rowHeaders }`;
      }
    }
  }
</script>