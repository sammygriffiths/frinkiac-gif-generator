const wrap = require('word-wrap');

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
}

module.exports = helpers;