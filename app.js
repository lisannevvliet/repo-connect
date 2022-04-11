require('dotenv').config()
const express = require('express')
const hbs  = require('express-handlebars');
const handlebars = hbs.engine;
const indexRoute = require('./routes/index')
const projectsRoute = require('./routes/vakken')

module.exports = express()
  .engine('hbs', handlebars({extname: '.hbs'}))
  .set('view engine', 'hbs')
  .set('views', './views')

  .use(express.static('./public'))

  .use('/', indexRoute)
  .use('/vakken', projectsRoute)
// .use(errorRoute)
