<!-- 
  Todo: 
    - Add pager <next><prev>
-->
<template>
  <div class="TableSticky">
    <div 
      ref="display" 
      class="TableSticky__display"
    >
      <TableStickyTable 
        ref="table"
        class="TableSticky__table TableSticky__table--actual"
        isActual
        :headerRows="headerRows" 
        :rows="currentRows"
        :rowColumns="rowColumns"
        :caption="caption"
        :idPrefix="idPrefix"
        @hook:mounted="tableReady"
      >
        <template 
          v-for="slot in Object.keys($scopedSlots)" 
          v-slot:[slot]="scope"
        >
          <slot :name="slot" v-bind="scope"/>
        </template>
      </TableStickyTable>
      <TableStickyTable 
        v-if="firstColumnSticky"
        ref="firstColumn"
        class="TableSticky__table TableSticky__table--first-column"
        :headerRows="headerRowsFirst" 
        :columnWidth="firstColumnSize.width"
        :rows="currentRows"
        :rowColumns="rowColumnsFirst"
        :idPrefix="idPrefix"
        :style="{
          opacity: headerOpacityX,
        }"
      >
        <template 
          v-for="slot in Object.keys($scopedSlots)" 
          v-slot:[slot]="scope"
        >
          <slot :name="slot" v-bind="scope"/>
        </template>
      </TableStickyTable>
      <TableStickyTable 
        ref="header"
        class="TableSticky__table TableSticky__table--header"
        :idPrefix="idPrefix"
        :style="{
          opacity: headerOpacityY,
          width: tableWidth
        }"
        :headerRows="headerRows" 
      >
        <template 
          v-for="slot in Object.keys($scopedSlots)" 
          v-slot:[slot]="scope"
        >
          <slot :name="slot" v-bind="scope"/>
        </template>
      </TableStickyTable>
      <TableStickyTable 
        v-if="firstColumnSticky"
        ref="firstColumnHeader"
        class="TableSticky__table TableSticky__table--first-column-header"
        :idPrefix="idPrefix"
        :headerRows="headerRowsFirst" 
        :style="{
          opacity: headerOpacityX,
        }"
      >
        <template 
          v-for="slot in Object.keys($scopedSlots)" 
          v-slot:[slot]="scope"
        >
          <slot :name="slot" v-bind="scope"/>
        </template>
      </TableStickyTable>
    </div>
  </div>
</template>

