const axios = require('axios').default;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { rando } = require('@nastyox/rando.js');
const randomColor = require('randomcolor');

const defaultTimezone = 'America/New_York';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(defaultTimezone);

exports.getRandomNum = (maxValue) => rando(maxValue - 1);

exports.getRandomColor = (options = {}) =>
  options.length ? randomColor(options) : randomColor();

exports.vaccineSpotterApi = (stateCode = 'NY') =>
    `https://www.vaccinespotter.org/api/v0/states/${stateCode}.json`;

exports.makeApiCall = async (
  apiEndpoint,
  requestMethod = 'GET',
  requestHeaders = null,
  requestBody = null,
) => {
  const axiosConfig = {};
  if (
    (requestMethod.toUpperCase() === 'POST' ||
      requestMethod.toUpperCase() === 'PUT') &&
    requestBody
  ) {
    axiosConfig.data = requestBody;
  }
  if (requestHeaders) {
    axiosConfig.headers = {
      ...requestHeaders,
    };
  }
  const apiData = await axios({
    url: `${apiEndpoint}`,
    method: `${requestMethod}`,
    ...axiosConfig,
  }).then((response) => response.data);
  return apiData;
};

