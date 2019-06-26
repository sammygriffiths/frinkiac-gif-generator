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
});
