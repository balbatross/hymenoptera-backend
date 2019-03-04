var uuid = require('uuid');
var crypto = require('crypto')
var jwt = require('jsonwebtoken')

class AuthEngine {

  constructor(backend){
    this.backend = backend
  }

  register(body){
    return new Promise((resolve, reject) => {
      let pass = crypto.createHash('sha256').update(body.password, 'utf8').digest().toString('hex')
      let user = {
        id: uuid.v4(),
        user: body.username,
        pwd: pass, //Hash this
        email: body.email,
        name: body.name
      }
      this.backend.collection('users').insertOne(user, (err) => {
        if(err) return reject(err);
        resolve(user)
      })
    })
  }

  authenticate(user){
    return new Promise((resolve, reject) => {
      let pass = crypto.createHash('sha256').update(user.password, 'utf8').digest().toString('hex')
      this.backend.collection('users').findOne({user: user.username, pwd: pass}, (err, result) => {
        if(err) return reject(err);
        if(!result) return reject({msg: "No user found"})
        let user_res = {
          id: result.id,
          user: result.user,
          name: result.name,
          email: result.email
        }
        resolve({token: jwt.sign(user_res, 'SECRET-ISH')})
      })
    })
  }

}

module.exports = AuthEngine;
