
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./mui-bottom-sheet.cjs.production.min.js')
} else {
  module.exports = require('./mui-bottom-sheet.cjs.development.js')
}
