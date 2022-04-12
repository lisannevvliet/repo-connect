// Import Dotenv.
require('dotenv').config()
// Import Express.
const express = require('express')
// Import Handlebars.
const hbs  = require('express-handlebars')
const handlebars = hbs.engine
// Import fs (file system).
const fs = require("fs")
// Import GraphQL.
const { graphql } = require('@octokit/graphql')

// Initialise Express.
const app = express()

// Configure GraphQL authorization.
const graphqlAuth = graphql.defaults({
  headers: { authorization: 'token ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
})

// Render static files.
app.use(express.static("static"))

// Set the view engine to Handlebars and change the filename extension.
app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', 'hbs')
app.set('views', './views')

// Set and log the port for Express.
const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`Express running at http://localhost:${port}.`) })

// Listen to all GET requests on /.
app.get('/', (_req, res) => {
  // Get all cmda-minor-web repositories with 2122 in the name.
  graphqlAuth(`{
    search(query: "2122 org:cmda-minor-web", type: REPOSITORY, first: 20) {
      nodes {
        ... on Repository {
          name
          url
          forkCount
          forks(first: 100) {
            nodes {
              name
              url
              owner {
                login
                url
                avatarUrl
              }
            }
          }
        }
      }
    }
  }`).then((data) => {
    // Load the index page with the subjects.
    res.render('index', {
      subjects: data.search.nodes
    })
  })
})

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  let currentIndex = array.length, randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

app.get('/:subject', (req, res) => {
  // Get the cmda-minor-web repository that matches the subject name.
  graphqlAuth(`{
    search(query: "${req.params.subject} org:cmda-minor-web", type: REPOSITORY, first: 20) {
      nodes {
        ... on Repository {
          name
          url
          forkCount
          forks(first: 100) {
            nodes {
              name
              url
              owner {
                login
                url
                avatarUrl
              }
            }
          }
        }
      }
    }
  }`).then((data) => {
    // Check if a JSON with the name of the subject already exists.
    if (!fs.existsSync(`static/json/${data.search.nodes[0].name}.json`)) {
      // Shuffle data.search.nodes[0].forks.nodes and put in in a JSON.
      fs.writeFileSync(`static/json/${data.search.nodes[0].name}.json`, JSON.stringify(shuffle(data.search.nodes[0].forks.nodes)))
    }

    // Render the subject page with the forks.
    res.render('subject', {
      forks: JSON.parse(fs.readFileSync(`static/json/${data.search.nodes[0].name}.json`, "utf8"))
    })
  })
})