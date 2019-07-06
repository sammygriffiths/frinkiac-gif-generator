const axios = require('axios');
const config = require('./config.json');
const api = require('./src/api')(axios, config);

module.exports = (term, site) => api.generateGif(term, site);
