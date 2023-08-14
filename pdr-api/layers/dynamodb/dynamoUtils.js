const TABLE_NAME = process.env.TABLE_NAME || 'pdr-main'

function test() {
  console.log('test');
}

module.exports = {
  TABLE_NAME,
  test
}