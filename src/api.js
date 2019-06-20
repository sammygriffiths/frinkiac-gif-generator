const axios = require('axios');

const api = {
    search: term => {
        let query = encodeURIComponent(term);
        let searchResponse;

        return new Promise(async (resolve, reject) => {
            try {
                searchResponse = await axios.get('https://frinkiac.com/api/search?q=' + query);
            } catch (err) {
                return reject(err);
            }

            return resolve(searchResponse.data[0]);
        });
    },
    getSubtitlesFromSearchResult: result => {
        let subtitleResponse;

        return new Promise(async (resolve, reject) => {
            try {
                subtitleResponse = await axios.get('https://frinkiac.com/api/caption?e=' + result.Episode + '&t=' + result.Timestamp);
            } catch (err) {
                return reject(err);
            }

            return resolve(subtitleResponse.data.Subtitles);
        })
    },
    getAppropriateSubtitle: (subtitles, timestamp) => {
        return new Promise((resolve, reject) => {
            let chosenSubtitle;

            for (let i = 0; i < subtitles.length; i++) {
                if (subtitles[i].StartTimestamp < timestamp && subtitles[i].EndTimestamp > timestamp) {
                    chosenSubtitle = subtitles[i];
                    break;
                }
            }

            if (chosenSubtitle) {
                return resolve(chosenSubtitle);
            } else {
                return reject(new Error('Subtitle with timestamp "'+timestamp+'" not found'));
            }
        });
    },
    getGifFromSubtitle: subtitle => {
        let gif;
        let subtitleText = Buffer.from(subtitle.Content).toString('base64');

        return new Promise(async (resolve, reject) => {
            try {
                gif = await axios.get('https://frinkiac.com/gif/' + subtitle.Episode + '/' + subtitle.StartTimestamp + '/' + subtitle.EndTimestamp + '.gif?b64lines=' + subtitleText);
            } catch (err) {
                return reject(err);
            }

            return resolve(gif.request.res.responseUrl);
        });
    }
}

module.exports = term => {
    let gif;

    return new Promise(async (resolve, reject) => {
        try {
            let searchResult = await api.search(term);
            let subtitles = await api.getSubtitlesFromSearchResult(searchResult);
            let chosenSubtitle = await api.getAppropriateSubtitle(subtitles, searchResult.Timestamp);
            gif = await api.getGifFromSubtitle(chosenSubtitle);
        } catch (err) {
            return reject(err);
        }

        return resolve(gif);
    });
};
