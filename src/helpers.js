const stringSimilarity = require('string-similarity');

const helpers = {
    getAppropriateSubtitle: (term, subtitles, timestamp) => {
        return new Promise((resolve, reject) => {
            let chosenSubtitle;
            let i = 0;

            for (; i < subtitles.length; i++) {
                if (subtitles[i].StartTimestamp < timestamp && subtitles[i].EndTimestamp > timestamp) {
                    chosenSubtitle = subtitles[i];
                    break;
                }
            }

            if (chosenSubtitle) {
                return resolve(chosenSubtitle);
            }

            return reject(new Error('Subtitle with timestamp "' + timestamp + '" not found'));
        });
    },
    checkOtherSubtitleMatches: (term, subtitles, chosenSubtitleIndex, requiredMatchScore = 0.22) => {
        let toCombine = [subtitles[chosenSubtitleIndex]];

        if (subtitles.length > 1 && chosenSubtitleIndex > 0) {
            let beforeSubtitle = subtitles[chosenSubtitleIndex - 1];
            let beforeMatch = stringSimilarity.compareTwoStrings(beforeSubtitle.Content.toLowerCase(), term);

            if (beforeMatch > requiredMatchScore) {
                toCombine.unshift(beforeSubtitle);
            }
        }

        if (subtitles.length > (chosenSubtitleIndex + 1)) {
            let afterSubtitle = subtitles[chosenSubtitleIndex + 1];
            let afterMatch = stringSimilarity.compareTwoStrings(afterSubtitle.Content.toLowerCase(), term);

            if (afterMatch > requiredMatchScore) {
                toCombine.push(afterSubtitle);
            }
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
            Content: content.trim(),
            Episode: subtitles[0].Episode,
        };
    }
}

module.exports = helpers;