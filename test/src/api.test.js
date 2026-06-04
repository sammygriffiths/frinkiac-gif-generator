const expect = require('chai').expect;
const sinon = require('sinon');
const api = require('../../src/api');
const config = require('../../config.json');

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

            let result = await api(axios, config).search('Unforgettable luncheon', config.urls.frinkiac);

            expect(result).to.equal(results[0]);
        });

        it('rejects with an error if no matches are found', (done) => {
            const axios = {
                get: sinon.stub().resolves({data: []})
            };

            api(axios, config).search('Unforgettable luncheon', config.urls.frinkiac)
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
            let startTimestamp = Number(timestamp) - 10000;
            let endTimestamp = Number(timestamp) + 10000;
            let expectedUrl = `https://frinkiac.com/api/episode/${episode}/${startTimestamp}/${endTimestamp}`;

            api(axios, config).getSubtitlesFromSearchResult({
                Episode: episode,
                Timestamp: timestamp
            }, config.urls.frinkiac);

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

            let result = await api(axios, config).getSubtitlesFromSearchResult({
                Episode: episode,
                Timestamp: timestamp
            }, config.urls.frinkiac);

            expect(result).to.equal(subtitles);
        });
    });
    describe('getGifFromSubtitle', () => {
        const subtitle = {
            Episode: 'S07E21',
            StartTimestamp: '1',
            EndTimestamp: '2',
            Content: ''
        };

        const expectedUrl = 'https://frinkiac.com/api/render/gif/stream';
        const expectedStreamParams = {
            episode: subtitle.Episode,
            start: subtitle.StartTimestamp,
            end: subtitle.EndTimestamp,
            overlays: [{
                text: subtitle.Content,
                x: 50,
                y: 97,
                font: 'akbar',
                size: 0,
                color: [255, 255, 255, 255],
                text_align: 'c',
                all_caps: true,
                start: 0,
                end: subtitle.EndTimestamp - subtitle.StartTimestamp
            }]
        };

        it('posts a cache-check render request', async () => {
            const axios = {
                post: sinon.stub().resolves({
                    data: {
                        cached: true,
                        url: '/video/S07E21/test.gif'
                    }
                })
            };

            await api(axios, config).getGifFromSubtitle(subtitle, config.urls.frinkiac);

            sinon.assert.calledOnce(axios.post);
            sinon.assert.calledWith(
                axios.post,
                expectedUrl,
                [{ ...expectedStreamParams, check_only: true }]
            );
        });

        it('resolves with cached gif URL when available', async () => {
            const axios = {
                post: sinon.stub().resolves({
                    data: {
                        cached: true,
                        url: '/video/S07E21/test.gif'
                    }
                })
            };

            let result = await api(axios, config).getGifFromSubtitle(subtitle, config.urls.frinkiac);

            expect(result).to.equal('https://frinkiac.com/video/S07E21/test.gif');
            sinon.assert.calledOnce(axios.post);
        });

        it('renders from stream and resolves gif URL when cache is missed', async () => {
            const axios = {
                post: sinon.stub()
                    .onFirstCall().resolves({
                        data: {
                            cached: false
                        }
                    })
                    .onSecondCall().resolves({
                        data: '{"progress":1}\n{"url":"/video/S07E21/streamed.gif"}'
                    })
            };

            let result = await api(axios, config).getGifFromSubtitle(subtitle, config.urls.frinkiac);

            expect(result).to.equal('https://frinkiac.com/video/S07E21/streamed.gif');
            sinon.assert.calledTwice(axios.post);
            sinon.assert.calledWith(axios.post.firstCall, expectedUrl, [{ ...expectedStreamParams, check_only: true }]);
            sinon.assert.calledWith(axios.post.secondCall, expectedUrl, [expectedStreamParams]);
        });

        it('rejects when render request fails', async () => {
            const axios = {
                post: sinon.stub().rejects(new Error('network error'))
            };

            try {
                await api(axios, config).getGifFromSubtitle(subtitle, config.urls.frinkiac);
                throw new Error('Expected getGifFromSubtitle to reject');
            } catch (err) {
                expect(err.message).to.equal('network error');
            }
        });
    });
    describe('generateGif', () => {
        it('gets the appropriate gif from frinkiac', async () => {
            let expectedUrl = 'https://frinkiac.com/video/S06E10/zJ24Xxa4Gfpjve910bB-GVezmp0=.gif';
            let term = 'we\'re through the looking glass';
            
            let result = await api(require('axios'), config).generateGif(term);

            expect(result).to.equal(expectedUrl);
        }).timeout(10000);

        it('gets the appropriate gif from frinkiac with multiple captions', async () => {
            let expectedUrl = 'https://frinkiac.com/video/S06E08/CXUO_0Mn1AupcjkdvINxh3hzaSQ=.gif';
            let term = "We'd ask you to come, but... You know...";

            let result = await api(require('axios'), config).generateGif(term);

            expect(result).to.equal(expectedUrl);
        }).timeout(10000);

        it('works with morbotron', async () => {
            let expectedUrl = 'https://morbotron.com/video/S02E14/gIN9gY11tD0r0NOL7VGTnvXaq0g=.gif';
            let term = "time makes fools of us all";

            let result = await api(require('axios'), config).generateGif(term, 'morbotron');

            expect(result).to.equal(expectedUrl);
        }).timeout(10000);

        it('rejects with an error if the site doesn\'t exist', (done) => {
            api({}, config).generateGif('term', 'wrong')
                .then(() => done(new Error))
                .catch(err => {
                    expect(err.message).to.equal('Site "wrong" not searchable');
                    done();
                });
        });
    });
});
