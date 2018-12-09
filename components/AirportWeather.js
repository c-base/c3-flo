const msgflo = require('msgflo-nodejs');
const { MetarFetcher } = require('metar-taf');
const metarParser = require('metar');

const metarFetcher = new MetarFetcher();

function getWeather(station, callback) {
  metarFetcher.getData(station).then((data) => {
    const clean = data.split('\n')[1];
    const parsed = metarParser(clean);
    parsed.metar = clean;
    return callback(null, parsed);
  }, err => callback(err));
}

function getHumidity(weather) {
  const Tc = weather.temperature;
  const Tdc = weather.dewpoint;
  const Es = 6.11 * (10.0 ** (7.5 * Tc / (237.7 + Tc)));
  const E = 6.11 * (10.0 ** (7.5 * Tdc / (237.7 + Tdc)));
  return (E / Es) * 100;
}

function Participant(client, role) {
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
  function process(inport, indata, callback) {
    if (inport === 'temperature' || inport === 'humidity' || inport === 'pressure' || inport === 'metar') {
      // Forward to outport
      callback(inport, null, indata);
      return;
    }
    if (inport !== 'icao' && inport !== 'fetch') {
      callback('error', new Error('Unknown port name'));
      return;
    }
    if (inport === 'icao') {
      station = indata;
    }
    if (inport === 'fetch' && station === null) {
      callback('error', new Error('No weather station provided'));
      return;
    }
    getWeather(station, (err, weather) => {
      if (err) {
        callback('error', err);
        return;
      }
      if (weather.metar === lastMetar) {
        // Send only when there is new METAR
        callback('skipped', null, weather);
        return;
      }
      if (weather.altimeterInHpa < 500) {
        // Faulty reading, skip
        callback('skipped', null, weather);
        return;
      }
      participant.send('pressure', weather.altimeterInHpa);
      participant.send('humidity', getHumidity(weather));
      participant.send('metar', weather.metar);
      lastMetar = weather.metar;
      callback('temperature', null, weather.temperature);
    });
  }
  participant = new msgflo.participant.Participant(client, definition, process, role);
  return participant;
}

module.exports = Participant;
