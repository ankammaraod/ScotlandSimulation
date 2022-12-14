const puppeteer = require('puppeteer');

const visitPage = (url) => {
  return new Promise((res, rej) => {
    puppeteer.launch({ headless: false, defaultViewport: null }).then(browser => {
      browser.newPage().then(page => {
        page.goto(url).then(() => {
          res(page);
        })
      })
    }).catch(reason => rej(reason));
  })
};

const login = (username, password) => (page) => {
  return new Promise((res, rej) => {
    page.type('#username', username).then(() => {
      page.type('#password', password).then(() => {
        page.click('#login-btn').then(() => {
          page.waitForSelector('#join-game');
          res(page);
        })
      })
    })
  })
};

const hostGame = (page) => new Promise((res, rej) => {
  const hostButton = 'a[href="/host"]';
  const gameId = '#game-id';
  page.waitForSelector(hostButton).then(() =>
    page.click(hostButton).then(() => {
      page.waitForSelector(gameId).then(() =>
        page.$eval(gameId, e => e.innerText).then(gameLink => {
          res(gameLink);
        }))
    })).catch(err => rej(err));
});

const joinGame = (gameId) => page => new Promise((res, rej) => {
  const joinButton = '#join-game';
  const gameIdInput = 'input[name="gameId"]';
  page.waitForSelector(joinButton).then(() =>
    page.click(joinButton).then(() => {
      page.waitForSelector(gameIdInput).then(() =>
        page.type(gameIdInput, gameId).then(() =>
          page.click('.join-btn')).then(() =>
            res(page))
      )
    })
  ).catch(err => rej(err));
});

const playGame = (hostPage) => {
  const playButton = '#play';
  hostPage.waitForSelector(playButton, { visible: true }).then(() => hostPage.click(playButton, { delay: 3000 }));
};

const loginUserInNewBrowser = ({ username, password }) =>
  visitPage('http://localhost:8000').then(login(username, password));

const startGame = ([hostPage, ...joineePages]) => {
  hostGame(hostPage).then(gameId => {
    Promise.all(joineePages.map(joinGame(gameId))).then(() => playGame(hostPage))
  })
};


module.exports = {
  joinGame,
  login,
  visitPage,
  hostGame,
  playGame,
  loginUserInNewBrowser,
  startGame
};