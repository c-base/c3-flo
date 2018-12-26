const msgflo = require('msgflo-nodejs');
const color = require('color');
const mclighting = require('../lib/mclighting');

module.exports = (client, role) => {
  const definition = {
    component: 'c3-flo/McLightings',
    label: 'Communications with a set of McLighting devices',
    icon: 'lightbulb-o',
    inports: [
      {
        id: 'addresses',
        type: 'string',
      },
      {
        id: 'command',
        type: 'string',
      },
      {
        id: 'palette',
        type: 'object',
      },
    ],
    outports: [
      {
        id: 'out',
        type: 'string',
      },
      {
        id: 'error',
        type: 'string',
      },
    ],
  };

  let mcClients;
  let lastSent = null;
  const process = (inport, indata, callback) => {
    const now = new Date();
    if (inport !== 'addresses' && !mcClients) {
      callback('error', new Error('Addresses must be provided first'));
      return;
    }
    if (inport === 'addresses') {
      mcClients = indata.map(address => mclighting(address));
      callback('out', null, 'CONNECTING');
      return;
    }
    if (inport === 'command') {
      lastSent = now;
      Promise.all(mcClients.map(mcClient => mcClient(indata)))
        .then((result) => {
          callback('out', null, result);
        }, (error) => {
          callback('error', error);
        });
      return;
    }
    if (inport === 'palette') {
      if (lastSent && (now.getTime() - lastSent.getTime()) < 10000) {
        // Throttle farbgeber to allow animations to run more smoothly
        callback('out', null, 'SKIPPED');
        return;
      }
      lastSent = now;
      // TODO: Make variant configurable
      const value = color.rgb(indata.v1);
      Promise.all(mcClients.map(mcClient => mcClient(value.hex())))
        .then((result) => {
          callback('out', null, result);
        }, (error) => {
          callback('error', error);
        });
    }
  };
  return new msgflo.participant.Participant(client, definition, process, role);
};
