const helpers = require('./helpers');

module.exports = axios => {
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

                if (!Array.isArray(searchResponse.data) || !searchResponse.data.length) {
                    return reject(new Error('No results found for "'+term+'"'));
                }

                return resolve(searchResponse.data[0]);
            });
        },
        getSubtitlesFromSearchResult: result => {
            let subtitleResponse;
            let episode = result.Episode;
            let timestamp = result.Timestamp;
            let startTimestamp = Number(timestamp) - 10000;
            let endTimestamp = Number(timestamp) + 10000;

            return new Promise(async (resolve, reject) => {
                try {
                    let url = `https://frinkiac.com/api/episode/${episode}/${startTimestamp}/${endTimestamp}`;
                    subtitleResponse = await axios.get(url);
                } catch (err) {
                    return reject(err);
                }

                return resolve(subtitleResponse.data.Subtitles);
            })
        },
        getGifFromSubtitle: subtitle => {
            let gif;
            let subtitleText = helpers.formatSubtitleText(subtitle.Content);

            return new Promise(async (resolve, reject) => {
                try {
                    gif = await axios.get('https://frinkiac.com/gif/' + subtitle.Episode + '/' + subtitle.StartTimestamp + '/' + subtitle.EndTimestamp + '.gif?b64lines=' + subtitleText);
                } catch (err) {
                    return reject(err);
                }

                return resolve(gif.request.res.responseUrl);
            });
        },
        generateGif: term => {
            let gif;

            return new Promise(async (resolve, reject) => {
                try {
                    let searchResult = await api.search(term);
                    let subtitles = await api.getSubtitlesFromSearchResult(searchResult);
                    let chosenSubtitle = await helpers.getAppropriateSubtitle(term, subtitles, searchResult.Timestamp);
                    gif = await api.getGifFromSubtitle(chosenSubtitle);
                } catch (err) {
                    return reject(err);
                }

                return resolve(gif);
            });
        }
    }

    return api;
}
