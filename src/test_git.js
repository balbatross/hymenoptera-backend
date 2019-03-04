const git = require('isomorphic-git')
const fs = require('fs')
git.plugins.set('fs', fs)

git.init({dir: '/tmp/test-repo'}).then(() => {
  git.add({dir: '/tmp/test-repo', filepath:'http.js'}).then(() => {
    console.log("Done")

  })
})  
