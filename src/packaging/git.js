const git = require('isomorphic-git')
const fs = require('fs')

git.plugins.set('fs', fs)

class LocalGitRegistry {
  constructor(base){
    this.base_path = base
  }

  newRepo(project){
    return new Promise((resolve, reject) => {
      let path = `${this.base_path}/${project.id}`
      fs.mkdir(path, (err) => {
        if(err && err.code != 'EEXIST') return reject(err);
        git.init({dir: path}).then(() => {
          resolve(path)
        })
      })
    })
  }

  updateRepo(project, message){
    return new Promise((resolve, reject) => {
      let path = `${this.base_path}/${project.id}`
      git.add({dir: path, filepath: '.'}).then(() => {
        git.commit({dir: path, message: message, author: {name: "Hymenoptera Worker", email: "workers@hymenoptera.xyz"}}).then((sha) => {
          resolve({full: sha, short: sha.substring(0, 8)})
        })
      })
    })
  }
}

let test = new LocalGitRegistry("/tmp")
test.newRepo({id: "test-repo"}).then((repo) => {
  console.log("new repo", repo)
})

module.exports = LocalGitRegistry
