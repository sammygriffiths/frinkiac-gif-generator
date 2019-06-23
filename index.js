const axios = require('axios');
const api = require('./src/api')(axios);

module.exports = term => api.generateGif(term);
