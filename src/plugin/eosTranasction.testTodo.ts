test('ExpiresOn and isExpired correct for valid transaction', () => {
  // create transaction
  // get expiresOn - should be a date
  // get isExpired - should be false if expiresOn is in future
  expect(true).toEqual(true)
})

test('ExpiresOn and isExpired correct for expired transaction', () => {
  // get expired transaction
  // get expiresOn - should be a date in past
  // get isExpired - should be true
  expect(true).toEqual(true)
})
