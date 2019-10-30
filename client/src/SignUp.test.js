const {
    Builder, By, Key, until,
  } = require('selenium-webdriver');
  require('selenium-webdriver/chrome');
const fetch = require('node-fetch')

let driver;
beforeAll(async () => { driver = await new Builder().forBrowser('chrome').build(); });
afterAll(async () => { await driver.quit(); });

beforeEach (async () => {
  driver.wait(until.urlIs('http://localhost:3000/signup'));
  await driver.get('http://localhost:3000/signup');
})


async function signup_success() {
  await fetch('http://localhost:8080/user/neilshweky', {method: 'DELETE'})
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(() => {})
  await driver.findElement(By.id('username')).sendKeys('neilshweky');
  await driver.findElement(By.id('email')).sendKeys('nshweky3@seas.upenn.edu');
  await driver.findElement(By.id('password')).sendKeys('cis557sucks');
  await driver.findElement(By.id('signupButton')).click();
}

async function signup_no_email() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('password')).sendKeys('hello', Key.RETURN);
}

async function signup_no_pass() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('email')).sendKeys('hello', Key.RETURN);

}

async function signup_no_user() {
  await driver.findElement(By.id('password')).sendKeys('hello');
  await driver.findElement(By.id('email')).sendKeys('hello', Key.RETURN);

}


it('signup no email', async () => {
  await signup_no_email()
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signup")
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('signup no pass', async () => {
  await signup_no_pass()
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signup")
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('signup no user', async () => {
  await signup_no_user()
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signup")
  await driver.findElement(By.id('signup-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('go to signin', async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.findElement(By.id('signinlink')).click();
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signin")
});

it('signup success', async () => {
  driver.wait(until.urlIs('http://localhost:3000/home'), 2000);
  await signup_success()
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/home")
});

it('back to signup after signup', async () => {
  await driver.get('http://localhost:3000/signup');
  driver.wait(until.urlIs('http://localhost:3000/home'));
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/home")
});