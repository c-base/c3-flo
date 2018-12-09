const app = require('../server/app'); // eslint-disable-line

// Configure environmental sensors
const leipzig = new app.Dictionary('Leipzig', 'leipzig');
leipzig.addMeasurement('lej_temperature', 'clima.temperature.lej', [
  {
    units: 'degrees',
    format: 'float',
    min: 0,
    max: 100,
  },
], {
  topic: 'airportweather.TEMPERATURE',
});
leipzig.addMeasurement('lej_humidity', 'clima.humidity.lej', [
  {
    units: 'percentage',
    format: 'float',
    min: 0,
    max: 100,
  },
], {
  topic: 'airportweather.HUMIDITY',
});
leipzig.addMeasurement('lej_pressure', 'clima.pressure.lej', [
  {
    units: 'hPa',
    format: 'float',
    min: 0,
    max: 1050,
  },
], {
  topic: 'airportweather.PRESSURE',
});

// Start the server
const server = new app.Server({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8080,
  wss_port: process.env.WSS_PORT || 8082,
  broker: process.env.MSGFLO_BROKER || 'mqtt://localhost',
  dictionaries: [leipzig],
  history: {
    host: process.env.INFLUX_HOST || 'localhost',
    db: process.env.INFLUX_DB || 'cbeam',
  },
});
server.start((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening in ${server.config.port}`);
});
