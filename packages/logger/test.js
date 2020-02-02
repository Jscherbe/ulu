const simpleLog = require('./index.js');
const log = simpleLog({
  enabled: true,
  title: "Testing Simple Log",
  subtitle: "subtitle",
  devTitle: "dev"
});
const testArray = [
  "Apple",
  "Orange",
  "Kiwi",
  "Lime"
];

log.message("This is log.message(text)");
log.warning("This is log.warning(text)");
log.error("This is log.error(text)");
log.time("This is log.time(label) / log.timeEnd(label)");
log.timeEnd("This is log.time(label) / log.timeEnd(label)");
log.memory(process, "This is log.memory(text)");
log.required("This is log.required(text)");
log.list("This is log.list(title, array)", testArray);
log.listOrdered("This is log.listOrdered(title, array)", testArray);

