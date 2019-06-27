const expect = require('chai').expect;
const helpers = require('../../src/helpers');

describe('helpers', () => {
    describe('formatSubtitleText', () => {
        it('base64 encodes the text', () => {
            let text = 'text';
            let expectedText = 'dGV4dA==';
            
            let returnedText = helpers.formatSubtitleText(text);

            expect(returnedText).to.equal(expectedText);
        });

        it('adds line breaks in the text where appropriate', () => {
            let text = 'This is a long piece of text that needs to be split on to multiple lines';
            let expectedText = 'VGhpcyBpcyBhIGxvbmcgcGllY2Ugb2YgdGV4dCAKdGhhdCBuZWVkcyB0byBiZSBzcGxpdCBvbiB0byAKbXVsdGlwbGUgbGluZXM=';

            let returnedText = helpers.formatSubtitleText(text);

            expect(returnedText).to.equal(expectedText);
        });

        it('replaces all returned / symbols with _', () => {
            let text = '??????';
            let expectedText = 'Pz8_Pz8_';

            let returnedText = helpers.formatSubtitleText(text);

            expect(returnedText).to.equal(expectedText);
        });

        it('replaces all returned + symbols with -', () => {
            let text = '>>>>>>';
            let expectedText = 'Pj4-Pj4-';

            let returnedText = helpers.formatSubtitleText(text);

            expect(returnedText).to.equal(expectedText);
        });
    });

    describe('getAppropriateSubtitle', () => {
        it('resolves with the appropriate subtitle', async () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3 },
                { "StartTimestamp": 10, "EndTimestamp": 20 }
            ];
            let timestamp = 15;

            let result = await helpers.getAppropriateSubtitle(subtitles, timestamp);

            expect(result).to.equal(subtitles[1]);
        });

        it('rejects when a matching subtitle isn\'t found', (done) => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3 },
                { "StartTimestamp": 10, "EndTimestamp": 20 }
            ];
            let timestamp = 30;

            helpers.getAppropriateSubtitle(subtitles, timestamp)
                .then(() => done(new Error))
                .catch(err => {
                    expect(err.message).to.equal('Subtitle with timestamp "30" not found');
                    done();
                })
        });
    });

    describe('checkOtherSubtitleMatches', () => {

    });

    describe('combineSubtitles', () => {
        it('combines subtitles', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'This' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'is' },
                { "StartTimestamp": 20, "EndTimestamp": 50, Content: 'content!' }
            ];

            let result = helpers.combineSubtitles(subtitles);

            expect(result.StartTimestamp).to.equal(1);
            expect(result.EndTimestamp).to.equal(50);
            expect(result.Content).to.equal('This is content!');
        });
        it.only('orders subtitles before combining them', () => {
            let subtitles = [
                { "StartTimestamp": 20, "EndTimestamp": 50, Content: 'content!' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'is' },
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'This' },
                { "StartTimestamp": 50, "EndTimestamp": 150, Content: 'I think...' }
            ];

            let result = helpers.combineSubtitles(subtitles);

            expect(result.StartTimestamp).to.equal(1);
            expect(result.EndTimestamp).to.equal(150);
            expect(result.Content).to.equal('This is content! I think...');
        });
    });
});
