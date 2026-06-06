const expect = require('chai').expect;
const helpers = require('../../src/helpers');

describe('helpers', () => {
    describe('getAppropriateSubtitle', () => {
        it('resolves with the appropriate subtitle', async () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'no' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'content' }
            ];
            let timestamp = 15;

            let result = await helpers.getAppropriateSubtitle('Content', subtitles, timestamp);

            expect(result).to.equal(subtitles[1]);
        });

        it('rejects when a matching subtitle isn\'t found', (done) => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: "nope" },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: "no" }
            ];
            let timestamp = 30;

            helpers.getAppropriateSubtitle('', subtitles, timestamp)
                .then(() => done(new Error))
                .catch(err => {
                    expect(err.message).to.equal('Subtitle with timestamp "30" not found');
                    done();
                })
        });
    });

    describe('checkOtherSubtitleMatches', () => {
        it('adds in the previous subtitle if it has a high match', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'This' },
                { "StartTimestamp": 3, "EndTimestamp": 10, Content: 'is content!' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'Nope' },
            ];
            let term = 'This';

            let result = helpers.checkOtherSubtitleMatches(term, subtitles, 1);

            expect(result.StartTimestamp).to.equal(1);
            expect(result.EndTimestamp).to.equal(10);
            expect(result.Content).to.equal('This is content!');
        });

        it('adds in the next subtitle if it has a high match', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'Nope' },
                { "StartTimestamp": 3, "EndTimestamp": 10, Content: 'This' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'is content!' },
            ];
            let term = 'is content!';

            let result = helpers.checkOtherSubtitleMatches(term, subtitles, 1);

            expect(result.StartTimestamp).to.equal(3);
            expect(result.EndTimestamp).to.equal(20);
            expect(result.Content).to.equal('This is content!');
        });

        it('adds in both subtitles if they have high matches', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'This' },
                { "StartTimestamp": 3, "EndTimestamp": 10, Content: 'is' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'content!' },
            ];
            let term = 'This is content!';

            let result = helpers.checkOtherSubtitleMatches(term, subtitles, 1);

            expect(result.StartTimestamp).to.equal(1);
            expect(result.EndTimestamp).to.equal(20);
            expect(result.Content).to.equal('This is content!');
        });

        it('doesn\'t add in any extra subtitles if there are no matches', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'Not this' },
                { "StartTimestamp": 3, "EndTimestamp": 10, Content: 'This is content!' },
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'Not this either' },
            ];
            let term = 'Search term';

            let result = helpers.checkOtherSubtitleMatches(term, subtitles, 1);

            expect(result.StartTimestamp).to.equal(3);
            expect(result.EndTimestamp).to.equal(10);
            expect(result.Content).to.equal('This is content!');
        });
    });

    describe('combineSubtitles', () => {
        it('combines subtitles', () => {
            let subtitles = [
                { "StartTimestamp": 1, "EndTimestamp": 3, Content: 'This', Episode: 's01e01'},
                { "StartTimestamp": 10, "EndTimestamp": 20, Content: 'is', Episode: 's01e01' },
                { "StartTimestamp": 20, "EndTimestamp": 50, Content: 'content!', Episode: 's01e01' }
            ];

            let result = helpers.combineSubtitles(subtitles);

            expect(result.StartTimestamp).to.equal(1);
            expect(result.EndTimestamp).to.equal(50);
            expect(result.Content).to.equal('This is content!');
            expect(result.Episode).to.equal('s01e01');
        });
        it('orders subtitles before combining them', () => {
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
