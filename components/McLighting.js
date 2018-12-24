const msgflo = require('msgflo-nodejs');
const color = require('color');
const mclighting = require('../lib/mclighting');

module.exports = (client, role) => {
  const definition = {
    component: 'c3-flo/McLighting',
    label: 'Communications with a McLighting device',
    icon: 'lightbulb-o',
    inports: [
      {
        id: 'address',
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

  let mcClient;
  const process = (inport, indata, callback) => {
    if (inport !== 'address' && !mcClient) {
      callback('error', new Error('Address must be provided first'));
      return;
    }
    if (inport === 'address') {
      mcClient = mclighting(indata);
      callback('out', null, indata);
      return;
    }
    if (inport === 'command') {
      mcClient(indata)
        .then((result) => {
          callback('out', null, result);
        }, (error) => {
          callback('error', error);
        });
      return;
    }
    if (inport === 'palette') {
      // TODO: Make variant configurable
      const value = color.rgb(indata.v1);
      mcClient(value.hex())
        .then((result) => {
          callback('out', null, result);
        }, (error) => {
          callback('error', error);
        });
    }
  };
  return new msgflo.participant.Participant(client, definition, process, role);
};
