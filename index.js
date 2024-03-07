const puppeteer = require('puppeteer');
const browserFetcher = puppeteer.createBrowserFetcher();

const url = "https://leetcode.com/problemset/"

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
      let imgUrl = document.querySelector('div[data-pagelet="MediaViewerPhoto"] img[data-visualcompletion="media-vc-image"]')
          if (imgUrl === null) imgUrl = ''
              else imgUrl = imgUrl.src
      let a = document.querySelectorAll('div[data-visualcompletion="ignore-dynamic"]')
      if (a[1] === undefined) return false
      var nextBtn = a[1].querySelector('div:first-child')
      if (nextBtn === null) return false
      nextBtn.click()
      let nextUrl = window.location.href
      return { imgUrl, nextUrl }
  })
  await browser.close()
  return data
}


function sendDailyChallenge() {
  DISCORD_HOOK_URL = 'https://discord.com/api/webhooks/1214409706001666098/IiaDn4yoqnFecSTW7N3yH3Ayz3bA4g29XCkrDmzlLtv0266gblCt6gs3v82CjNv4Hs9o'
  var response = fetchLeetCodeData()
  Logger.log(response);
  var data = {
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
            "value": response.acRate.toFixed(1) + "%",
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

  var options = {
  'method' : 'post',
  'contentType': 'application/json',
  'payload' : JSON.stringify(data),
  'muteHttpExceptions': true
  };
  Logger.log(options)
  var hookResponse = UrlFetchApp.fetch(DISCORD_HOOK_URL, options);
  Logger.log(hookResponse.getContentText()); 
  
}


// query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    canSeeQuestion\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    exampleTestcases\n    categoryTitle\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      paidOnly\n      hasVideoSolution\n      paidOnlyVideo\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    enableDebugger\n    envInfo\n    libraryUrl\n    adminUrl\n    challengeQuestion {\n      id\n      date\n      incompleteChallengeCount\n      streakCount\n      type\n      __typename\n    }\n    __typename\n  }\n}\n


function fetchLeetCodeData() {
  var url = 'https://leetcode.com/graphql';
  var payload = {
    'query': 'query questionOfToday {\n\tactiveDailyCodingChallengeQuestion {\n\t\tdate\n\t\tuserStatus\n\t\tlink\n\t\tquestion {\n\t\t\tacRate\n\t\t\tdifficulty\n\t\t\tfreqBar\n\t\t\tfrontendQuestionId: questionFrontendId\n\t\t\tisFavor\n\t\t\tpaidOnly: isPaidOnly\n\t\t\tstatus\n\t\t\ttitle\n\t\t\ttitleSlug\n\t\t\thasVideoSolution\n\t\t\thasSolution\n\t\t\ttopicTags {\n\t\t\t\tname\n\t\t\t\tid\n\t\t\t\tslug\n\t\t\t}\n\t\t}\n\t}\n}',
    'operationName': 'questionOfToday'
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  var response = UrlFetchApp.fetch(url, options);
  

  var data = parseLeetCodeResponse(response)
  Logger.log(data);
  return data
}

function parseLeetCodeResponse(response) {
  Logger.log(response)
  var responseData = JSON.parse(response);
  var challenge = responseData.data.activeDailyCodingChallengeQuestion;
  var question = challenge.question;
  var parsedData = {
    "title": question.title,
    "date": challenge.date,
    "link": "https://leetcode.com" + challenge.link,
    "acRate": question.acRate,
    "difficulty": question.difficulty,
    "topicTags": question.topicTags.map(tag => tag.name)
  };
  return parsedData;
}