const {
    Builder, By, Key, until,
  } = require('selenium-webdriver');
  require('selenium-webdriver/chrome');

let driver;
beforeAll(async () => { driver = await new Builder().forBrowser('chrome').build(); });
afterAll(async () => { await driver.quit(); });

beforeEach (async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.get('http://localhost:3000/signin');
})
async function login_success() {
    
    await driver.findElement(By.id('username')).sendKeys('neilshweky2');
    await driver.findElement(By.id('password')).sendKeys('cis557sucks', Key.RETURN);
    driver.wait(until.urlIs('http://localhost:3000/home'), 200);
}

async function login_failure() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('password')).sendKeys('hello', Key.RETURN);
}

async function login_no_pass() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2', Key.RETURN);
}

async function login_no_user() {
  await driver.findElement(By.id('password')).sendKeys('hello', Key.RETURN);
}


it('login attempt failed', async () => {
  await login_failure()
  url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signin")
  await driver.findElement(By.id('login-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('login no pass', async () => {
  await login_no_pass()
  url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signin")
  await driver.findElement(By.id('login-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('login no user', async () => {
  await login_no_user()
  url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signin")
  await driver.findElement(By.id('login-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});

it('go to signup', async () => {
  driver.wait(until.urlIs('http://localhost:3000/signup'));
  await driver.findElement(By.id('signuplink')).click();
  url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signup")
});

it('login attempt', async () => {
  await login_success()
  url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/home")
});

