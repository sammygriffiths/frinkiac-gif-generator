const helpers = require('./helpers');

module.exports = (axios, config) => {
    const api = {
        search: (term, url) => {
            let query = encodeURIComponent(term);
            let searchResponse;

            return new Promise(async (resolve, reject) => {
                try {
                    searchResponse = await axios.get(`https://${url}/api/search?q=${query}`);
                } catch (err) {
                    return reject(err);
                }

                if (!Array.isArray(searchResponse.data) || !searchResponse.data.length) {
                    return reject(new Error('No results found for "'+term+'"'));
                }

                return resolve(searchResponse.data[0]);
            });
        },
        getSubtitlesFromSearchResult: (result, url) => {
            let subtitleResponse;
            let episode = result.Episode;
            let timestamp = result.Timestamp;
            let startTimestamp = Number(timestamp) - 10000;
            let endTimestamp = Number(timestamp) + 10000;

            return new Promise(async (resolve, reject) => {
                try {
                    let fullUrl = `https://${url}/api/episode/${episode}/${startTimestamp}/${endTimestamp}`;
                    subtitleResponse = await axios.get(fullUrl);
                } catch (err) {
                    return reject(err);
                }

                return resolve(subtitleResponse.data.Subtitles);
            })
        },
        getGifFromSubtitle: (subtitle, url) => {
            let gif;
            let subtitleText = helpers.formatSubtitleText(subtitle.Content);

            return new Promise(async (resolve, reject) => {
                try {
                    gif = await axios.get(`https://${url}/gif/${subtitle.Episode}/${subtitle.StartTimestamp}/${subtitle.EndTimestamp}.gif?b64lines=${subtitleText}`);
                } catch (err) {
                    return reject(err);
                }

                return resolve(gif.request.res.responseUrl);
            });
        },
        generateGif: (term, site = 'frinkiac') => {
            let gif;
            
            return new Promise(async (resolve, reject) => {
                let url = config.urls[site];

                if (typeof url === 'undefined') {
                    return reject(new Error(`Site "${site}" not searchable`));
                }
                
                try {
                    let searchResult = await api.search(term, url);
                    let subtitles = await api.getSubtitlesFromSearchResult(searchResult, url);
                    let chosenSubtitle = await helpers.getAppropriateSubtitle(term, subtitles, searchResult.Timestamp);
                    gif = await api.getGifFromSubtitle(chosenSubtitle, url);
                } catch (err) {
                    return reject(err);
                }

                return resolve(gif);
            });
        }
    }

    return api;
}
