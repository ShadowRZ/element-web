/*
Copyright 2018 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const assert = require('assert');
const RiotSession = require('./src/session');

const signup = require('./src/tests/signup');
const join = require('./src/tests/join');
const createRoom = require('./src/tests/create-room');
const acceptServerNoticesInviteAndConsent = require('./src/tests/server-notices-consent');

const homeserver = 'http://localhost:8008';
const riotserver = 'http://localhost:5000';

let sessions = [];

async function runTests() {
  console.log("running tests ...");
  const options = {};
  if (process.env.CHROME_PATH) {
    const path = process.env.CHROME_PATH;
    console.log(`(using external chrome/chromium at ${path}, make sure it's compatible with puppeteer)`);
    options.executablePath = path;
  }

  const alice = await RiotSession.create("alice", options, riotserver);
  sessions.push(alice);
  
  alice.log.step("signs up");
  await signup(alice, alice.username, 'testtest');
  alice.log.done();
  
  const noticesName = "Server Notices";
  alice.log.step(`accepts "${noticesName}" invite and accepting terms & conditions`);
  await acceptServerNoticesInviteAndConsent(alice, noticesName);
  alice.log.done();

  const room = 'test';
  alice.log.step(`creates room ${room}`);
  await createRoom(alice, room);
  alice.log.done();

  await alice.close();
}

function onSuccess() {
  console.log('all tests finished successfully');
}

async function onFailure(err) {
  console.log('failure: ', err);
  for(var i = 0; i < sessions.length; ++i) {
    const session = sessions[i];
    documentHtml = await session.page.content();
    console.log(`---------------- START OF ${session.username} LOGS ----------------`);
    console.log('---------------- console.log output:');
    console.log(session.consoleLogs());
    console.log('---------------- network requests:');
    console.log(session.networkLogs());
    console.log('---------------- document html:');
    console.log(documentHtml);
    console.log(`---------------- END OF ${session.username} LOGS   ----------------`);
  }
  
  process.exit(-1);
}

runTests().then(onSuccess, onFailure);