<script>
  import TableStickyTable from "./TableStickyTable.vue";
  import ElementWaypoint from "./element-waypoint.js";

  const cloneDeep = require('lodash/cloneDeep');
  const debounce = require('lodash/debounce');
  const arrayOfObjects = a => a.every(o => typeof o === "object");
  const required = true;

  export default {
    name: 'TableSticky',
    components: {
      TableStickyTable
    },
    props: {
      caption: String,
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
       * Array of column configurations to convert to list output
       * 
       * @property {Object} column A column config
       * @property {String|Boolean} column.title The title to output for the column if set to a falsey value nothing will print
       * @property {Array} column.columns Array of child columns
       * @property {String} column.key The key that should be usec to grab column's value from rows
       * @property {Function} column.value A function that returns the column's value used instead of key passed (row, column)
       * @property {String} column.slot Register custom slot name to use as a template for this column. Passing a slot with this name will link them. The slot are passed the ({row, column}). Note this will disable output of the column's value
       * @property {String} column.slotHeader Register custom slot name to use in the header
       * @property {String} column.class Custom class(s) to be set to column <th>
       * @property {String} column.classValue Custom class(s) to be set to column's value <td>       
       * @property {String} column.rowHeader When this column is printed in the <tbody> it should be a header for the row. Note supports multiple row headers from left to right only. No rowspan support for rowHeaders. 
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
        resizing: false,
        // handlerScrollX: this.throttleScroll(this.calcTranslateX)
      };
    },
    computed: {
      headerOpacityY() {
        return +(this.headerActive && this.sizesCalculated);
      },
      headerOpacityX() {
        // Only false (0) when transalte is 0
        return +(this.sizesCalculated);
      },
      /**
       * Used to output the body rows. This is an array of only the deepest child columns
       * parent column information can be accessed by reference
       */
      rowColumns() {
        const columns = this.currentColumns;
        const rowHeaderId = this.idCreator('rh');
        const rowColumns = [];
        const add = c => {
          if (c.columns) c.columns.forEach(add);
          else rowColumns.push(c);
        };
        // Create array of actaul 
        columns.forEach(add);
        // Iterate over all columns checking for rowHeader
        // - If a column has row header create an id funciton passed current row's index
        // - Store callbacks in an array to call on each rows cells
        let rowHeaders = [];
        rowColumns.forEach((c, columnIndex) => {
          // Creating copy of array here so it doesn't include it's own ID and also 
          // so there can be headers of headers going from left to right only
          const thisRowsHeader = rowHeaders.slice();
          c.getRowHeaders = rowIndex => thisRowsHeader.map(cb => cb(rowIndex)).join(' ');
          // Now we add this columns row header function
          // Which will be included in all columns after this iteration
          if (c.rowHeader) {
            c.getRowHeaderId = rowIndex => `${ this.idPrefix }-rh-${ rowIndex }-${ columnIndex }`;
            rowHeaders.push(c.getRowHeaderId);
          }
        });
        return rowColumns;
      },
      /**
       * Reduce the array of column header rows to the first row, first column
       */
      headerRowsFirst() {
        const firstRow = this.headerRows[0];
        const firstColumn = Object.assign({}, firstRow.columns[0], { rowspan: 1, colspan: 1 });
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
          this.calcTranslateY();
          this.calcTranslateX();
        }
      },
      idCreator(type) {
        let id = 0;
        return () => `${ this.idPrefix }-${ type }-${ ++id }`;
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
          } else if (!column.key && !column.value) {
            console.warn('TableSticky: Missing "key" or "value" in column configration for', column);
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
      calcTranslateY() {
        if (!this.headerActive) return;
        // Offset the header by the difference of the trigger 
        // point and the current scroll position.      
        const y = this.waypointContext.oldScroll.y;
        const t = this.waypointTop.triggerPoint;
        this.setTranslateY(y - t - 1);
      },
      /**
       * Handles horizontal scroll
       * - Shifts the first column as the user scrolls
       */
      calcTranslateX() {
        if (this.firstColumnSticky) {
          this.setTranslateX(this.$refs.display.scrollLeft);
        }
      },
      /**
       * Sets the translation CSS (y axis) on header bypassing reactivity for smoother FPS
       */
      setTranslateY(y) {
        console.log(y);
        this.$refs.header.$el.style.transform = `translateY(${ y }px)`;
        if (this.firstColumnSticky) {
          this.$refs.firstColumnHeader.$el.style.transform = `translate(${ this.translateX }px ,${ y }px)`;
        }
        this.translateY = y;
      },
      /**
       * Sets the translation CSS (x axis) on header bypassing reactivity for smoother FPS
       */
      setTranslateX(x) {
        if (this.firstColumnSticky) {
          this.$refs.firstColumn.$el.style.transform = `translateX(${ x }px)`;
          this.$refs.firstColumnHeader.$el.style.transform = `translate(${ x }px ,${ this.translateY }px)`;
        }
        this.translateX = x;
      },
      /**
       * Method to attach handlers needed after creation
       */
      attachHandlers() {
        this.handlerScrollX = this.throttleScroll(this.calcTranslateX); // Note: Non-reactive property
        this.handlerScrollY = this.throttleScroll(this.calcTranslateY); // Note: Non-reactive property
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
        const size = (element, key) => Math.ceil(element.getBoundingClientRect()[key]);
        this.tableWidth = `${ size(this.$refs.table.$el, 'width') }px`;
        const getElement = object => document.getElementById(object.id);

        const setRowHeight = row => {
          row.boxHeight = size(getElement(row), 'height');
          row.height = `${ row.boxHeight }px`;
        };
        // Set the tables header <tr> and <th> to their rendered sizes
        // By measuring each and updating it's column object data
        // reactively updating all the cloned verisons
        this.headerRows.forEach(row => {
          setRowHeight(row);
          row.columns.forEach(column => {
            column.boxWidth = size(getElement(column), 'width');
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
      onWaypoint(entered, direction) {
        this.headerActive = entered;
        if (!entered && direction === "up") {
          this.setTranslateY(0);
        }
      },
      setupWaypoint() {
        const element = this.$refs.display;
        const header = this.$refs.header.$el;
        const config = { 
          element,
          context: this.scrollContext, 
          handler: this.onWaypoint,
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
      console.log(this);
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
  }
  .TableSticky__table {
    border-collapse: collapse;
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .TableSticky__table--header,
  .TableSticky__table--first-column,
  .TableSticky__table--first-column-header {
    position: absolute;
    top: 0;
    left: 0;
    will-change: opacity, transform;
    transition: opacity $duration;
  }
  .TableSticky__table--first-column,
  .TableSticky__table--first-column-header {
    width: auto;
  }
  .TableSticky__hidden-visually {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>