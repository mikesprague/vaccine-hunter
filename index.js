const { makeApiCall, vaccineSpotterApi } = require('./lib/helpers');

require('dotenv').config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_NUMBER,
  YOUR_ZIP_CODE,
  YOUR_SMS_NUMBER,
} = process.env;

const sendVaccineNotification = async (locationData) => {
  const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  twilioClient.messages
    .create({
      body: `New vaccine appt(s) available at ${locationData.name}

${locationData.url}`,
      from: TWILIO_FROM_NUMBER,
      to: YOUR_SMS_NUMBER,
    })
    .then((message) => console.log(message.sid));
};

const checkForVaccineAppointments = async () => {
  const apiUrl = vaccineSpotterApi();
  const apiData = await makeApiCall(apiUrl);
  let localData = apiData.features.filter(
    (feat) => feat.properties.postal_code === YOUR_ZIP_CODE,
  );
  // console.log(JSON.stringify(localData, null, 2));
  localData = localData.map((record) => {
    const {
      provider_brand_name: providerBrandName,
      provider_brand: providerBrand,
      url,
      name,
      city,
      state,
      postal_code: zipCode,
      appointments,
      appointment_types: appointmentTypes,
      appointments_available: appointmentsAvailable,
      appointments_available_all_doses: appointmentsAvailableAllDoses,
      appointments_available_2nd_dose_only: appointmentsAvailableSecondDoseOnly,
      appointments_last_fetched: appointmentsLastFetched,
    } = record.properties;
    return {
      // providerBrand,
      providerBrandName,
      url,
      name,
      city,
      state,
      zipCode,
      appointmentsAvailable,
      appointments,
      // appointmentTypes,
      // appointmentsAvailableAllDoses,
      // appointmentsAvailableSecondDoseOnly,
      appointmentsLastFetched,
    };
  });

  const hasAppointments = localData.filter(
    (item) => Boolean(item.appointmentsAvailable) === true,
  );

  if (hasAppointments.length) {
    hasAppointments.forEach(async (location) => {
      await sendVaccineNotification(location);
      console.log(location);
    });
  } else {
    console.log('No appointments available');
  }
};

setInterval(async () => {
  await checkForVaccineAppointments();
}, 1 * 60 * 1000);
