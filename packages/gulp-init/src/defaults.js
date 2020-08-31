// =============================================================================
// Default Configuration
// =============================================================================

function defaults(context) {
  return {
    // General settings are kept at first level
    paths: {
      output: ""
    },
    // Settings to be merged per NODE_ENV
    env: {
      production: {

      }
    }
  };
}