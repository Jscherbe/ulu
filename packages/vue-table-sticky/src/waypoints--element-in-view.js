const defaults = {
  context: window,
  offsetTop: 0,
  offsetBottom: 0,
  /**
   * 
   * @param {Boolean} active Whether the element waypoint is currently active (within)
   * @param {String} direction Direction activated or deactivated
   */
  handler(active, direction) {}
};
/**
 * Reusable waypoint class that adds two waypoints in order to call user 
 * handler when the element is in view or out of view. Note the user's handler 
 * function works like the waypoints handler function but provides two argumnets
 *   function handler(active, direction) {
 * 
 *   }
 */
export default class ElementInView {
  constructor(options) {
    Object.assign(this, defaults, options);
    this.init();
  }
  init() {
    const offsetBottom = this.offsetBottom;
    const userHandler = this.handler;

    this.waypointTop = this.waypoint({
      offset: this.offsetTop,
      handler(d) {
        userHandler.call(this, d === "down", d);
      },
    });
    this.waypointBottom = this.waypoint({
      // Dynamic bottom offset, 
      // - optionally modified by users offsetBottom
      offset() {
        let offset = offsetBottom;
        if (typeof offset === "function") offset = offset();
        return (-this.element.offsetHeight) + offset;
      },
      handler(d) {
        userHandler.call(this, d === "up", d);
      }
    });
  }
  waypoint(config) {
    return new Waypoint({
      element: this.element,
      context: this.context,
      ...config
    });
  }
}