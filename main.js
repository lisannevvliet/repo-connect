// Import Node.js modules.
require("dotenv").config()
const express = require("express")
const handlebars  = require("express-handlebars")
const fs = require("fs")
const { graphql } = require("@octokit/graphql")

// Initialise Express.
const app = express()

// Configure GraphQL authorization.
const graphqlAuth = graphql.defaults({
  headers: { authorization: "token " + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
})

// Render static files.
app.use(express.static("static"))

// Set the view engine to Handlebars, import the helpers and change the filename extension.
app.engine("hbs", handlebars.engine({ helpers: require("./helpers"), extname: ".hbs" }))
app.set("view engine", "hbs")

// Parse incoming requests.
app.use(express.urlencoded({ extended: true }))

// Set and log the port for Express.
const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`Express running at http://localhost:${port}.`) })

// Variable in which the selected year is stored.
let year = 2122

// Listen to all GET requests on /.
app.get("/", (_req, res) => {
  // Get all cmda-minor-web repositories with [year] in the name.
  graphqlAuth(`{
    search(query: "${year} org:cmda-minor-web", type: REPOSITORY, first: 20) {
      nodes {
        ... on Repository {
          name
          description
          forkCount
        }
      }
    }
  }`).then((data) => {
    // Load the index page with the subjects.
    res.render("index", {
      subjects: data.search.nodes,
      year: year
    })
  })
})

// Listen to all POST requests on /.
app.post("/", (req, res) => {
  // Set the year variable to the selected year.
  year = req.body.year

  // Redirect to the index page.
  res.redirect("/")
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

// Listen to all GET requests on /[subject].
app.get("/:subject", (req, res) => {
  // Get the cmda-minor-web repository that matches the subject name.
  graphqlAuth(`{
    search(query: "${req.params.subject} org:cmda-minor-web", type: REPOSITORY, first: 20) {
      nodes {
        ... on Repository {
          name
          description
          url
          forkCount
          forks(first: 100) {
            nodes {
              name
              description
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
    if (!fs.existsSync(`static/json/${req.params.subject}.json`)) {
      // Shuffle data.search.nodes[0].forks.nodes and put in in a JSON.
      fs.writeFileSync(`static/json/${req.params.subject}.json`, JSON.stringify(shuffle(data.search.nodes[0].forks.nodes)))
    }

    // Render the subject page with the forks.
    res.render("subject", {
      forks: JSON.parse(fs.readFileSync(`static/json/${req.params.subject}.json`, "utf8"))
    })
  })
})

// Listen to all GET requests on /[subject]/admin.
app.get("/:subject/admin", (req, res) => {
  // Render the admin page with the forks.
  res.render("admin", {
    forks: JSON.parse(fs.readFileSync(`static/json/${req.params.subject}.json`, "utf8")),
    subject: req.params.subject
  })
})

// Listen to all POST requests on /[subject]/admin/shuffle.
app.post("/:subject/admin/shuffle", (req, res) => {
  // Get the cmda-minor-web repository that matches the subject name.
  graphqlAuth(`{
    search(query: "${req.params.subject} org:cmda-minor-web", type: REPOSITORY, first: 20) {
      nodes {
        ... on Repository {
          forks(first: 100) {
            nodes {
              name
              description
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
    // Delete the JSON with the name of the subject.
    fs.unlinkSync(`static/json/${req.params.subject}.json`)

    // Shuffle data.search.nodes[0].forks.nodes and put in in a JSON.
    fs.writeFileSync(`static/json/${req.params.subject}.json`, JSON.stringify(shuffle(data.search.nodes[0].forks.nodes)))

    // Redirect to the admin page.
    res.redirect(`/${req.params.subject}/admin`)
  })
})