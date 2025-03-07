const SITE_MAIN_SK = 'Details';

const MINOR_UPDATE_TYPE = 'minor';
const MAJOR_UPDATE_TYPE = 'major';
const REPEAL_UPDATE_TYPE = 'repeal';
const UPDATE_TYPES = [
  MAJOR_UPDATE_TYPE,
  MINOR_UPDATE_TYPE,
  REPEAL_UPDATE_TYPE
];

const ESTABLISHED_STATE = 'established';
const HISTORICAL_STATE = 'historical';
const REPEALED_STATE = 'repealed';

const MANDATORY_PUT_FIELDS = [
  'effectiveDate',
  'lastVersionDate'
];

const OPTIONAL_PUT_FIELDS = [
  'audioClip',
  'displayName',
  'legalName',
  'notes',
  'phoneticName',
  'searchTerms'
];


// Acceptible PUT fields for fees
const FEES_OPTIONAL_PUT_FIELDS = [
  'Night',
  'Day',
  'Use',
  'Week',
  'Year',
  'Trip',
  'DirectionOfTrip',
  'Days28'
];

module.exports = {
  ESTABLISHED_STATE,
  HISTORICAL_STATE,
  MAJOR_UPDATE_TYPE,
  MANDATORY_PUT_FIELDS,
  MINOR_UPDATE_TYPE,
  OPTIONAL_PUT_FIELDS,
  REPEAL_UPDATE_TYPE,
  REPEALED_STATE,
  SITE_MAIN_SK,
  UPDATE_TYPES,
  FEES_OPTIONAL_PUT_FIELDS
}
