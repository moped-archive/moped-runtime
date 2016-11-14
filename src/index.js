if (process.env.NODE_ENV !== 'production') {
  require('moped-scripts').register();
}
const path = require('path');
const bodyParser = require('body-parser');
const session = require('cookie-session');
const express = require('express');
const lusca = require('lusca');
const ms = require('ms');
const passport = require('passport');
const Promise = require('promise');
const createServer = require('../server');

const app = express();

let COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('You must specify a COOKIE_SECRET environment varible to run a moped app in production.');
    console.error('It should be set to a long string of random letters & numbers.  This will be used to secure');
    console.error('cookies.  To allow changing this value over time without immediately logging out old users,');
    console.error('you can use multiple values separated by `:`.  The first value will be used to sign new cookies');
    console.error('but all values will be accepted when verifying existing cookies.  Once all users have visited');
    console.error('your web-app, you can remove the old secrets.');
    process.exit(1);
  } else {
    COOKIE_SECRET = 'DEVELOPMENTCOOKIESECRET';
  }
}
const COOKIE_MAX_AGE = ms(process.env.COOKIE_MAX_AGE ? process.env.COOKIE_MAX_AGE : '30 days');
if (COOKIE_MAX_AGE === undefined) {
  console.error(
    'If you set COOKIE_MAX_AGE, it must be a value that can be parsed by the ms library.  e.g. 30 days or 1 hour',
  );
  process.exit(1);
}
app.use(session({
  keys: COOKIE_SECRET.split(':'),
  signed: true,
  maxAge: COOKIE_MAX_AGE,
  secureProxy: process.env.NODE_ENV === 'production',
  httpOnly: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(lusca.csrf());
app.use(lusca.xframe('DENY'));
app.use(lusca.xssProtection());
app.use(lusca.nosniff());

passport.serializeUser((user, done) => {
  Promise.resolve(createServer._serializeUser(user)).nodeify(done);
});
passport.deserializeUser((id, done) => {
  Promise.resolve(createServer._deserializeUser(id)).nodeify(done);
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // if we are authenticated, make a modification to the session so that it gets maintained.  Otherwise it will
    // expire despite frequent use.
    req.session.timestamp = Date.now();
  }
  next();
});
app.get('/csrf_token', (req, res, next) => {
  res.send('while (true) {}\nconsole.log(' + JSON.stringify(res.locals._csrf) + ')');
});
app.post('/logout', (req, res, next) => {
  req.logout();
  res.send('');
});

let BASE_PATH = path.resolve('./build/backend');
if (process.env.NODE_ENV !== 'production') {
  BASE_PATH = path.resolve('./src/server');
}

const server = require(BASE_PATH);
app.use(server.default);

if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const lsr = require('lsr');
  const prepareResponse = require('prepare-response');

  function prepare(filename, headers) {
    return prepareResponse(fs.readFileSync(filename), headers);
  }

  lsr.sync(process.cwd() + '/build/frontend').filter(file => file.isFile()).forEach(file => {
    const response = prepare(
      file.fullPath,
      {
        'content-type': file.fullPath.split('.').pop(),
        'cache-control': /\/static\//.test(file.path) ? '1 year' : '10 minutes',
      },
    );
    app.get(file.path.substr(1), (req, res, next) => {
      response.send(req, res, next);
    });
  });

  const htmlResponse = prepare(
    process.cwd() + '/build/frontend/index.html',
    {'content-type': 'html', 'cache-control': '10 minutes'},
  );
  app.get('*', (req, res, next) => {
    htmlResponse.send(req, res, next);
  });
  app.listen(process.env.PORT || 3000);
} else {
  require('moped-scripts').start(app);
}
