<template>
  <div class="CollapsibleRegion" data-collapsible-region-open="isOpen">
    <button 
      class="CollapsibleRegion__toggle"
      :id="toggleId"
      :aria-controls="contentId" 
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <slot v-if="$slots.toggle" name="toggle" />
    </button>
    <div 
      class="CollapsibleRegion__content"
      tabindex="-1"
      ref="content"
      :id="contentId"
      :aria-hidden="!isOpen"
      :aria-labelledby="toggleId"
      :style="contentStyles"
    >
      <slot/>
    </div>
  </div>
</template>

<script>
  let uid = 0;
  export default {
    name: 'CollapsibleRegion',
    props: {
      /**
       * When the component is shown it should start hidden
       */
      startVisible: {
        type: Boolean,
        default: false
      },
      /**
       * Whether or not to transition the show and hide
       */          
      transitionHeight: {
        type: Boolean,
        default: false
      },
      /**
       * Transition should fade as it expands
       */         
      transitionFades: {
        type: Boolean,
        default: false
      },
      /**
       * Transition Duration
       */      
      transitionDuration: {
        type: String,
        default: '400ms'
      },
      /**
       * Transition Timing Function
       */
      transitionTiming: {
        type: String,
        default: 'ease-out'
      },
      /**
       * Callback fired after animation completes passed (event, 'open' || 'closed)
       */
      animationCallback: {
        type: Function,
      },
      /**
       * Fallback if something goes wrong if using transition height, set a little longer than the max duration
       */
      transitionTimeout: {
        type: Number,
        default: 1000
      }
    },
    data() {
      const isOpen = this.startVisible;
      return {
        isOpen,
        toggleId: getUid(),
        contentId: getUid(),
        contentHeight: isOpen ? 'auto' : '0px',
        contentOpacity: this.transitionFades && !isOpen ? 0 : 1,
        transitionsDisabled: false,
        isHidden: isOpen ? false : true
      }
    },
    computed: {
      contentStyles() {
        let styles = {};
        const transitionProp = ["height"];
        // If using transitionHeight we need to set the following
        if (this.transitionHeight) {
          if (this.transitionFades) transitionProp.push("opacity");
          styles = { 
            overflow:           'hidden',
            height:             this.contentHeight,
            transitionDuration: this.transitionDuration,
            transitionTiming:   this.transitionTiming,
            opacity:            this.contentOpacity,
            transitionProperty: this.transitionsDisabled ? "none" : transitionProp.join()
          };
        }
        // The component always sets display, for transitions this is done after 
        // the transition has completed
        if (this.isHidden) {
          styles.display = "none";
        }
        return styles;
      }
    },
    methods: {
      /**
       * Recursive function to generate and test id
       */
      getUid(test) {
        const id = `Ulu-C-${ ++uid }`;
        return document.getElementById(id) ? this.getUid() : id;
      },
      /**
       * Function used to toggle the collapsible 
       */
      toggle(event) {
        this.changeState(!this.isOpen, event);
      },
      /**
       * Function that will change the state of the component
       * @todo This should be exposed to the user
       */
      changeState(toOpen, event) {
        const setState = () => {
          this.isOpen = toOpen;
          this.isHidden = !toOpen;
        };
        const action = this.isOpen ? 'transitionClosed' : 'transitionOpen';
        if (this.isOpen !== toOpen) {
          if (this.transitionHeight) {
            this[action](event, setState);
          } else {
            setState();
          }
        }
      },
      /**
       * Function that will handle setting the styles in a way that allows for
       * transitioning from display: none to height: auto. With optional fade.
       */
      transitionOpen(event, done) {
        let tid;
        const element = this.$refs.content;
        
        const complete = () => {
          clearTimeout(tid);
          this.contentHeight = 'auto';
          element.removeEventListener('transitionend', complete);
          if (done) done();
          if (this.animationCallback) this.animationCallback(event, 'open');
        };
        element.addEventListener('transitionend', complete);
        this.isHidden = false;
        this.$nextTick(() => {
          this.contentHeight = element.scrollHeight + 'px';
          if (this.transitionFades) this.contentOpacity = 1;
          tid = setTimeout(complete, this.transitionTimeout);
        });
      },
      /**
       * Function that will handle setting the styles in a way that allows for
       * transitioning from height: auto to display: none
       */      
      transitionClosed(event, done) {
        const element = this.$refs.content;
        const height = element.scrollHeight;
        const setup = () => {
          element.addEventListener('transitionend', complete);
          this.contentHeight = height + 'px';
          this.$nextTick(init);
        };
        const init = () => {
           this.transitionsDisabled = false;
           requestAnimationFrame(transition);
        };
        const transition = () => {
          this.contentHeight = '0px';
          if (this.transitionFades) this.contentOpacity = 0;
        };
        const complete = () => {
          clearTimeout(tid);
          element.removeEventListener('transitionend', complete);
          if (done) done();
          if (this.animationCallback) this.animationCallback(event, 'closed');
        };
        const fallback = () => {
          transition();
          complete();
        };
        
        this.transitionsDisabled = true;
        requestAnimationFrame(setup);
        const tid = setTimeout(fallback, this.transitionTimeout);
      },
    },
  }
</script>