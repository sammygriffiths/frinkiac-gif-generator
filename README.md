[![Travis CI](https://travis-ci.com/sammygriffiths/frinkiac-gif-generator.svg?branch=master)](https://travis-ci.com/sammygriffiths/frinkiac-gif-generator)

# Frinkiac GIF Generator
An un-official package for auto-generating gifs from frinkiac.com based on a search term.

## Installing
`npm install --save frinkiac-gif-generator`

## Usage
This package uses frinkiac.com to generate a gif based on a piece of dialogue.
At the moment it is quite basic and only returns one gif based on what Frinkiac thinks is the best match to your dialogue search term. It returns the URL to the gif as a promise.

For example:
```js
const gifGenerator = require('frinkiac-gif-generator');

gifGenerator('super nintendo chalmers')
    .then((gif) => {
        console.log(gif); // https://frinkiac.com/video/S10E07/MI9Rd6R0gNkiZnr2cFb_wA8vC3k=.gif
    })
    .catch(console.error);
```

## License
ISC © [Sammy Griffiths](http://www.sammygriffiths.co.uk)