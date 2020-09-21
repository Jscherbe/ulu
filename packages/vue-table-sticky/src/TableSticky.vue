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
        :caption="caption"
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
      <!-- Scroll Controls (optionally allow user templating via slot passed methods) -->
      <div 
        class="TableSticky__controls" 
        ref="controls"
        v-if="controlsShown"
        aria-hidden="true"
      >
        <slot 
          v-if="$slots.controls" 
          name="controls" 
          :scrollLeft="scrollLeft"
          :scrollRight="scrollRight"
          :canScrollLeft="canScrollLeft"
          :canScrollRight="canScrollRight"
        />
        <div v-else class="TableSticky__controls-inner">
          <button 
            class="TableSticky__control TableSticky__control--scroll-left" 
            @click="scrollLeft"
            :disabled="!canScrollLeft"
          >
            Left
            <!-- <img :src="scrollLeftIcon" alt="left"> -->
          </button>
          <button 
            class="TableSticky__control TableSticky__control--scroll-right" 
            @click="scrollRight"
            :disabled="!canScrollRight"
          >
            Right
            <!-- <img :src="scrollRightIcon" alt="right"> -->
          </button>
        </div>
      </div>
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
      /**
       * Hidden caption for accessibility
       */
      caption: {
        type: String,
        required
      },      
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
       * Whether the first column of the table should be sticky
       * - Requires that the table's first column header is nested
       */
      firstColumnSticky: Boolean,
      /**
       * Prefixed used for id generation
       */
      idPrefix: {
        type: String,
        default: 'DT'
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
       * Enables the visiblity of the scroll controls
       * - Scroll controls shift the tables x-axis when the table has overflow-x
       * - Can be templated manually using slot named "controlsButtons", slot needs to create layout and call methods 
       *   + scope = { scrollLeft, scrollRight, canScrollLeft, canScrollRight }
       * - Scroll controls are transformed with the header (move down as the user scrolls)
       */
      scrollControls: Boolean,
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
       * Amount to scroll when user uses scroll controls (pixels)
       */
      scrollControlAmount: {
        type: Number,
        default: 100
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
        overflownX: false,
        canScrollLeft: false,
        canScrollRight: false
      };
    },
    computed: {
      controlsShown() {
        return this.scrollControls && this.overflownX;
      },
      headerOpacityY() {
        return +(this.headerActive && this.sizesCalculated);
      },
      headerOpacityX() {
        // Only false (0) when transalte is 0
        return +(this.sizesCalculated && this.overflownX);
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
       * Method to attach handlers needed after creation
       */
      attachHandlers() {
        this.handlerScrollX = this.throttleScroll(this.onScrollX); // Note: Non-reactive property
        this.handlerScrollY = this.throttleScroll(this.onScrollY); // Note: Non-reactive property
        this.$refs.display.addEventListener('scroll', this.handlerScrollX );
        this.scrollContext.addEventListener('scroll', this.handlerScrollY);
        window.addEventListener('resize', this.resizeHandler);
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
       * Checks and sets state if the table is overflow horizontally
       */
      checkOverflowX() {
        this.overflownX = this.$refs.display.scrollWidth > this.$refs.display.clientWidth;
      },
      /**
       * Checks whether if the tables scroll position is at the start or end and updates state
       */
      checkScrollability() {
        if (!this.overflownX) return;
        const element = this.$refs.display;
        this.canScrollLeft = element.scrollLeft > 0;
        this.canScrollRight = element.clientWidth + element.scrollLeft < element.scrollWidth;
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
          this.checkOverflowX();
        }
      },
      onScrollY() {
        this.calcTranslateY();
      },
      onScrollX() {
        this.calcTranslateX();
        this.checkScrollability();
      },
      onWaypoint(entered, direction) {
        this.headerActive = entered;
        if (!entered && direction === "up") {
          this.setTranslateY(0);
        }
      },      
      idCreator(type) {
        let id = 0;
        return () => `${ this.idPrefix }-${ type }-${ ++id }`;
      },
      /**
       * Recursive function used as a reducer to return the deepest nested columns
       */
      maxColumnChildren(d, c) {
        const m = c.columns ? c.columns.reduce(this.maxColumnChildren) + 1 : 1;
        return d > m ? d : m;
      },
      removeHandlers() {
        this.$refs.display.removeEventListener('scroll', this.handlerScrollX);
        this.scrollContext.removeEventListener('scroll', this.handlerScrollY);
        window.removeEventListener('resize', this.resizeHandler);
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
      scrollLeft() {
        const element = this.$refs.display;
        const scrollLeft = element.scrollLeft;
        const amount = this.scrollControlAmount;
        const toScroll = scrollLeft - amount;

        if (toScroll < 0) {
          element.scrollLeft = 0;
        } else {
          element.scrollLeft = toScroll;
        }
      },
      scrollRight() {
        const element = this.$refs.display;
        const scrollWidth = element.scrollWidth;
        const width = element.clientWidth;
        const scrollLeft = element.scrollLeft;
        const amount = this.scrollControlAmount;
        const toScroll = scrollLeft + amount;
        // If amount would be greater than scrollable area
        // scroll to end
        if (toScroll > scrollWidth) {
          element.scrollLeft = element.scrollWidth;
        } else {
          element.scrollLeft = toScroll;
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
      }, 
      /**
       * Cleanup function for when component is not in use
       */
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
      /**
       * Sets the translation CSS (y axis) on header bypassing reactivity for smoother FPS
       */
      setTranslateY(y) {
        const cssTransY = `translateY(${ y }px)`;
        const cssTransBoth = `translate(${ this.translateX }px ,${ y }px)`;
        this.$refs.header.$el.style.transform = cssTransY;
        if (this.firstColumnSticky) {
          this.$refs.firstColumnHeader.$el.style.transform = cssTransBoth;
        }
        if (this.controlsShown) {
          this.$refs.controls.style.transform = cssTransBoth;
        }
        this.translateY = y;
      },
      /**
       * Sets the translation CSS (x axis) on header bypassing reactivity for smoother FPS
       */
      setTranslateX(x) {
        const cssTransX = `translateX(${ x }px)`;
        const cssTransBoth = `translate(${ x }px ,${ this.translateY }px)`;
        if (this.firstColumnSticky) {
          this.$refs.firstColumn.$el.style.transform = cssTransX;
          this.$refs.firstColumnHeader.$el.style.transform = cssTransBoth;
        }
        if (this.controlsShown) {
          this.$refs.controls.style.transform = cssTransBoth;
        }
        this.translateX = x;
      },
      /**
       * Creates a new throttled scroll handler
       */
      tableReady() {
        this.setTableSizes();
      },
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
    },
    mounted() {
      this.setupWaypoint();
      this.attachHandlers();
      this.checkOverflowX();
      this.checkScrollability();
      console.log(this);
    },
    beforeDestroy() {
      this.removeHandlers();
    }
  }
</script>

<style lang="scss">
  $duration: 200ms;
  $box-shadow: 0 1px 3px rgba(0,0,0,0.5);
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
    scroll-behavior: smooth;
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
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  // NOTE: The table caption needs to be positioned normally
  // as display table-cell. Making absolute for hidden-visually 
  // is causing chrome to add an anonoymous cell to the table resulting in a 1px
  // cell under the header. Which is messing up alginments. The only solution
  // without removing the <caption> (not good for WCAG) is to position it at the 
  // of the table so it doesn't affect the header alignments. Then cropping it to 
  // a pixel and using negative margin to remove it's pixel from the flow beneath 
  .TableSticky__caption {
    caption-side: bottom;
    margin-bottom: -1px;
    height: 1px;
    overflow: hidden;
  }
  .TableSticky__controls {
    position: absolute;
    top: 75vh;
    right: 20px;
  }
  .TableSticky__controls-inner {
    display: flex;
  }
  .TableSticky__control {
    background-color: blue;
    color: white;
    border-radius: 3em;
    border: none;
    outline: none;
    box-shadow: $box-shadow;
    text-align: center;
    padding: 0.25em 1em;
    &--scroll-left {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: 1px solid darkblue;
    }
    &--scroll-right {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
</style>