const users = require('./users.json');

const { loginUserInNewBrowser, startGame } = require('./lib.js');

const main = () =>
  Promise.all([users.ak, users.pk, users.lp].map(loginUserInNewBrowser))
    .then(startGame);

main();