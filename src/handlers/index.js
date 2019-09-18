const uuid = require('uuid');

const repos = require('../repos');
const workers = require('../workers');

const listStateMachines = (request, response) => repos.getStateMachines().then((result) => {
  response.send(JSON.stringify(result));
});

const createStateMachine = (request, response) => {
  const machineId = uuid.v4();
  return repos.createStateMachine(machineId, request.body.Name, request.body).then(() => {
    response.send(JSON.stringify({
      uuid: machineId,
    }));
  });
};

const getStateMachine = (request, response) => {
  const { id } = request.params;
  return repos.getStateMachine(id).then((machine) => {
    if (machine) {
      response.send(JSON.stringify({
        id: machine.id,
        name: machine.name,
        definition: machine.definition,
      }));
    } else {
      response.status(404);
      response.send();
    }
  });
};

const invokeStateMachine = (request, response) => {
  const { params, body } = request;
  const { id } = params;
  const executionId = uuid.v4();
  const operationId = uuid.v4();

  return repos.getStateMachine(id)
    .then((machine) => repos.createExecution(executionId, machine.active_version)
      .then(() => repos.createOperation(operationId, executionId, machine.definition.StartAt, body))
      .then(() => workers.enqueueMessage({ executionId, operationId, fromInvoke: true }))
      .then(() => {
        response.send(JSON.stringify({
          id: executionId,
        }));
      }));
};

const getDetailsForExecution = (request, response) => {
  const { id } = request.params;
  return repos.getDetailsForExecution(id).then((details) => {
    if (details) {
      response.send(JSON.stringify({
        ...details,
      }));
    } else {
      response.status(404);
      response.send();
    }
  });
};

module.exports = {
  listStateMachines,
  createStateMachine,
  getStateMachine,
  invokeStateMachine,
  getDetailsForExecution,
};
