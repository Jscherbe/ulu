// =============================================================================
// Console Logger (for Node)
// =============================================================================

const path = require('path');
const Chalk = require('chalk');
const chalk = new Chalk.Instance({ level: 1 });
const defaults = {
        enabled: true,        // <boolean|function>      Whether to output logs
        title: "",            // <string>       The title to prefix the logs with 
        subtitle: false,      // <string>       Secondary title prefix
        devTitle: "dev log",  // <string>     Text to use when using the "developer" log output (for developers to see)
        devEnabled: true,     // <boolean|function>      Whether to output .dev()  logs
        colorTitle: "green",
        colorSubtitle: "green",
        colorError: "red",
        colorWarning: "yellow",
        colorDev: "magenata"
      };

/**
 *   Returns a debug object based on the configuration past
 *   @param  {object} passed The options passed when constructing the debug Object
 *   @return {Object}        Object with methods that used the passed options
 */
module.exports = function(passed) {

  const options = Object.assign({}, defaults, passed);

  let prefix = options.title ? chalk.bold[options.colorTitle](`${ options.title } `) : "";

  if (options.subtitle) {
    prefix +=  chalk[options.colorSubtitle](`(${ options.subtitle })`);
  }

  // prefix = chalk[options.colorSubtitle](prefix);

  function isEnabled(isDev) {
    const key = isDev ? "devEnabled" : "enabled";
    if (typeof options[key] === "function") {
      return options[key]();
    } else {
      return options[key];
    }
  }

  return {
    message: function(...msgs) {
      if (!isEnabled()) return; 
      msgs.unshift(prefix);
      console.log.apply(console, msgs);
    },
    required: function(...msgs) {
      msgs.unshift(prefix);
      console.log.apply(console, msgs);
    },
    error: function(...msgs) {
      msgs.unshift(chalk[options.colorError]('(Error) '));
      this.required.apply(this, msgs);
    },
    warning: function(...msgs) {
      if (!isEnabled()) return;
      msgs.unshift(chalk[options.colorWarning]('(Warning) '));
      this.message.apply(this, msgs);
    },
    list: function(title, array) {
      if (!isEnabled()) return;
      if (!title) {
        console.log(" - " +  array.join("\n - "));
      } else {
        this.message.call(this, title, "\n - " +  array.join("\n - "));
      }
    },
    listOrdered: function(title, array) {
      if (!isEnabled()) return;
      var list = array.reduce((acc, current, index) => {
        var item = "  " + (index + 1) + ". " + current.toString();
        return acc + item + (index !== array.length - 1 ? "\n" : "");
      }, "");
      if (!title) {
        console.log(list);
      } else {
        this.message.call(this, title, "\n" + list);
      }
    },
    dev: function(...msgs) {
      if (!isEnabled(true)) return; 
      msgs.unshift(chalk.magenta(`(${ options.devTitle })`));
      msgs.unshift(prefix);
      console.log.apply(console, msgs);
    },
    memory: function(scriptProcess, ...msgs) {
      if (!isEnabled()) return; 

      const used = scriptProcess.memoryUsage(),
            details = [];

      for (let key in used) {
        details.push(`\n - ${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
      }
      this.dev.apply(this, msgs.concat(details));
    },
    time: function(label = prefix) {
      if (!isEnabled()) return;
      console.time(label);
    },
    timeEnd: function(label = prefix, ...msgs) {
      if (!isEnabled()) return;
      msgs.unshift(chalk.yellow('(Time Stamp)'));
      this.message.apply(this, msgs);
      console.timeEnd(label);
    }
  };
};