import { DynamoDBClient, PutItemCommand} from '@aws-sdk/client-dynamodb';
import inquirer from 'inquirer';
const TABLE_NAME = "NameRegister";
import { marshall } from '@aws-sdk/util-dynamodb';

const dynamodb = new DynamoDBClient({});

/**
 * Add a park name to the database.
 *
 * Import the credentials from the correct AWS LZ before running.
 */

// Questions
const q_orcs = {
  type: "number",
  name: "parkOrcs",
  message: "Enter park orcs WITH leading zeroes.",
};

const q_legalName = {
  type: "input",
  name: "legalName",
  message: "Enter/paste the park legal name.",
};

const q_doesDisplayNameDiffer = {
  type: "confirm",
  name: "doesDisplayNameDiffer",
  message: "Does the display name differ from the legal name?",
  default: false,
};

const q_displayName = {
  type: "input",
  name: "displayName",
  message: "Enter/paste the park display name.",
};

const q_hasPhoneticName = {
  type: "confirm",
  name: "hasPhoneticName",
  message: "Does the park have a phonetic name?",
  default: false,
};

const q_phoneticName = {
  type: "input",
  name: "phoneticName",
  message: "Enter/paste the park phonetic name.",
};

const q_effectiveDate = {
  type: "input",
  name: "effectiveDate",
  message: "Enter the effective date of the park name. (YYYY-MM-DD)",
};

const q_status = {
  type: "list",
  name: "status",
  message: "Select the status of the park name.",
  choices: ["established", "repealed"],
  default: "established",
};

const q_confirm = {
  type: "confirm",
  name: "confirm",
  message: "Does the data look correct?",
  default: false,
};

async function askQuestion(question) {
  try {
    const answers = await inquirer.prompt(question);
    return answers[question.name];
  } catch (error) {
    console.log(error);
  }
}

async function run() {
  // Collect information
  console.log('Add a park name to the database.');
  let data = {
    parkOrcs: await askQuestion(q_orcs),
    legalName: await askQuestion(q_legalName),
  };
  const doesDisplayNameDiffer = await askQuestion(q_doesDisplayNameDiffer);
  data["displayName"] = data.legalName;
  if (doesDisplayNameDiffer) {
    data.displayName = await askQuestion(q_displayName);
  }
  const hasPhoneticName = await askQuestion(q_hasPhoneticName);
  data['phoneticName'] = null;
  if (hasPhoneticName) {
    data.phoneticName = await askQuestion(q_phoneticName);
  }
  data['effectiveDate'] = await askQuestion(q_effectiveDate);
  data['status'] = await askQuestion(q_status);

  const date = new Date().toISOString();

  const putItem = {
    pk: `${Number(data.parkOrcs)}`,
    sk: 'Details',
    audioClip: null,
    displayId: `${data.parkOrcs}`,
    displayName: data.displayName,
    effectiveDate: data.effectiveDate,
    legalName: data.legalName,
    phoneticName: data.phoneticName,
    status: data.status,
    notes: null,
    type: 'protectedArea',
    createDate: date,
    updateDate: date
  }
  console.log(putItem);

  const confirm = await askQuestion(q_confirm);
  if (!confirm) {
    console.log('Exiting...');
    return;
  }

  // Write to the database
  try {
    const input = {
      TableName: TABLE_NAME,
      Item: marshall(putItem),
      ConditionExpression: 'attribute_not_exists(pk)',
    };
    const command = new PutItemCommand(input);
    let res = await dynamodb.send(command);
    console.log('Added park name to database:', res);
  } catch (error) {
    console.log('error:', error);
  }

}

run();