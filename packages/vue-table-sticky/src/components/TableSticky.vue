<!-- 
  Main component that creates the sticky table from data passed

  Todo:
    - [ ] Need to document the vue-waypoint dependency
    - [ ] Need to go through and remove the stored instances waypoints, they don't need to be reactive
    - [ ] Need to provide each row's height in header
    - [ ] If they are using first column sticky need to set each body row's height
      + Need to change row printout structure to array of objects with columns key or something 
        so I can set the row's height reactivly
    - [ ] Need to set the width on each <th> including the original table's
      + This should be added to the column objects so it populates each element
      + Needs to be after the orginal table has been plotted
    - [ ] 
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
        isActual
        :headerRows="headerRows" 
        :rows="rows"
        :rowColumns="rowColumns"
        @hook:mounted="tableReady"
      />
      <TsTable 
        ref="header"
        class="TableSticky__table TableSticky__table--header"
        :style="{
          opacity: 1,
          transform: headerTransform,
          width: tableWidth
        }"
        :headerRows="headerRows" 
      />
      <!-- <TsTable 
        v-if="firstColumnSticky"
        ref="firstColumn"
        class="TableSticky__table TableSticky__table--first-column"
        :headerColumns="headerColumnsFirst" 
        :rows="rows"
        :rowColumns="rowColumnsFirst"
      /> -->
    </div>
  </div>
</template>

<script>
  import TsTable from "./TsTable.vue";
  import ElementWaypoint from "../element-waypoint.js";

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
       * Scrollable context DOM Element, if the sticky element is within another
       * scrolling parent use this tochange the scroll activation handler to use a custom
       * scrollable parent element
       * 
       */
      scrollContext: {
        default: () => window
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
      const currentColumns = this.cloneColumns();
      return  {
        headerVisible: false,
        headerTransform: 0,
        scrollTicking: false,
        currentColumns,
        headerRows: this.createHeaderRows(currentColumns),
        tableWidth: 'auto',
      };
    },
    computed: {
      
      
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
      // headerColumnsFirst() {
      //   return [[ this.headerColumns[0][0] ]];
      // },
      /**
       * Reduce the rowColumn array to only the first column
       */
      // rowColumnsFirst() {
      //   return [ this.rowColumns[0] ];
      // }
    },
    methods: {
      /**
       * Current columns being used in the display
       * - This internal copy has internal properties/structural info (like ID)
       * - This is the copy of the users columns to avoid mutating their object
       * - Can be used in the future for adding/removing or enabling/disabling
       */
      cloneColumns() {
        let id = 0;
        const newId = () => `${ this.idPrefix }-${ ++id }`;
        const columns = cloneDeep(this.columns);
        const prep = (column, parent) => {
          column.id = newId();
          column.parent = parent;
          column.width = 'auto';
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
       * Conversion of the columns (which are nested heirachy) to a flat list of columns 
       * sorted by the way they need to be displayed in rows 
       * - Used for nested hedears
       * - Transform nested data into row arrays
       */
      createHeaderRows(currentColumns) {
        // Create empty row array, each array will hold it's columns
        let id = 0;
        const newId = () => `${ this.idPrefix }-row-${ ++id }`;
        const count = currentColumns.reduce(this.maxColumnChildren, 1);
        const height = 'auto';
        const rows = new Array(count).fill(null).map(() => ({ 
          height, 
          columns: [],
          id: newId()
        }));
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
          rows[depth].columns.push(column);
        }
        currentColumns.forEach(c => setInRows(0, c));
        return rows;
      },
      /**
       * Recursive function used as a reducer to return the deepest nested columns
       */
      maxColumnChildren(d, c) {
        const m = c.columns ? c.columns.reduce(this.maxColumnChildren) + 1 : 1;
        return d > m ? d : m;
      },
      /**
       * Method is fired when scroll enters and leaves the table 
       */
      onWaypoint(entered, direction) {
        this.listenScrollY(entered);
        this.headerVisible = entered;
        if (!entered && direction === "up") {
          this.setHeaderTransform(0);
        }
      },
      /**
       * Scroll handler for vertical scroll
       */
      onScrollY(event) {
        if (!this.scrollTicking) {
          window.requestAnimationFrame(() => {
            this.scrollTicking = false;
            if (!this.headerVisible) return;
            // Offset the header by the difference of the trigger 
            // point and the current scroll position. 
            const y = this.waypointContext.oldScroll.y;
            const t = this.waypointTop.triggerPoint;
            this.setHeaderTransform(y - t - 1);
            
          });
          this.scrollTicking = true;
        }
      },
      setHeaderTransform(value) {
        this.headerTransform = `translateY(${ value }px)`;
      },
      /**
       * Manages the adding and removing the scrollY handler
       */
      listenScrollY(attach) {
        this.scrollContext[(attach ? 'add' : 'remove') + 'EventListener']('scroll', this.onScrollY);
      },
      /**
       * Cleanup function for when component is not in use
       */
      removeHandlers() {
        this.listenScrollY(false);
      },
      setTableSizes() {
        // Set the table and it's cloned header to the exact same width
        const table = this.$refs.table;
        this.tableWidth = `${ table.$el.offsetWidth }px`;
        const getElement = object => document.getElementById(object.id);
        // Set the tables header <tr> and <th> to their rendered sizes
        // By measuring each and updating it's column object data
        // reactively updating all the cloned verisons
        this.headerRows.forEach(row => {
          row.height = `${ getElement(row).offsetHeight }px`;
          row.columns.forEach(column => {
            column.width = `${ getElement(column).offsetWidth }px`;
          });
        });
      },
      tableReady() {
        this.setTableSizes();
        // Calculate header heights and column widths
      },
      setupWaypoint() {
        const element = this.$refs.display;
        const header = this.$refs.header.$el;
        const offsetBottom = this.$refs.header.$el.offsetHeight;
        // Note: Non-reactive property
        this.elementWaypoint = new ElementWaypoint({ 
          element,
          context: this.scrollContext, 
          handler: this.onWaypoint.bind(this),
          offsetBottom() {
            return header.offsetHeight;
          }
        });
        // Get references from Waypoints instance
        this.waypointTop = this.elementWaypoint.top;
        this.waypointContext = this.waypointTop.context;
      }
    },
    mounted() {
      this.setupWaypoint();
      
      console.log('TABLE STICKY', this);
    },
    beforeDestroy() {
      this.removeHandlers();
    }
  }
</script>

<style lang="scss">
  $duration: 200ms;
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
    transition: opacity $duration;
    background-color: white;
  }  
</style>