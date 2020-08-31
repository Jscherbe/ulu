// =============================================================================
// Ulu Configuration
// =============================================================================

// Description:     This file has the configuration for the site, used by:
//                  - Gulp
//                  - Less Framework
//                  - Webpack
//                  - SSG commands
//                  
// Usage:           Object keys correspond to the current environment

// jshint esversion:6


// Should I seperate the gulp stuff from other stuff can it share the same confuration file
// 
module.exports = {
  paths: {
    src: "",
    output: "public/",
    images: ""
  },
  plugins: {
    enabled: {
      jsUglify: true,
      cssNano: false
    },
    options: {
      jsUglify: {},
      cssNano: {}
    }
  },
  // // An object to hold user defined tasks (other default tasks will be available)
  tasks: {

  },
  env: {
    production: {

    }
  }
};


// module.exports = {
//   paths: {

//   },
//   coreDir: "_build/js/core/",
//   // An object to hold user defined tasks (other default tasks will be available)
//   tasks: {},
//   settings: {
//     all: {
//       paths: {
//         src: "",
//         output: "public/",
//         images: ""
//       },
//       plugins: {
//         enabled: {
//           jsUglify: true,
//           cssNano: false
//         },
//         options: {
//           jsUglify: {},
//           cssNano: {}
//         }
//       },
//     },
//     // Grouped settings (each key corresponds to specific task list)
//     development: {

//     },
//     production: {

//     }
//   }
// };