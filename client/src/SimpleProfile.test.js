const {
  Builder, By, Key, until,
} = require('selenium-webdriver');
require('selenium-webdriver/chrome');
const fetch = require('node-fetch');

let driver;
beforeAll(async () => { driver = await new Builder().forBrowser('chrome').build(); });
afterAll(async () => { await driver.quit(); });

beforeEach(async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.get('http://localhost:3000/signin');
});

async function goToProfileAfterLogin() {
  await fetch('http://localhost:8080/signup', {
    method: 'POST',
    body: JSON.stringify({ username: 'neilshweky', password: 'cis557sucks', email: 'nshweky@seas.upenn' }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch(() => console.log('User already exists'));
  await driver.findElement(By.id('username')).sendKeys('neilshweky');
  await driver.findElement(By.id('password')).sendKeys('cis557sucks', Key.RETURN);
  await driver.get('http://localhost:3000/profile');
}


it('all elements present', async () => {
  driver.wait(until.urlIs('http://localhost:3000/profile'), 2000);
  await goToProfileAfterLogin();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/profile');
  await driver.findElement(By.id('username')).getAttribute('value').then((val) => {
    expect(val).toEqual('neilshweky');
  });
  await driver.findElement(By.id('email')).getAttribute('value').then((val) => {
    expect(val).toEqual('nshweky@seas.upenn.edu');
  });
});
