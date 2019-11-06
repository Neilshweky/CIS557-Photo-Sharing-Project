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
  driver.wait(until.urlIs('http://localhost:3000/signup'));
  await driver.get('http://localhost:3000/signup');
  await driver.findElement(By.id('logout')).click();
  driver.wait(until.urlIs('http://localhost:3000/signup'));
  await driver.get('http://localhost:3000/signup');
});


async function signupSuccess() {
  await fetch('http://localhost:8080/user/neilshweky', { method: 'DELETE' })
    .then((res) => res.json())
    .then((json) => console.log(json))
    .catch(() => { });
  await driver.findElement(By.id('username')).sendKeys('neilshweky');
  await driver.findElement(By.id('email')).sendKeys('nshweky3@seas.upenn.edu');
  await driver.findElement(By.id('password')).sendKeys('cis557sucks');
  await driver.findElement(By.id('signupButton')).click().then(() => driver.sleep(1000));
}

async function signupNoEmail() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('password')).sendKeys('hello', Key.RETURN);
}

async function signupNoPass() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('email')).sendKeys('hello', Key.RETURN);
}

async function signupNoUser() {
  await driver.findElement(By.id('password')).sendKeys('hello');
  await driver.findElement(By.id('email')).sendKeys('hello', Key.RETURN);
}

it('signup no email', async () => {
  await signupNoEmail();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/signup');
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe('');
  });
});

it('signup no pass', async () => {
  await signupNoPass();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/signup');
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe('');
  });
});

it('signup no user', async () => {
  await signupNoUser();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/signup');
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe('');
  });
});

it('go to signin', async () => {
  await driver.findElement(By.id('signinlink')).click();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/signin');
});


test('back to signup after signup', async () => {
  await signupSuccess();
  await driver.get('http://localhost:3000/signup').then(() => driver.sleep(1000));
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/home');
});


it('signup success', async () => {
  await driver.sleep(1000);
  await signupSuccess();
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/home');
});
