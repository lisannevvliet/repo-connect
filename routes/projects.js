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
      organization(login: "cmda-minor-web") {
        repositories(first: 50, orderBy: {field: CREATED_AT, direction: DESC}) {
          edges {
            node {
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
      }
    }`).then((data) => {
      res.render('projects', {
        projects: data.organization.repositories.edges,
      })
    })
  })
