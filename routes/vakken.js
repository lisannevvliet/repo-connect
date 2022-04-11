const express = require('express')
const { graphql } = require('@octokit/graphql')
const graphqlAuth = graphql.defaults({
  headers: { authorization: 'token ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
})
const fs = require("fs")

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

module.exports = express
  .Router()

  .get('/:vak', function (req, res) {
    // Get the repository information from my GitHub account
    graphqlAuth(`{
      search(query: "2122 org:cmda-minor-web", type: REPOSITORY, first: 20) {
        nodes {
          ... on Repository {
            name
            url
            forkCount
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
