const expect = require('chai').expect;
const sinon = require('sinon');
const api = require('../../src/api');

describe('API', () => {
    describe('search', () => {
        it('returns the closest match', async () => {
            const results = [
                {"Id":963130,"Episode":"S07E21","Timestamp":493041},
                {"Id":963144,"Episode":"S07E21","Timestamp":495210},
                {"Id":963143,"Episode":"S07E21","Timestamp":494543}
            ];
            const axios = {
                get: sinon.stub().resolves({data: results})
            };

            let result = await api(axios).search('Unforgettable luncheon');

            expect(result).to.equal(results[0]);
        });

        it('rejects with an error if no matches are found', (done) => {
            const axios = {
                get: sinon.stub().resolves({data: []})
            };

            api(axios).search('Unforgettable luncheon')
                .then(() => done(new Error))
                .catch(err => {
                    expect(err.message).to.equal('No results found for "Unforgettable luncheon"');
                    done();
                })
        });
    });
    describe('getSubtitlesFromSearchResult', () => {
        it('gets subtitles from frinkiac', () => {
            const axios = {
                get: sinon.stub().resolves({data: []})
            }
            let episode = 'S07E21';
            let timestamp = '493041';
            let expectedUrl = 'https://frinkiac.com/api/caption?e=' + episode + '&t=' + timestamp

            api(axios).getSubtitlesFromSearchResult({
                Episode: episode,
                Timestamp: timestamp
            });

            sinon.assert.calledWith(axios.get, expectedUrl);
        });

        it('resolves with subtitles', async () => {
            let episode = 'S07E21';
            let timestamp = '493041';
            let subtitles = [
                { "Id": 74059, "RepresentativeTimestamp": 491707, "Episode": "S07E21", "StartTimestamp": 490934, "EndTimestamp": 492834, "Content": "Superintendent Chalmers, welcome.", "Language": "en" },
                { "Id": 74060, "RepresentativeTimestamp": 494042, "Episode": "S07E21", "StartTimestamp": 492834, "EndTimestamp": 495567, "Content": "I hope you're prepared for an unforgettable luncheon.", "Language": "en" }
            ];

            const axios = {
                get: sinon.stub().resolves({
                    data: {
                        Subtitles: subtitles
                    }
                })
            }

            let result = await api(axios).getSubtitlesFromSearchResult({
                Episode: episode,
                Timestamp: timestamp
            });

            expect(result).to.equal(subtitles);
        })
    });
});
