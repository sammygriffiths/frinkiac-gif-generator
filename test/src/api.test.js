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
            };
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
            };

            let result = await api(axios).getSubtitlesFromSearchResult({
                Episode: episode,
                Timestamp: timestamp
            });

            expect(result).to.equal(subtitles);
        })
    });
    describe('getAppropriateSubtitle', () => {
        it('resolves with the appropriate subtitle', async () => {
            let subtitles = [
                {"StartTimestamp": 1, "EndTimestamp": 3},
                {"StartTimestamp": 10, "EndTimestamp": 20}
            ];
            let timestamp = 15;

            let result = await api({}).getAppropriateSubtitle(subtitles, timestamp);

            expect(result).to.equal(subtitles[1]);
        });

        it('rejects when a matching subtitle isn\'t found', (done) => {
            let subtitles = [
                {"StartTimestamp": 1, "EndTimestamp": 3},
                {"StartTimestamp": 10, "EndTimestamp": 20}
            ];
            let timestamp = 30;

            api({}).getAppropriateSubtitle(subtitles, timestamp)
                .then(() => done(new Error))
                .catch(err => {
                    expect(err.message).to.equal('Subtitle with timestamp "30" not found');
                    done();
                })
        });
    });
    describe('getGifFromSubtitle', () => {
        it('gets gif url from frinkiac', () => {
            let subtitle = {
                Episode: 'S07E21',
                StartTimestamp: '1',
                EndTimestamp: '2',
                Content: ''
            };
            let expectedUrl = 'https://frinkiac.com/gif/S07E21/1/2.gif?b64lines=';

            const axios = {
                get: sinon.stub().resolves({
                    request: {
                        res: {
                            responseUrl: 'gif'
                        }
                    }
                })
            };

            api(axios).getGifFromSubtitle(subtitle);

            sinon.assert.calledWith(axios.get, expectedUrl);
        });

        it('base64 encodes the text', () => {
            let subtitle = {
                Episode: 'S07E21',
                StartTimestamp: '1',
                EndTimestamp: '2',
                Content: 'text'
            };

            let expectedUrl = 'https://frinkiac.com/gif/S07E21/1/2.gif?b64lines=dGV4dA==';

            const axios = {
                get: sinon.stub().resolves({
                    request: {
                        res: {
                            responseUrl: 'gif'
                        }
                    }
                })
            };

            api(axios).getGifFromSubtitle(subtitle);

            sinon.assert.calledWith(axios.get, expectedUrl);
        });

        it('adds line breaks in the text where appropriate', () => {
            let text = 'This is a long piece of text that needs to be split on to multiple lines';
            let subtitle = {
                Episode: 'S07E21',
                StartTimestamp: '1',
                EndTimestamp: '2',
                Content: text
            };

            let expectedText = 'VGhpcyBpcyBhIGxvbmcgcGllY2Ugb2YgdGV4dCAKdGhhdCBuZWVkcyB0byBiZSBzcGxpdCBvbiB0byAKbXVsdGlwbGUgbGluZXM=';
            let expectedUrl = 'https://frinkiac.com/gif/S07E21/1/2.gif?b64lines=' + expectedText;

            const axios = {
                get: sinon.stub().resolves({
                    request: {
                        res: {
                            responseUrl: 'gif'
                        }
                    }
                })
            };

            api(axios).getGifFromSubtitle(subtitle);

            sinon.assert.calledWith(axios.get, expectedUrl);
        });

        it('resolves with a gif URL', async () => {
            let subtitle = {
                Episode: 'S07E21',
                StartTimestamp: '1',
                EndTimestamp: '2',
                Content: ''
            };
            let expectedReturn = 'http://www.url.com/simpsons.gif';

            const axios = {
                get: sinon.stub().resolves({
                    request: {
                        res: {
                            responseUrl: expectedReturn
                        }
                    }
                })
            };

            let result = await api(axios).getGifFromSubtitle(subtitle);

            expect(result).to.equal(expectedReturn);
        });
    });
    describe('generateGif', () => {
        it('gets the appropriate gif from frinkiac', async () => {
            let expectedUrl = 'https://frinkiac.com/video/S10E07/MI9Rd6R0gNkiZnr2cFb_wA8vC3k=.gif';
            let term = 'super nintendo chalmers';
            
            let result = await api(require('axios')).generateGif(term);

            expect(result).to.equal(expectedUrl);
        }).timeout(10000);
    });
});
