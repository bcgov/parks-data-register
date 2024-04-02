import { input, checkbox, Separator } from '@inquirer/prompts';
import { readFile, writeFile } from 'fs/promises';

/** @type {Object} Questions for the user to answer. */
const questions = {
  endpoint: {
    message: 'Name of the endpoint',
    validate: (name) => typeof name === 'string' // Validates that the input is a string
  },
  endpointPath: {
    message: 'URI of the endpoint',
    validate: (name) => typeof name === 'string' // Validates that the input is a string
  },
  endpointDescription: {
    message: 'Description of the endpoint',
    validate: (name) => typeof name === 'string' // Validates that the input is a string
  },
  methods: {
    message: 'Select methods',
    choices: [
      { name: 'GET', value: 'GET' },
      { name: 'POST', value: 'POST' },
      { name: 'PUT', value: 'PUT' },
      { name: 'DELETE', value: 'DELETE' }
    ],
  },
  features: {
    message: 'Select layers',
    choices: [
      { name: 'BaseLayer', value: 'BaseLayer' },
      { name: 'AWSUtilsLayer', value: 'AWSUtilsLayer' }
    ],
  }
};

/**
 * Main function of the script.
 * @async
 */
async function run() {
  const endpoint = await input(questions.endpoint); // Prompt for the endpoint name
  const endpointPath = await input(questions.endpointPath); // Prompt for the endpoint URI
  const endpointDescription = await input(questions.endpointDescription); // Prompt for the endpoint description
  console.log('Endpoint name:', endpoint);
  console.log('Endpoint path:', endpointPath);
  console.log('Endpoint Description:', endpointDescription);
  const methods = await checkbox(questions.methods); // Prompt for the HTTP methods
  let result;

  for (const method of methods) {
    console.log("Method:", method);
    let templateData = await readFile('yaml.template', 'utf8'); // Read the YAML template

    result = await replaceInFile(templateData, "{ FunctionName }", endpoint); // Replace placeholders in the template
    result = await replaceInFile(result, "{ path }", endpointPath);
    result = await replaceInFile(result, "{ MethodName }", method);
    result = await replaceInFile(result, "{ Description }", endpointDescription);

    await writeFile(method + ".yaml", result, 'utf8'); // Write the result to a new YAML file
  }
};

/**
 * Replaces all occurrences of a placeholder in a string with a specified variable.
 * @param {string} data - The string to replace placeholders in.
 * @param {string} placeholder - The placeholder to replace.
 * @param {string} variable - The variable to replace the placeholder with.
 * @returns {Promise<string>} The string with placeholders replaced.
 * @async
 */
async function replaceInFile(data, placeholder, variable) {
  try {
    // Replace the placeholder with your variable
    return data.replace(new RegExp(placeholder, 'g'), variable);
  } catch (err) {
    console.log(err);
  }
}

run().then(() => {
  console.log('Stopping Script.');
});
