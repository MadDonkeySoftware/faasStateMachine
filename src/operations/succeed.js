const repos = require('../repos');
const enums = require('./enums');

function Succeed(definition, metadata) {
  if (definition.Type !== 'Succeed') throw new Error(`Attempted to use ${definition.Type} type for "Succeed".`);
  this.resource = definition.Resource;
  this.catch = definition.Catch;
  this.operationId = metadata.id;
  this.executionId = metadata.execution;
  this.input = metadata.input;
  this.output = metadata.input;
}

Succeed.prototype.run = function run() {
  this.output = this.input;
  // if (this.output && typeof this.output === 'object') {
  //   this.output = JSON.stringify(this.output);
  // }

  const {
    operationId,
    output,
    executionId,
  } = this;

  return repos.updateOperation(operationId, enums.STATUS.Succeeded, output)
    .then(() => repos.updateExecution(executionId, enums.STATUS.Succeeded))
    .then(() => ({ output }));
};

module.exports = Succeed;
