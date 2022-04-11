const express = require('express')
const { graphql } = require('@octokit/graphql')
const graphqlAuth = graphql.defaults({
  headers: { authorization: 'token ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
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

  return array;
}

module.exports = express
  .Router()

  .get('/', function (req, res) {
    // Get the repository information from my GitHub account
    graphqlAuth(`{
      search(query: "2122 org:cmda-minor-web", type: REPOSITORY, first: 20) {
        nodes {
          ... on Repository {
            name
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
      data.search.nodes.forEach((_element, index) => {
        shuffle(data.search.nodes[index].forks.nodes)
      })

      res.render('projects', {
        projects: data.search.nodes,
      })
    })
  })
