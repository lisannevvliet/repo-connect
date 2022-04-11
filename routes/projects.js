const express = require('express')
const { graphql } = require('@octokit/graphql')
const graphqlAuth = graphql.defaults({
  headers: { authorization: 'token ' + process.env.GITHUB_PERSONAL_ACCESS_TOKEN },
})

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
                }
              }
            }
          }
        }
      }
    }`).then((data) => {
      res.render('projects', {
        projects: data.search.nodes,
      })
    })
  })
