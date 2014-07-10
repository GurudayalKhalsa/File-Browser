var requests = {
  "/serve/*": require('./serve'),
  "/info": require('./info'),
  "/rename": require('./rename'),
  "/touch": require('./touch'),
  "/mkdir": require('./mkdir'),
  "/delete": require('./delete'),
  "/move": require('./move'),
  "/read*": require('./read')
};

module.exports = requests;