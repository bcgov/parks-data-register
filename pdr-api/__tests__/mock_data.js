exports.MockData = class {
  // For tests.
  mockConfig = {
    pk: 'config',
    sk: 'config'
  };
  mockCurrentParkName1 = {
    pk: '1',
    sk: 'Details',
    createDate: '2019-08-10T16:15:50.868Z',
    updateDate: '2023-08-10T16:11:54.513Z',
    legalName: 'Test Park 1',
    displayName: 'Test Park 1',
    phoneticName: 'tɛst pɑːk wʌn',
    status: 'current',
    notes: 'some notes'
  };
  mockOldParkName1 = {
    pk: '1',
    sk: '2019-08-10T16:15:50.868Z',
    legalName: 'Old Park 1',
    displayName: 'Old Park 1',
    phoneticName: 'əʊld pɑːk wʌn',
    status: 'old',
    notes: 'some notes'
  };
  mockCurrentParkName2 = {
    pk: '2',
    sk: 'Details',
    createDate: '2023-08-10T16:11:54.513Z',
    updateDate: '2023-08-10T16:11:54.513Z',
    legalName: 'Test Park 2',
    displayName: 'Test Park 2',
    phoneticName: 'tɛst pɑːk tuː',
    status: 'current',
    notes: 'some notes'
  };

  allData = () => {
    return [
      this.mockConfig,
      this.mockCurrentParkName1,
      this.mockCurrentParkName2,
      this.mockOldParkName1
    ]
  }
}
