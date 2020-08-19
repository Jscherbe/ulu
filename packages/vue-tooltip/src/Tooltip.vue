<template>
  <div 
    id="tooltip" 
    class="tooltip" 
    :style="'opacity: ' + (tooltipActive ? '1' : '0') + ';'"
    :data-tooltip-position="position"
  >
    <div class="tooltip__layout-wrap">
      <strong 
        v-if="tooltipTitle" 
        class="tooltip__title"
      >
        {{ tooltipTitle }}
      </strong>
      {{ tooltipContent }}
    </div>
    <div class="tooltip__caret"></div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  export default {
    name: 'tooltip',
    data() {
      return {
        position : 'below',
        calcHeight : 100,
        $element : null,
        $elementLayout: null
      }
    },
    computed: {
      ...mapState(['tooltipContent', 'tooltipActive', 'tooltipTitle'])
    },
    watch: {
      tooltipActive(value) {
        if (value) {
          this.$nextTick(() => {
            this.calcHeight = this.$elementLayout.height();
          });
          
        }
      }
    },
    mounted() {
      const $tooltip = this.$element = $('#tooltip');
      this.$elementLayout = $tooltip.find('.tooltip__layout-wrap');

      const ww = $(window).width();
      const wh = $(window).height();
      const maxWidth = 280; // Aligns to the CSS
      // const maxHeight = 100;
      const extraSpace = 30; // Space to make up for the distance positioned from the cursor and some

      let x, y;

      // Attach mouse handler only allow it to be active when the state is so
      $(window).on('mousemove', (e) => {
        
        if (this.tooltipActive) {

          x = e.clientX;
          y = e.clientY;

          if (x > ww - (maxWidth + extraSpace)) {
            this.position = 'left';
          } else if (x < (maxWidth + extraSpace)) {
            this.position = 'right';
          } else if (y > wh - (this.calcHeight || 100) - extraSpace) {
            this.position = "above";
          } else {
            this.position = "below";
          }

          $tooltip.css({
            top: y + 'px',
            left: x + 'px'
          });
        }
      });
    }
  }
</script>

<style lang="less">
  @import 'vars';
  
  @{root} {
    @tt-bg: black;
    @tt-pad: 20px;

    .tooltip {
      position: fixed;
      display: inline-block;
      z-index: 100;
      transition: opacity 200ms;
      opacity: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;

      &__layout-wrap {
        position: absolute;
        // max-height: 100px;  // This needs to align to the logic for the tooltip
        max-width: 280px;   // This needs to align to the logic for the tooltip
        min-width: 150px;
        background: @tt-bg;
        color: lightgray;
        text-align: center;
        font-size: #TYPE.size[small];
        box-shadow: @shadow--above;
        border-radius: 10px;
        padding: 0.2em 1em;
      }
      &__caret {
        position: absolute;
        width: 0; 
        height: 0; 
        border-width: 5px;
        border-style: solid;
        border-color: transparent;
      }
      &__title {
        display: block;
      }
      
      // States
      &[data-tooltip-position="above"] {
        .tooltip__layout-wrap {
          bottom: 100%;
          margin: 0 0 @tt-pad 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .tooltip__caret {
          top: 100%;
          margin-top: -@tt-pad - 1px; // Overlap
          left: 50%;
          transform: translateX(-50%);
          border-top-color: @tt-bg;
        }
      }
      &[data-tooltip-position="below"] {
        .tooltip__layout-wrap {
          top: 100%;
          margin: @tt-pad 0 0 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .tooltip__caret {
          bottom: 100%;
          margin-bottom: -@tt-pad - 1px; // Overlap
          left: 50%;
          transform: translateX(-50%);
          border-bottom-color: @tt-bg;
        }
      }
      &[data-tooltip-position="left"] {
        .tooltip__layout-wrap {
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          margin: 0 @tt-pad 0 0;
        }
        .tooltip__caret {
          border-left-color: @tt-bg;
          right: 100%;
          top: 50%;
          margin-right: 4px;
          border-width: 10px;
          transform: translateY(-50%);
        }
      }
      &[data-tooltip-position="right"] {
        .tooltip__layout-wrap {
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          margin: 0 0 0 @tt-pad;
        }
        .tooltip__caret {
          border-right-color: @tt-bg;
          left: 100%;
          top: 50%;
          margin-left: 4px;
          border-width: 10px;
          transform: translateY(-50%);
        }
      }
    }
  }
</style>