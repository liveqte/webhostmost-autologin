const puppeteer = require('puppeteer');

async function login(username, password) {
  const username1=username.slice(0, 4);
  console.log(`Attempting to login with username: ${username1}`);
 
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto('https://client.webhostmost.com/login', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    await page.waitForSelector('#inputEmail', { timeout: 10000 });
    await page.type('#inputEmail', username);
    await page.type('#inputPassword', password);
    
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 })
    ]);
    
    const url = page.url();
    if (url.includes('clientarea.php')) {
      console.log(`✅ Successfully logged in as ${username1}`);
    } else {
      console.log(`❌ Failed to login as ${username1}`);
    }
    
    await page.screenshot({ path: `${username1}-screenshot.png` });
    
  } catch (error) {
    console.error(`🚨 Error during login for ${username1}:`, error);
  } finally {
    await browser.close();
  }
}

async function main() {
  try {
    // 从环境变量获取JSON格式凭据
    const credentialsJson = process.env.USERNAME_AND_PASSWORD;
    
    if (!credentialsJson) {
      throw new Error('No credentials provided. Please set USERNAME_AND_PASSWORD secret.');
    }
    
    // 解析JSON
    const accounts = JSON.parse(credentialsJson);
    console.log(`Found ${Object.keys(accounts).length} accounts to process`);
    let username1;
    // 遍历所有账户
    for (const [username, password] of Object.entries(accounts)) {
      try {
        username1=username.slice(0, 4);
        console.log(`\n=== Processing account: ${username1} ===`);
        await login(username, password);
        
        // 账户间延迟
        if (Object.keys(accounts).length > 1) {
          console.log('Waiting 5 seconds before next account...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`Error processing ${username1}:`, error);
      }
    }
    
    console.log('\nAll accounts processed!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
