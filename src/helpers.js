const wrap = require('word-wrap');
const stringSimilarity = require('string-similarity');

const helpers = {
    formatSubtitleText: (text) => {
        let wrappedText = wrap(text, { width: 28, indent: '' });
        let subtitleText = Buffer.from(wrappedText).toString('base64');
        let replacedSlashText = subtitleText.replace(/\//g, '_');
        let replacedPlusText = replacedSlashText.replace(/\+/g, '-');

        return replacedPlusText;
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
                return reject(new Error('Subtitle with timestamp "' + timestamp + '" not found'));
            }
        });
    },
    checkOtherSubtitleMatches: (term, subtitles, chosenSubtitleIndex, requiredMatchScore = 0.2) => {
        let beforeSubtitle = subtitles[chosenSubtitleIndex - 1];
        let beforeMatch = stringSimilarity.compareTwoStrings(beforeSubtitle.Content.toLowerCase(), term);

        let afterSubtitle = subtitles[chosenSubtitleIndex + 1];
        let afterMatch = stringSimilarity.compareTwoStrings(afterSubtitle.Content.toLowerCase(), term);

        let toCombine = [subtitles[chosenSubtitleIndex]];

        if (beforeMatch > requiredMatchScore) {
            toCombine.unshift(beforeSubtitle);
        }

        if (afterMatch > requiredMatchScore) {
            toCombine.push(afterSubtitle);
        }

        if (toCombine.length > 1) {
            return helpers.combineSubtitles(toCombine);
        }

        return subtitles[chosenSubtitleIndex];
    },
    combineSubtitles: (subtitles) => {
        subtitles.sort((a, b) => a.StartTimestamp - b.StartTimestamp);

        let content = '';

        for (let i = 0; i < subtitles.length; i++) {
            content += subtitles[i].Content + ' ';
        }

        return {
            StartTimestamp: subtitles[0].StartTimestamp,
            EndTimestamp: subtitles[subtitles.length - 1].EndTimestamp,
            Content: content.trim()
        };
    }
}

module.exports = helpers;