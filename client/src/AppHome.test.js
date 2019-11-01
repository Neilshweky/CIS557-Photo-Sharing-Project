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

async function goToHomeAfterLogin() {
  await fetch('http://localhost:8080/signup', {
    method: 'POST',
    body: JSON.stringify({ username: 'neilshweky', password: 'cis557sucks', email: 'nshweky@seas.upenn' }),
    headers: { 'Content-Type': 'application/json' },
  });
  await driver.findElement(By.id('username')).sendKeys('neilshweky');
  await driver.findElement(By.id('password')).sendKeys('cis557sucks', Key.RETURN);
}

it('no login redirect', async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'), 2000);
  await driver.get('http://localhost:3000/home');
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/signin');
});

it('welcome message', async () => {
  driver.wait(until.urlIs('http://localhost:3000/home'), 2000);
  await goToHomeAfterLogin();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/home');
  await driver.findElement(By.id('welcome')).getText().then((val) => {
    expect(val).toEqual(expect.stringContaining('neilshweky'));
  });
});
