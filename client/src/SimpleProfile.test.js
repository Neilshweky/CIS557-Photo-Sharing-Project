const {
  Builder, By, Key, until,
} = require('selenium-webdriver');
require('selenium-webdriver/chrome');
require('chromedriver');

const fetch = require('node-fetch');

let driver;
beforeAll(async () => {
  driver = await new Builder().forBrowser('chrome').build();
});
afterAll(async () => { await driver.quit(); });

beforeEach(async () => {
  driver.wait(until.urlIs('http://localhost:3000/signin'));
  await driver.get('http://localhost:3000/signin');
  await driver.findElement(By.id('logout')).click();
});

async function goToProfileAfterLogin() {
  await fetch('http://localhost:8080/user/neilshweky', { method: 'DELETE' }).then(
    await fetch('http://localhost:8080/signup', {
      method: 'POST',
      body: JSON.stringify({ username: 'neilshweky', password: 'cis557sucks', email: 'nshweky@seas.upenn.edu' }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((json) => console.log(json))
      .catch(() => console.log('User already exists')),
  );
  await driver.findElement(By.id('username')).sendKeys('neilshweky');
  await driver.findElement(By.id('password')).sendKeys('cis557sucks', Key.RETURN);
  await driver.get('http://localhost:3000/profile');
}


it('all elements present', async () => {
  await goToProfileAfterLogin().then(() => driver.sleep(1000));
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/profile');
  await driver.findElement(By.id('username')).getAttribute('value').then((val) => {
    expect(val).toEqual('neilshweky');
  });
  await driver.findElement(By.id('email')).getAttribute('value').then((val) => {
    expect(val).toEqual('nshweky@seas.upenn.edu');
  });
});
