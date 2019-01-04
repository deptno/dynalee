import {dynamodbDoc} from './dynamodb-document'

describe('util', function () {
  describe('cleanDoc', function () {
    it('should omit empty values', function () {
      const params = {
        validValue    : 0,
        validString   : '1',
        validSet      : new Set([1]),
        validList     : [1],
        emptyString   : '',
        emptySet      : new Set(),
        validEmptyList: [],
        undefined     : undefined,
        null          : null,
      }
      expect(dynamodbDoc(params, Array.from)).toEqual({
        validValue    : 0,
        validString   : '1',
        validSet      : [1],
        validList     : [1],
        validEmptyList: [],
      })
    })
  })
  it('should not put at dynamodb local', function () {
    const params = {
      validValue    : 0,
      validEmptyList: [],
      emptyString   : '',
      emptySet      : new Set(),
      undefined     : undefined,
      null          : null,
    }
    expect(dynamodbDoc(params)).toEqual({validValue: 0, validEmptyList: []})
  })
  it('should care nested object', function () {
    const params = {
      nested: {
        validValue    : 0,
        validEmptyList: [],
        emptyString   : '',
        emptySet      : new Set(),
        undefined     : undefined,
        null          : null,
      }
    }
    expect(dynamodbDoc(params)).toEqual({nested: {validValue: 0, validEmptyList: []}})
  })
  it('resume', () => {
    const resume = {
      profile     :
        {
          name    : 'aaa',
          job     : '',
          picture : '',
          email   : '',
          phone   : '',
          website : '',
          summary : 'aa',
          location:
            {
              address    : '',
              address2   : '',
              city       : '',
              country    : '',
              countryCode: '',
              postalCode : ''
            },
          profiles: [{}, {}, {name: 'Github', url: 'https://a.com'}, {}]
        },
      experiences :
        [{
          startDate : '33',
          endDate   : '33',
          summary   : '3',
          highlights:
            [{tags: [], links: []},
              {
                startDate: 'bb',
                highlight: '33',
                tags     : ['', '11'],
                links    : ['']
              }]
        }],
      skills      :
        [{skills: ['', '']},
          {skills: []},
          {category: '33', skills: []}],
      education   : [],
      awards      : [],
      certificates: ['32'],
      languages   : []
    }
    const expected = {
      profile     :
        {
          name    : 'aaa',
          summary : 'aa',
          location:
            {
            },
          profiles: [{}, {}, {name: 'Github', url: 'https://a.com'}, {}]
        },
      experiences :
        [{
          startDate : '33',
          endDate   : '33',
          summary   : '3',
          highlights:
            [{tags: [], links: []},
              {
                startDate: 'bb',
                highlight: '33',
                tags     : ['11'],
                links    : []
              }]
        }],
      skills      :
        [{skills: []},
          {skills: []},
          {category: '33', skills: []}],
      education   : [],
      awards      : [],
      certificates: ['32'],
      languages   : []
    }
    expect(dynamodbDoc(resume)).toEqual(expected)
  })
})