require('dotenv').config()
const hbs  = require('express-handlebars');
const handlebars = hbs.engine;
const { graphql } = require('@octokit/graphql')
const express = require('express');
const app = express();
const graphqlAuth = graphql.defaults({
  headers: { authorization: 'token ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
})
const fs = require("fs")
const port = process.env.PORT || 3000;

// Templating engine
app.engine('hbs', handlebars({extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', './views');


//Routing
app.get('/', (req, res) => {
    // Get the repository information from my GitHub account
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
      res.render('index', {
        vakken: data.search.nodes
      })
    })
})

app.get('/:vak', (req, res) => {
    // Get the repository information from my GitHub account
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
      data.search.nodes.forEach((element, index) => {
        if (!fs.existsSync(`public/json/${element.name}.json`)) {
          fs.writeFileSync(`public/json/${element.name}.json`, JSON.stringify(shuffle(data.search.nodes[index].forks.nodes)))
          //render
        } else {
          console.log("haal maar op")
        }

        // fs.readFile(`public/json/${element.name}.json`, "utf8", function(_err, data) {
        //   // JSON.parse(data)
        // })
      })

      res.render('vakken', {
        vakken: data.search.nodes
      })
    })
})

// Set server
app.listen(port, () => {
    console.log(`Gebruikte poort:${port}!`)
});


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