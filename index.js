const puppeteer = require('puppeteer');

const url = "https://leetcode.com/problemset/"

async function getDailyLink(link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  page.setDefaultTimeout(300000)
  page.setDefaultNavigationTimeout(300000)
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36')
  await page.goto(link, {
    waitUntil: 'networkidle2',
    timeout: 300000
  });

  const dailyLink = await page.evaluate(function() {
    let linkToDaily = document.querySelector('[role="rowgroup"]>[role="row"] a')
    const link = linkToDaily.href;
    return link;
  })
  await browser.close()
  return dailyLink;
}

async function getData(link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage()
  page.setDefaultTimeout(300000)
  page.setDefaultNavigationTimeout(300000)
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3419.0 Safari/537.36')
  await page.goto(link, {
    waitUntil: 'networkidle2',
    timeout: 300000
  });

  const data = await page.evaluate(function() {
    const name = document.querySelector('.items-start').innerText;
    console.log(name);
    const difficulty = document.querySelector('.items-start').nextSibling.firstChild.innerText;
    let infor = document.getElementsByClassName('group/ads')[0].nextSibling.querySelectorAll('.items-center')
    let inforList = Array.from(infor).map(item=>item.innerText)
    const topics = document.getElementsByClassName('group/ads')[0].nextSibling.nextSibling.nextSibling.querySelectorAll('a');
    let topicList = Array.from(topics).map(topic => topic.innerText);

    const crawlData = {}
    crawlData.name = name;
    crawlData.difficulty = difficulty;
    crawlData.infor = inforList;
    crawlData.topics = topicList;
    console.log(crawlData);
    return crawlData;
  })

  await browser.close()
  data.link = link;
  return data;
}


function formatData(data) {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let currentDate = `${day}-${month}-${year}`;

  let infor = data.infor.toString().split("\n");
  let acRate = infor[infor.length-1];

  const response = {}
  response.title = data.name;
  response.link = data.link;
  response.difficulty = data.difficulty;
  response.topicTags = data.topics;
  response.date = currentDate;
  response.acRate = acRate;

  return response;
}

async function sendDailyChallenge(data) {
  DISCORD_HOOK_URL = ''
  let response = formatData(data);
  var payload = {
    "username": "Yayoi",
    "avatar_url": "https://i.pinimg.com/564x/1b/48/5e/1b485edbd4fa75681d9f1cdb309ac9bc.jpg",
    "content": "😘😘😘 Quà của ngày hôm nay đây nhé 😘😘😘",
    "embeds": [
      {
        "author": {
          "name": "Natori",
          "icon_url": "https://i.pinimg.com/564x/bf/82/06/bf8206c81d5be7f6f97316ea8d8c5868.jpg"
        },
        "title": response.title,
        "url": response.link,
        "color": 15258703,
        "fields": [
          {
            "name": "Difficulty",
            "value": response.difficulty,
            "inline": true
          },
          {
            "name": "Topic",
            "value": response.topicTags.toString().replaceAll(",", " - "),
            "inline": true
          },
          {
            "name": "",
            "value": ""
          },
          {
            "name": "Date",
            "value": response.date,
            "inline": true
          },
          {
            "name": "Acceptance rate",
            "value": response.acRate,
            "inline": true
          }
        ],
        "image": {
          "url": "https://sciencevikinglabs.com/assets/img/development/generated-header-images/header.png"
        },
        "footer": {
          "text": "see y'all tomorrow",
          "icon_url": "https://upload.wikimedia.org/wikipedia/commons/8/8e/LeetCode_Logo_1.png"
        }
      }
    ]
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }

  fetch(DISCORD_HOOK_URL, options);
}

getDailyLink(url)
.then(link=>getData(link))
.then(data=>sendDailyChallenge(data))