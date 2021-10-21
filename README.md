[![Build Status](https://github.com/sammygriffiths/frinkiac-gif-generator/workflows/build/badge.svg)](https://github.com/sammygriffiths/frinkiac-gif-generator/actions)

# Frinkiac GIF Generator
An un-official package for auto-generating gifs from frinkiac.com, morbotron.com or masterofallscience.com based on a search term.

## Installing
`npm install --save frinkiac-gif-generator`

## Usage
This package uses frinkiac.com, morbotron.com or masterofallscience.com to generate a gif based on a piece of dialogue.
At the moment it is quite basic and only returns one gif based on what Frinkiac/Morbotron/MOAS thinks is the best match to your dialogue search term. It returns the URL to the gif as a promise.

For example:
```js
const gifGenerator = require('frinkiac-gif-generator');

gifGenerator('super nintendo chalmers')
    .then((gif) => {
        console.log(gif); // https://frinkiac.com/video/S10E07/MI9Rd6R0gNkiZnr2cFb_wA8vC3k=.gif
    })
    .catch(console.error);
```

As you can see above if no site is specified it defaults to Frinkiac, but to change site simply pass it through as the second argument, e.g:
```js
gifGenerator('Robot house', 'morbotron')
    .then((gif) => {
        console.log(gif); // https://morbotron.com/video/S02E02/jLCY1cQwrS26ymv6djszozleXmY=.gif
    })
    .catch(console.error);
```

**The available sites are:**
* `frinkiac` - frinkiac.com
* `morbotron` - morbotron.com
* `moas` -  masterofallscience.com

## License
ISC © [Sammy Griffiths](http://www.sammygriffiths.co.uk)