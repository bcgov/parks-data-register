const AWS = require('aws-sdk');
const csv = require('csvtojson');
const { DateTime } = require('luxon');

// These are taken from the Parks Name xslx file and map to the related named sheet.
const bcParkNamesPath = './BC Parks Names.csv';
const parParksPath = './PAR-Parks.csv';

const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const TIMEZONE = 'America/Vancouver';

const options = {
  region: 'ca-central-1'
};

if (process.env.IS_OFFLINE) {
  options.endpoint = 'http://localhost:8000';
}

const dynamodb = new AWS.DynamoDB(options);

async function run() {
  const bcParksNames = await csv().fromFile(bcParkNamesPath);
  let parParks = await csv().fromFile(parParksPath);

  console.log('Data Load');
  console.log(`Loading ${bcParksNames.length} items.`);

  const currentPSTDateTime = DateTime.now().setZone(TIMEZONE);
  const currentTimeISO = currentPSTDateTime.toUTC().toISO();
  let i =1;
  for (let record of bcParksNames) {
    if (i % 100 == 0 && i != 0) {
      process.stdout.write(`${i}\r\n`);
    } else {
      process.stdout.write('.');
    }
    i++;
    // establishedDate:
    const res = getEstablishedDate(record, parParks);
    const establishedDate = res[0];
    parParks = res[1];

    // createDate:
    // Check if record already exists
    const existingRecord = AWS.DynamoDB.Converter.unmarshall(await getOne(record.orcs, 'Details'));
    // Get createDate if it does
    const createDate = existingRecord && existingRecord.createDate ? existingRecord.createDate : currentTimeISO;

    let updateParams = {
      TableName: TABLE_NAME,
      Key: {
        pk: { S: record.orcs },
        sk: { S: 'Details' }
      },
      ExpressionAttributeValues: {
        ':createDate': { S: createDate },
        ':updateDate': { S: currentTimeISO },
        ':effectiveDate': { S: establishedDate },
        ':legalName': { S: record.legalName },
        ':displayName': { S: record.displayName },
        ':phoneticName': { S: record.phoneticName },
        ':status': { S: 'established' },
        ':notes': { S: record['validation note'] },
        ':type': { S: 'protectedArea'}
      },
      ExpressionAttributeNames: { '#status': 'status', '#type': 'type' },
      UpdateExpression:
        'SET createDate = :createDate, updateDate = :updateDate, effectiveDate = :effectiveDate, legalName = :legalName, displayName = :displayName, phoneticName = :phoneticName, #status = :status, notes = :notes', '#type': 'type',
      ReturnValues: 'ALL_NEW'
    };

    try {
      await dynamodb.updateItem(updateParams).promise();
    } catch (error) {
      console.log('Error:', error);
      console.log(updateParams);
    }
  }
  process.stdout.write(`${i-1}\r\n`);
  console.log('Data load complete.');
}

function getEstablishedDate(record, parParks) {
  // Get established date for effective date field.
  let establishedDate = '';
  let i = parParks.length;
  while (i--) {
    if (record.orcs === parParks[i].ORCS) {
      establishedDate = parParks[i]['Established Date'] ? parParks[i]['Established Date'] : '';
      parParks.splice(i, 1);
      i = 0;
    }
  }
  return [establishedDate, parParks];
}

async function getOne(pk, sk) {
  const params = {
    TableName: TABLE_NAME,
    Key: AWS.DynamoDB.Converter.marshall({ pk, sk })
  };
  let item = await dynamodb.getItem(params).promise();
  return item?.Item || {};
}

run();
