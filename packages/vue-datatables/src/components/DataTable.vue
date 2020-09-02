<template>
  <div class="DataTable">
    <table class="DataTable__table">
      <thead>
        <tr 
          v-for="(row, rowIndex) in headerColumnsByRow"
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
  // TODO:
  //  - Account for scope attribute
  const cloneDeep = require('lodash/cloneDeep')
  const arrayOfObjects = a => a.every(o => typeof o === "object");
  const required = true;

  export default {
    name: 'DataTable',
    props: {
      /**
       * Array of tables columns
       * - Each column is an object who's value will match rows
       * - structure = [{ 
       *      name: {String}, Displayed in cell
       *      key: {String} or {Function}
       *        * {String} - Used to get value from each row's object
       *        * Function - What ever value is returned (not done)
       *        * Note: Required for the deepest child column when using nested columns/headers. Parents don't need to provide a value
       *      columns: Array of nested columns (creates nested header)
       *    }]
       */
      columns: {
        type: Array,
        validator: arrayOfObjects,
        required
      },
      /**
       * Array of tables rows
       * - Each row is an object who's value will matched to columns
       */
      rows: {
        type: Array,
        validator: arrayOfObjects,
        // required
      },
      /**
       * Hidden caption for accessibility
       */
      caption: {
        type: String,
        // required
      },
      /**
       * Prefixed used for id generation
       */
      idPrefix: {
        type: String,
        default: 'DT'
      }
    },
    computed: {
      /**
       * Current columns being used in the display
       * - This internal copy has internal properties/structural info (like ID)
       * - This is the copy of the users columns to avoid mutating their object
       * - Can be used in the future for adding/removing or enabling/disabling
       */
      currentColumns() {
        let id = 0;
        const newId = () => `${ this.idPrefix }-${ ++id }`;
        const columns = cloneDeep(this.columns);
        const prep = (column, parent) => {
          column.id = newId();
          column.parent = parent;
          let headers = [];
          // Add the column's headers for output to attribute
          if (parent) {
            if (parent.headers && parent.headers.length) {
              headers = [ ...parent.headers ];
            } else {
              headers.push(parent.id);
            }
          }
          headers.push(column.id);
          column.headers = headers;
          // Call the function on this column's children
          if (column.columns) {
            column.columns.forEach(c => prep(c, column));
          // Make sure column has a required property
          } else if (!column.key) {
            console.warn('DataTable: Missing "key" in column configration for', column);
          }
        };
        columns.forEach(c => prep(c, null));
        return columns;
      },
      /**
       * This property is a conversion of the columns (which are nested heirachy)
       * to a flat list of columns sorted by the way they need to be displayed in rows 
       * - Used for nested hedaers
       * - Transform nested data into row arrays
       */
      headerColumnsByRow() {
        // Create empty row array, each array will hold it's columns
        const count = this.currentColumns.reduce(this.maxColumnChildren, 1);
        const rows = new Array(count).fill(null).map(() => []);
        /**
         * Function that adds columsn to the rows array's based 
         * on their depth, called recursivly.
         */
        function setInRows(depth, column) {
          const columns = column.columns;
          // Go to inward to the deepest child
          if (columns) columns.forEach(c => setInRows(1 + depth, c));
          // Now that the deepest children have been calculated and pushed we have
          // all the information we need to determing the parent's colspan by reducing
          // the parents children's colspans and children would include their children
          column.rowspan = columns ? 1 : count - depth;
          column.colspan = columns ? columns.reduce((a, c) => a + c.colspan, 0) : 1;
          rows[depth].push(column);
        }
        this.currentColumns.forEach(c => setInRows(0, c));
        console.log('rowsHeader:\n', rows);
        return rows;
      },
      /**
       * Used to output the body rows. This is an array of only the deepest child columns
       * parent column information can be accessed by reference
       */
      rowColumns() {
        const columns = this.currentColumns;
        const all = [];
        const add = c => {
          if (c.columns) c.columns.forEach(add);
          else all.push(c);
        };
        // Create array of actaul 
        columns.forEach(add);
        return all;
      }
    },
    methods: {
      /**
       * Recursive function used as a reducer to return the deepest nested columns
       */
      maxColumnChildren(d, c) {
        const m = c.columns ? c.columns.reduce(this.maxColumnChildren) + 1 : 1;
        return d > m ? d : m;
      }
    }
  }
</script>

<style lang="scss">
  .DataTable {
    table {
      border-collapse: collapse;
      background-color: black;
    }
    td, th {
      border: 3px solid black;
      background-color: white;
    }
  }
</style>