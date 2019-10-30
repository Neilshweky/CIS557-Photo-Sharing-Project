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

async function goto_profile_after_login() {
    await driver.findElement(By.id('username')).sendKeys('neilshweky2');
    await driver.findElement(By.id('password')).sendKeys('cis557sucks', Key.RETURN);
    driver.wait(until.urlIs('http://localhost:3000/home'), 200);
    await driver.get('http://localhost:3000/profile');
}

async function goto_profile_wrong_login() {
  await driver.findElement(By.id('username')).sendKeys('neilshweky2');
  await driver.findElement(By.id('password')).sendKeys('hello', Key.RETURN);
  await driver.get('http://localhost:3000/profile');
}

xit('profile after correct login', async () => {
  await goto_profile_after_login();
  const url = await driver.getCurrentUrl();
  expect(url).toBe("http://localhost:3000/profile");
  await driver.findElement(By.id('username')).getAttribute('value').then((val) => {
    expect(val).toEqual("neilshweky2");
  });
  await driver.findElement(By.id('email')).getAttribute('value').then((val) => {
    expect(val).toEqual("nshweky2@seas.upenn.edu");
  });
});

xit('profile after wrong login', async () => {
  await goto_profile_wrong_login();
  const url = await driver.getCurrentUrl()
  expect(url).toBe("http://localhost:3000/signin")
  await driver.findElement(By.id('login-status')).getText().then((text) => {
    expect(text).not.toBe("");
  });
});
