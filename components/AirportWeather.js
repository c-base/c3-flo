const msgflo = require('msgflo-nodejs');
const adds = require('adds');

const getWeather = (station, callback) => adds('metars', {
  stationString: station,
  hoursBeforeNow: 1,
})
  .then(data => callback(null, data[0]),
    err => callback(err));

const getHumidity = (weather) => {
  const Tc = weather.temp_c;
  const Tdc = weather.dewpoint_c;
  const Es = 6.11 * (10.0 ** (7.5 * Tc / (237.7 + Tc)));
  const E = 6.11 * (10.0 ** (7.5 * Tdc / (237.7 + Tdc)));
  return (E / Es) * 100;
};

const Participant = (client, role) => {
  let station = null;
  let lastMetar = null;
  let participant;
  const definition = {
    id: role,
    component: 'c-flo/AirportWeather',
    icon: 'plane',
    label: 'Fetch weather data for an airport',
    inports: [
      {
        id: 'icao',
        type: 'string',
        hidden: false,
      },
      {
        id: 'fetch',
        type: 'bang',
        hidden: false,
      },
      {
        id: 'temperature',
        type: 'float',
        hidden: true,
      },
      {
        id: 'pressure',
        type: 'float',
        hidden: true,
      },
    ],
    outports: [
      {
        id: 'temperature',
        type: 'float',
        hidden: false,
      },
      {
        id: 'humidity',
        type: 'float',
        hidden: false,
      },
      {
        id: 'pressure',
        type: 'float',
        hidden: false,
      },
      {
        id: 'metar',
        type: 'string',
        hidden: false,
      },
    {
      id: 'error',
      type: 'object',
      hidden: false,
    },
    {
      id: 'skipped',
      type: 'object',
      hidden: true,
    },
    ],
  };
  const process = (inport, indata, callback) => {
    if (['temperature', 'humidity', 'pressure', 'metar'].includes(inport)) {
      // Forward to outport
      callback(inport, null, indata);
      return;
    }
    if (!['icao', 'fetch'].includes(inport)) {
      callback('error', new Error('Unknown port name'));
      return;
    }
    if (inport === 'icao') {
      station = indata;
    }
    if ((inport === 'fetch') && (station === null)) {
      callback('error', new Error('No weather station provided'));
      return;
    }
    getWeather(station, (err, weather) => {
      if (err) {
        callback('error', err);
        return;
      }
      if (weather.raw_text === lastMetar) {
        // Send only when there is new METAR
        callback('skipped', null, weather);
        return;
      }
      if (weather.sea_level_pressure_mb < 500) {
        // Faulty reading, skip
        callback('skipped', null, weather);
        return;
      }
      participant.send('pressure', weather.sea_level_pressure_mb);
      participant.send('humidity', getHumidity(weather));
      participant.send('metar', weather.raw_text);
      lastMetar = weather.raw_text;
      callback('temperature', null, weather.temp_c);
    });
  };

  participant = new msgflo.participant.Participant(client, definition, process, role);
  return participant;
};

module.exports = Participant;
