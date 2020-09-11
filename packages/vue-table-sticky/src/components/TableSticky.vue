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
        :rows="currentRows"
        :rowColumns="rowColumns"
        @hook:mounted="tableReady"
      />
      <TsTable 
        v-if="firstColumnSticky"
        ref="firstColumn"
        class="TableSticky__table TableSticky__table--first-column"
        :headerRows="headerRowsFirst" 
        :columnWidth="firstColumnSize.width"
        :rows="currentRows"
        :rowColumns="rowColumnsFirst"
        :style="{
          opacity: headerOpacity,
        }"
      />
      <TsTable 
        ref="header"
        class="TableSticky__table TableSticky__table--header"
        :style="{
          opacity: headerOpacity,
          width: tableWidth
        }"
        :headerRows="headerRows" 
      />
      <TsTable 
        v-if="firstColumnSticky"
        ref="firstColumnHeader"
        class="TableSticky__table TableSticky__table--first-column-header"
        :headerRows="headerRowsFirst" 
        :style="{
          height: firstColumnSize.height,
          opacity: headerOpacity,
        }"
      />
      
    </div>
  </div>
</template>

<script>
  import TsTable from "./TsTable.vue";
  import ElementWaypoint from "../element-waypoint.js";

  const cloneDeep = require('lodash/cloneDeep');
  const debounce = require('lodash/debounce');
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
      const currentColumns = this.createColumns();
      const currentRows = this.createRows();
      return  {
        currentColumns,
        currentRows,
        headerActive: false,
        translateY: 0,
        translateX: 0,
        headerRows: this.createHeaderRows(currentColumns),
        sizesCalculated: false,
        tableWidth: 'auto',
        resizeHandler: debounce(this.onResize.bind(this), 500, { leading: true }),
        resizing: false
      };
    },
    computed: {
      headerOpacity() {
        return +(this.headerActive && this.sizesCalculated);
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
      headerRowsFirst() {
        const firstRow = this.headerRows[0];
        const firstColumn = firstRow.columns[0] // Object.assign({}, firstRow.columns[0], { width: 'auto' });
        const columns = [ firstColumn ];
        // Offset height would be the combination of all the rows height's
        const boxHeight = this.headerRows.reduce((a, r) => a + r.boxHeight, 0);
        return [{ 
          ...firstRow, 
          columns,
          boxHeight,
          height: `${ boxHeight }px`
        }];
      },
      /**
       * Reduce the rowColumn array to only the first column
       */
      rowColumnsFirst() {
        return [ this.rowColumns[0] ];
      },
      firstColumnSize() {
        const height = this.headerRowsFirst[0].height;
        const width = this.headerRows[0].columns[0].width;
        return { width, height };
      }
    },
    methods: {
      /**
       * Creates a new throttled scroll handler
       */
      throttleScroll(handler) {
        let id = null;
        // Old Fired after frame
        return (event) => {
          if (id) {
            window.cancelAnimationFrame(id);
          }
          id = window.requestAnimationFrame(() => handler(event));
        };
      },
      onResize() {
        // Called when the resize event is first fired (before change)
        if (!this.resizing) {
          this.resizing = true;
          this.headerActive = false;
        } else {
          this.resizing = false;
          this.headerActive = true;
          this.removeTableSizes();
          this.setTableSizes();
          this.updateTranslateY();
          this.updateTranslateX();
        }
      },
      idCreator(type) {
        let id = 0;
        return () => `${ this.idPrefix }-${ type }-${ ++id }`
      },
      /**
       * Creates row array for internal use
       * - Avoid mutating user's prop
       */
      createRows() {
        const newId = this.idCreator('br');
        return this.rows.map(row => ({
          height: null,
          boxHeight: null,
          data: row,
          id: newId()
        }));
      },
      /**
       * Creates column array for internal use
       * - Avoid mutating user's prop 
       * - Current columns being used in the display
       * - This internal copy has internal properties/structural info (like ID)
       * - This is the copy of the users columns to avoid mutating their object
       * - Can be used in the future for adding/removing or enabling/disabling
       */
      createColumns() {
        const newId = this.idCreator('c');
        const columns = cloneDeep(this.columns);
        const prep = (column, parent) => {
          column.id = newId();
          column.parent = parent;
          column.width = 'auto';
          column.boxWidth = null;
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
        const newId = this.idCreator('hr');
        const count = currentColumns.reduce(this.maxColumnChildren, 1);
        const height = 'auto';
        const rows = new Array(count).fill(null).map(() => ({ 
          height, 
          boxHeight: null,
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
       * Handles vertical scroll when the table is
       * - Shifts the absolute header down (translate) as the user scrolls through the table
       */
      updateTranslateY() {
        if (!this.headerActive) return;
        // Offset the header by the difference of the trigger 
        // point and the current scroll position.      
        const y = this.waypointContext.oldScroll.y;
        const t = this.waypointTop.triggerPoint;
        const translateY = y - t - 1;
        // Had to bypass reactive style management for smoother FPS
        this.$refs.header.$el.style.transform = `translateY(${ translateY }px)`;
        if (this.firstColumnSticky) {
          this.$refs.firstColumnHeader.$el.style.transform = `translate(${ this.translateX }px ,${ translateY }px)`;
        }
        this.translateY = translateY;
      },
      /**
       * Handles horizontal scroll
       * - Shifts the first column as the user scrolls
       */
      updateTranslateX() {
        const display = this.$refs.display;
        if (this.firstColumnSticky) {
          const translateX = display.scrollLeft;
          this.$refs.firstColumn.$el.style.transform = `translateX(${ translateX }px)`;
          this.$refs.firstColumnHeader.$el.style.transform = `translate(${ translateX }px ,${ this.translateY }px)`;
          this.translateX = translateX;
        }
      },
      /**
       * Method to attach handlers needed after creation
       */
      attachHandlers() {
        this.handlerScrollX = this.throttleScroll(this.updateTranslateX); // Note: Non-reactive property
        this.handlerScrollY = this.throttleScroll(this.updateTranslateY); // Note: Non-reactive property
        this.$refs.display.addEventListener('scroll', this.handlerScrollX );
        this.scrollContext.addEventListener('scroll', this.handlerScrollY);
        window.addEventListener('resize', this.resizeHandler);
      },
      /**
       * Cleanup function for when component is not in use
       */
      removeHandlers() {
        this.$refs.display.removeEventListener('scroll', this.handlerScrollX);
        this.scrollContext.removeEventListener('scroll', this.handlerScrollY);
        window.removeEventListener('resize', this.resizeHandler);
      },
      setTableSizes() {
        // Set the table and it's cloned header to the exact same width
        const table = this.$refs.table;
        this.tableWidth = `${ table.$el.getBoundingClientRect().width }px`;
        const size = (object, key) => document.getElementById(object.id).getBoundingClientRect()[key];
        const setRowHeight = row => {
          row.boxHeight = size(row, 'height');
          row.height = `${ row.boxHeight }px`;
        };
        // Set the tables header <tr> and <th> to their rendered sizes
        // By measuring each and updating it's column object data
        // reactively updating all the cloned verisons
        this.headerRows.forEach(row => {
          setRowHeight(row);
          row.columns.forEach(column => {
            column.boxWidth = size(column, 'width');
            column.width = `${ column.boxWidth }px`;
          });
        });
        // If first column sticky the plugin needs to set  
        // each row's height so the cloned column matches
        if (this.firstColumnSticky) {
          this.currentRows.forEach(row => setRowHeight(row));
        }
        this.$nextTick(() => this.sizesCalculated = true);
      },
      removeTableSizes() {
        this.sizesCalculated = false;
        const setRowHeight = row => {
          row.boxHeight = null;
          row.height = 'auto';
        };
        this.tableWidth = 'auto';
        this.headerRows.forEach(row => {
          setRowHeight(row);
          row.columns.forEach(column => {
            column.boxWidth = null;
            column.width = 'auto';
          });
        });
        if (this.firstColumnSticky) {
          this.currentRows.forEach(row => setRowHeight(row));
        }
      },
      tableReady() {
        this.setTableSizes();
      },
      setupWaypoint() {
        const element = this.$refs.display;
        const header = this.$refs.header.$el;
        const config = { 
          element,
          context: this.scrollContext, 
          handler: entered => this.headerActive = entered,
          offsetBottom() {
            return header.offsetHeight;
          }
        };
        this.elementWaypoint = new ElementWaypoint(config); // Note: Non-reactive property
        this.waypointTop = this.elementWaypoint.top;
        this.waypointContext = this.waypointTop.context;
      }
    },
    mounted() {
      this.setupWaypoint();
      this.attachHandlers();
      console.log('TABLE STICKY', this);
    },
    beforeDestroy() {
      this.removeHandlers();
    }
  }
</script>

<style lang="scss">
  $duration: 200ms;
  $debug: true;
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
    // z-index: 1;
  }
  .TableSticky__table {
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
    // border-width: 0;
  }
  .TableSticky__table--header,
  .TableSticky__table--first-column,
  .TableSticky__table--first-column-header {
    position: absolute;
    top: 0;
    left: 0;
    will-change: opacity, transform;
    // opacity: 0;
  }
  .TableSticky__table--header {
    width: auto;
    // z-index: 10;
    width: 100%;
    transition: opacity $duration;
    background-color: white;
  }
  .TableSticky__table--first-column,
  .TableSticky__table--first-column-header {
    width: auto;
    table-layout: fixed;
  }
  .TableSticky__table--first-column-header {
    
  }
</style>