const client = require('scp2');
require('dotenv').config();

const host = process.env[`${process.argv[2].toUpperCase()}_HOST`];
console.log(`uploading build folder to: ${host}`);

client.scp('build/', {
  host: process.env.STAGE_HOST,
  username: process.env.SSH_USERNAME,
  password: process.env.SSH_PASSWORD,
  path: 'wwwroot/recreate-web'
}, err => {
  if (err) {
    console.error('error', err);
  } else {
    console.log('upload completed successfully');
  }
});
