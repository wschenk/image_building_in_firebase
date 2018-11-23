const functions = require('firebase-functions');
const express = require('express');
const { applyMask } = require('./applyMask');
const Tempfile = require('tempfile')
const fetch = require('node-fetch')
const md5 = require('blueimp-md5')
const fs = require('fs')

const webApp = express();

function downloadGravatar( email ) {
  const hash = md5(email);
  return downloadUrl("https://www.gravatar.com/avatar/" + hash + ".jpg" )
}

function downloadUrl( url ) {
  console.log( "downloading " + url )
  return fetch( url ).then(res => {
    const outputFile = Tempfile( ".jpg" )
    console.log( "Streaming to ", outputFile )
    const dest = fs.createWriteStream(outputFile);
    res.body.pipe(dest);
    return outputFile;
  });
}

webApp.get( '/', (req, res) => {
  const email = req.query.email;
  let name = req.query.name;

  if( email === "" || email === undefined ) {
    return res.status(404).send( "Email not passed in")
  }

  if( name === "" || name === undefined ) {
    name = email
  }

  downloadGravatar( email ).then( (avatarFile) => {
    return applyMask( name, avatarFile )
  } ).then( (tempfile) => {
    console.log( "Uploading file " + tempfile )
    return res.sendFile( tempfile )
  }).catch( (err) => {
    console.log( err )
    res.send( {error: err})
  } )
})

exports.createImage = functions.https.onRequest( webApp )
