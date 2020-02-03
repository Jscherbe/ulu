
# Gulp Init

Expose the main initialization function, responsible for accepting user  configuration and setting up gulp task. Users will have the ability to  configure the canned tasks or remove or override  them. They will also have the ability to add their  own custom tasks to initialize.

## Main Usage

```js
const { init } = require('@ulu/gul-init');

module.exports = init({ yourConfiguration });
```

The code will attach tasks for gulp. Which can be configured from a passed configuration file. See the API for configuration details.

## Optionally Use the 

[View the API](readme.docs.md)