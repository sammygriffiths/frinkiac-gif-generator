const expect = require('chai').expect;
const api = require('../../../src/api');
const config = require('../../../config.json');

describe('Live API', () => {
    describe('generateGif', () => {
        it('gets the appropriate gif from frinkiac', async () => {
            let expectedUrl = 'https://frinkiac.com/video/S06E10/zJ24Xxa4Gfpjve910bB-GVezmp0=.gif';
            let term = 'we\'re through the looking glass';

            let result = await api(require('axios'), config).generateGif(term);

            expect(result).to.equal(expectedUrl);
        });

        it('works with morbotron', async () => {
            let expectedUrl = 'https://morbotron.com/video/S02E14/gIN9gY11tD0r0NOL7VGTnvXaq0g=.gif';
            let term = "time makes fools of us all";

            let result = await api(require('axios'), config).generateGif(term, 'morbotron');

            expect(result).to.equal(expectedUrl);
        });
    });
});
