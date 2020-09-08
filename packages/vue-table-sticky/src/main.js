import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'waypoints/lib/noframework.waypoints.min';
import "waypoints/lib/shortcuts/inview";

Vue.config.productionTip = false

// Testing
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
