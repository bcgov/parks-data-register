const readXlsxFile = require('read-excel-file/node');
const fs = require('fs');
// const filePath = "./feereg.csv"
const {
    PutItemCommand,
    DynamoDBClient
  } = require('@aws-sdk/client-dynamodb');
const {
    marshall
} = require ('@aws-sdk/util-dynamodb');
const { Organizations } = require('aws-sdk');
const TABLE_NAME = process.env.TABLE_NAME || 'NameRegister';
const REGION = 'ca-central-1'; 
const IS_OFFLINE = "TRUE"
const DYNAMODB_ENDPOINT_URL = process.env.DYNAMODB_ENDPOINT_URL || 'http://172.17.0.17:8000';
const options = {
    region: REGION,
    endpoint: DYNAMODB_ENDPOINT_URL
  };


  if (IS_OFFLINE === 'True') {
    options.endpoint = 'http://172.17.0.17:8000';
  }
  const dynamoClient = new DynamoDBClient(options);
let errorList = [];
let errorCount = 0;
const schema = {
  'pk': {
    prop: 'pk',
    type: String
  },
  'sk': {
    prop: 'sk',
    type: String
  },
  'ORCS':{
    prop: 'ORCS',
    type: String
  },
  'parkFeature': {
    prop: 'parkFeature',
    type: String
  },
  'activity': {
    prop: 'activity',
    type: String
  },
  'billingBy': {
    prop: 'billingBy',
    type: String
  },
  'night': {
    prop: 'night',
    type: String
  },
  'day': {
    prop: 'day',
    type: String
  },
  'use': {
    prop: 'use',
    type: String
  },
  'week': {
    prop: 'week',
    type: String
  },
  'year': {
    prop: 'year',
    type: String
  },
  'trip': {
    prop: 'trip',
    type: String
  },
  'directionOfTrip': {
    prop: 'directionOfTrip',
    type: String
  },
  'days28': {
    prop: 'days28',
    type: String
  }
}

async function doMigration(filePath) {
 
  console.log('path:', process.cwd())
  console.log('filePath:', filePath);
  try{




    let { rows, errors } = await readXlsxFile(filePath, { schema, sheet: 'feereg' });

    for (const row of rows) {
      process.stdout.write('.');

      // 1. Add the fee record
      let feeRecord ={
          pk: row['pk'],
          sk: row['sk']
      }

      const availableFields = Object.keys(row);
      const validFeeFields = ['night', 'day', 'use', 'week', 'year', 'trip', 'directionOfTrip', 'days28', 'parkFeature', 'activity', 'billingBy', 'ORCS'];

      validFeeFields.forEach((field) => {
          if (availableFields.includes(field) && row[field] !== undefined) {
              feeRecord[field.replace(/\s+/g, '')] = row[field];
          }
      });

      console.log("Processed Fee Record:", feeRecord);

      if (!(await putItem(feeRecord))) {
          console.log("There was an issue loading the fee for:", row[pk] + row[sk]);
      }
    }
    return rows.length;
  }catch(error){
    console.log(error);
  }
  console.log("Errors: ", errorList)
  console.log("Error Count: ", errorCount)
}

async function putItem(record) {
  let putObject = {};
    putObject = {
      TableName: TABLE_NAME,
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
      Item: marshall(record)
    }
  

  try {
    let putCommand = new PutItemCommand(putObject);
    let res = await dynamoClient.send(putCommand);
    return true;
  } catch (err) {
    console.log("There was an issue on line 128 loading fee: ", record.pk + record.sk)
    console.log("Error: ", err)
    errorList.push(`pk: ${record.pk} , sk:${record.sk} error: ${err}`)
    errorCount++
    return false;
  }
}

doMigration('feereg2.xlsx')

