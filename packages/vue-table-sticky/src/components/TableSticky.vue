<!-- 
  Main component that creates the sticky table from data passed

  Todo:
    - Need to document the vue-waypoint dependency
 -->
<template>
  <div class="TableSticky">
    <div 
      ref="display" 
      class="TableSticky__display"
    >
      <TsTable 
        ref="table"
        class="TableSticky__table TableSticky__table--actual"
        :headerColumns="headerColumns" 
        :rows="rows"
        :rowColumns="rowColumns"
      />
      <TsTable 
        ref="header"
        class="TableSticky__table TableSticky__table--header"
        :headerColumns="headerColumns" 
      />
      <TsTable 
        v-if="firstColumnSticky"
        ref="firstColumn"
        class="TableSticky__table TableSticky__table--first-olumn"
        :headerColumns="headerColumnsFirst" 
        :rows="rows"
        :rowColumns="rowColumnsFirst"
      />
    </div>
  </div>
</template>

<script>
  import TsTable from "./TsTable.vue";
  import ElementInView from "@/waypoints--element-in-view";

  const cloneDeep = require('lodash/cloneDeep')
  const arrayOfObjects = a => a.every(o => typeof o === "object");
  const required = true;

  export default {
    name: 'TableSticky',
    components: {
      TsTable
    },
    props: {
      /**
       * Scrollable context DOM Element, defaults to window but if the 
       * sticky element is within another scrolling parent use this to
       * change the scroll activation handler to use a custom s
       * crollable parent element
       */
      scrollContext: {
        type: Object,
      },
      /**
       * Whether the first column of the table should be sticky
       * - Requires that the table's first column header is nested
       */
      firstColumnSticky: Boolean,
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
    data() {
      return  {
        WaypointInstance: null,
        waypointBottom: null, 
      };
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
            console.warn('TableSticky: Missing "key" in column configration for', column);
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
      headerColumns() {
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
      },
      /**
       * Reduce the array of column header rows to the first row, first column
       */
      headerColumnsFirst() {
        return [[ this.headerColumns[0][0] ]];
      },
      /**
       * Reduce the rowColumn array to only the first column
       */
      rowColumnsFirst() {
        return [ this.rowColumns[0] ];
      }
    },
    methods: {
      /**
       * Recursive function used as a reducer to return the deepest nested columns
       */
      maxColumnChildren(d, c) {
        const m = c.columns ? c.columns.reduce(this.maxColumnChildren) + 1 : 1;
        return d > m ? d : m;
      },
      setupWaypoints() {
        const element = this.$refs.display;
        const context = this.scrollContext || window;

        const WaypointInstance = new ElementInView({
          element,
          context,
          handler(active, direction) {
            console.log('active:\n', active);
            console.log('direction:\n', direction);
          }
        });
        console.log('WaypointInstance:\n', WaypointInstance);
      }
    },
    mounted() {
      this.setupWaypoints();
      // this.waypoint = new Waypoint.Inview({
      //   element: this.$refs.display,
      //   context: this.scrollContext || window,
      //   enter() {
      //     console.log('enter waypoint');
      //   },
      //   entererd() {
      //     console.log('entererd waypoint');
      //   },
      //   exit() {
      //     console.log('exit waypoint');
      //   },
      //   exited() {
      //     console.log('exited waypoint');
      //   },
      // });
    },
  }
</script>

<style lang="scss">
  .TableSticky {
    position: relative; // For controls
    * {
      box-sizing: border-box;
    }
  }
  .TableSticky__display {
    position: relative; // For sticky header
    overflow-x: auto;
    overflow-y: hidden;
    z-index: 1;
  }
  .TableSticky__table {
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .TableSticky__table--header {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    z-index: 50;
    width: auto;
    z-index: 10;
    width: 100%;
    // Sticky method:
    // transform: translateY($calculatedByScript);
  }  
</style>