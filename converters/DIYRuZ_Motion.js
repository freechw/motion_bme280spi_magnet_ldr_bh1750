const {
    fromZigbeeConverters,
    toZigbeeConverters,
    exposes
} = require('zigbee-herdsman-converters');

const bind = async (endpoint, target, clusters) => {
    for (const cluster of clusters) {
        await endpoint.bind(cluster, target);
    }
};

const ACCESS_STATE = 0b001, ACCESS_WRITE = 0b010, ACCESS_READ = 0b100;

const withEpPreffix = (converter) => ({
    ...converter,
    convert: (model, msg, publish, options, meta) => {
        const epID = msg.endpoint.ID;
        const converterResults = converter.convert(model, msg, publish, options, meta) || {};
        return Object.keys(converterResults)
            .reduce((result, key) => {
                result[`${key}_${epID}`] = converterResults[key];
                return result;
            }, {});
    },
});

const postfixWithEndpointName = (name, msg, definition) => {
    if (definition.meta && definition.meta.multiEndpoint) {
        const endpointName = definition.hasOwnProperty('endpoint') ?
            getKey(definition.endpoint(msg.device), msg.endpoint.ID) : msg.endpoint.ID;
        return `${name}_${endpointName}`;
    } else {
        return name;
    }
};

const fz = {
    occupancy_sensor_type: {
        cluster: 'msOccupancySensing',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data.hasOwnProperty('occupancySensorType')) {
                return {occupancy_sensor_type: msg.data.occupancySensorType};
            }
        },
    },
    illuminance: {
        cluster: 'msIlluminanceMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            if (msg.data.hasOwnProperty('measuredValue')) {
                const illuminance = msg.data['measuredValue'];
                const property = postfixWithEndpointName('illuminance', msg, model);
                return {[property]: msg.data.measuredValue};
//                return {illuminance: msg.data.measuredValue};
            }
        },
    },
};
const tz = {
    occupancy_timeout: {
        // set delay after motion detector changes from occupied to unoccupied
        key: ['occupancy_timeout'],
        convertSet: async (entity, key, value, meta) => {
            value *= 1;
            const thirdEndpoint = meta.device.getEndpoint(3);
            await thirdEndpoint.write('msOccupancySensing', {pirOToUDelay: value});
            return {state: {occupancy_timeout: value}};
        },
        convertGet: async (entity, key, meta) => {
            const thirdEndpoint = meta.device.getEndpoint(3);
            await thirdEndpoint.read('msOccupancySensing', ['pirOToUDelay']);
        },
    },
};

const device = {
        zigbeeModel: ['DIYRuZ_Motion'],
        model: 'DIYRuZ_Motion',
        vendor: 'DIYRuZ',
        description: '[Motion sensor](http://modkam.ru/?p=1700)',
        supports: 'temperature, humidity, illuminance, contact, pressure, battery, occupancy',
        fromZigbee: [
            fromZigbeeConverters.temperature,
            fromZigbeeConverters.humidity,
            fz.illuminance,
            fromZigbeeConverters.pressure,
            fromZigbeeConverters.battery,
            fromZigbeeConverters.diyruz_contact,
            fromZigbeeConverters.occupancy,
//            fz.occupancy_sensor_type,
        ],
        toZigbee: [
            tz.occupancy_timeout,
            toZigbeeConverters.factory_reset,
        ],
        meta: {
            configureKey: 1,
            multiEndpoint: true,
        },
        configure: async (device, coordinatorEndpoint) => {
            const firstEndpoint = device.getEndpoint(1);
            const secondEndpoint = device.getEndpoint(2);
            const thirdEndpoint = device.getEndpoint(3);
            const fourthEndpoint = device.getEndpoint(4);
            await bind(firstEndpoint, coordinatorEndpoint, [
                'genPowerCfg',
                'msTemperatureMeasurement',
                'msRelativeHumidity',
                'msPressureMeasurement',
                'msIlluminanceMeasurement',
            ]);
            await bind(secondEndpoint, coordinatorEndpoint, [
                'genOnOff',
            ]);
            await bind(thirdEndpoint, coordinatorEndpoint, [
                'msOccupancySensing',
            ]);
            await bind(fourthEndpoint, coordinatorEndpoint, [
                'msIlluminanceMeasurement',
            ]);

        const genPowerCfgPayload = [{
                attribute: 'batteryVoltage',
                minimumReportInterval: 0,
                maximumReportInterval: 3600,
                reportableChange: 0,
            },
            {
                attribute: 'batteryPercentageRemaining',
                minimumReportInterval: 0,
                maximumReportInterval: 3600,
                reportableChange: 0,
            }
        ];

        const msBindPayload = [{
            attribute: 'measuredValue',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 0,
        }];
        const msTemperatureBindPayload = [{
            attribute: 'measuredValue',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 0,
        }];
        const genOnOffBindPayload = [{
            attribute: 'onOff',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 0,
        }];
        const msOccupancySensingBindPayload = [{
            attribute: 'occupancy',
            minimumReportInterval: 0,
            maximumReportInterval: 3600,
            reportableChange: 0,
        }];

            await firstEndpoint.configureReporting('genPowerCfg', genPowerCfgPayload);
            await firstEndpoint.configureReporting('msTemperatureMeasurement', msTemperatureBindPayload);
            await firstEndpoint.configureReporting('msRelativeHumidity', msBindPayload);
            await firstEndpoint.configureReporting('msPressureMeasurement', msBindPayload);
            await firstEndpoint.configureReporting('msIlluminanceMeasurement', msBindPayload);
            await secondEndpoint.configureReporting('genOnOff', genOnOffBindPayload);
            await thirdEndpoint.configureReporting('msOccupancySensing', msOccupancySensingBindPayload);
            await fourthEndpoint.configureReporting('msIlluminanceMeasurement', msBindPayload);
        },
        exposes: [
            exposes.numeric('battery', ACCESS_STATE).withUnit('%').withDescription('Remaining battery in %').withValueMin(0).withValueMax(100),
            exposes.numeric('temperature_1', ACCESS_STATE).withUnit('°C').withDescription('Measured temperature value'), 
            exposes.numeric('humidity', ACCESS_STATE).withUnit('%').withDescription('Measured relative humidity'),
            exposes.numeric('pressure', ACCESS_STATE).withUnit('hPa').withDescription('The measured atmospheric pressure'),
            exposes.numeric('illuminance_1', ACCESS_STATE).withDescription('Raw measured illuminance LDR'), 
            exposes.numeric('illuminance_4', ACCESS_STATE).withUnit('lx').withDescription('Measured illuminance in lux BH1750'),
            exposes.binary('contact', ACCESS_STATE).withDescription('Indicates if the contact is closed (= true) or open (= false)'), 
            exposes.binary('occupancy', ACCESS_STATE).withDescription('Indicates whether the device detected occupancy'), 
//            exposes.numeric('occupancy_sensor_type', ACCESS_STATE).withDescription('occupancy_sensor_type'),
            exposes.numeric('occupancy_timeout', ACCESS_STATE | ACCESS_WRITE | ACCESS_READ).withUnit('sec').withDescription('Delay occupied to unoccupied + 10 sec adaptation'),
        ],
};

module.exports = device;