const wrap = require('word-wrap');

const helpers = {
    formatSubtitleText: (text) => {
        let wrappedText = wrap(text, { width: 28, indent: '' });
        let subtitleText = Buffer.from(wrappedText).toString('base64');
        let replacedSlashText = subtitleText.replace(/\//g, '_');
        let replacedPlusText = replacedSlashText.replace(/\+/g, '-');

        return replacedPlusText;
    }
}

module.exports = helpers;