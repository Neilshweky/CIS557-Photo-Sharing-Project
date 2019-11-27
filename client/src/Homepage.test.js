const {
  Builder, By, Key, until,
} = require('selenium-webdriver');
require('chromedriver');
require('selenium-webdriver/chrome');
const fetch = require('node-fetch');

let driver;
beforeAll(async () => { driver = await new Builder().forBrowser('chrome').build(); });
afterAll(async () => { await driver.quit(); });

beforeEach(async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.get('http://localhost:3000/signin');
});

async function signUpUsers() {
  await fetch('http://localhost:8080/user/user1', { method: 'DELETE' }).then(
    await fetch('http://localhost:8080/signup', {
      method: 'POST',
      body: JSON.stringify({ username: 'user1', password: 'user1pw', email: 'user1@seas.upenn.edu' }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.log('User already exists', err)),
  );
  await fetch('http://localhost:8080/user/user2', { method: 'DELETE' }).then(
    await fetch('http://localhost:8080/signup', {
      method: 'POST',
      body: JSON.stringify({ username: 'user2', password: 'user2pw', email: 'user2@seas.upenn.edu' }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch((err) => console.log('User already exists', err)),
  );
}

async function follow(user, followee) {
  await fetch(`http://localhost:8080/follow/${user}/${followee}`, { method: 'POST' })
    .then((res) => console.log(res));
}

async function postPicture() {
  await fetch('http://localhost:8080/postpicture', {
    method: 'POST',
    body: JSON.stringify({ username: 'user1', pic: 'some_pic' }),
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => res.json()).then((json) => console.log(json));
}

async function login() {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.get('http://localhost:3000/signin');
  await driver.findElement(By.id('username')).sendKeys('user1');
  await driver.findElement(By.id('password')).sendKeys('user1pw', Key.RETURN);
  driver.wait(until.urlIs('http://localhost:3000/home'), 200);
}

it('empty homepage test', async () => {
  await signUpUsers();
  await follow('user1', 'user2');
  await login();
  await driver.findElement(By.id('welcome')).getAttribute('innerHTML').then((val) => {
    expect(val).toEqual('Welcome.user1');
  });
});

it('posts in homepage test', async () => {
  await signUpUsers();
  await follow('user1', 'user2');
  await login();
  await postPicture();
  await driver.findElement(By.id('welcome')).getAttribute('innerHTML').then((val) => {
    expect(val).toEqual('Welcome.user1');
  });
  const xpathUser = 'html/body/div/div/div[2]/div/div/div[1]/div[2]/span[1]';
  driver.findElement(By.xpath(xpathUser)).getAttrbute('innerHTML').then((user) => {
    expect(user).toEqual('user1');
  });
  const xpathLikes = 'html/body/div/div/div[2]/div/div/div[3]/button[1]/span[1]/p';
  driver.findElement(By.xpath(xpathLikes)).getAttrbute('innerHTML').then((likes) => {
    expect(likes).toEqual('0');
  });
});
