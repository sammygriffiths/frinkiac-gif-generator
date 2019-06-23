const expect = require('chai').expect;
const sinon = require('sinon');
const api = require('../../src/api');

describe('API', () => {
    describe('Search', () => {
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
    });
});
