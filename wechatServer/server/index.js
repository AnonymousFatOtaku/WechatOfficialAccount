const theatersCrawler = require('./crawler/theatersCrawler');

(async () => {
  // 爬取数据
  await theatersCrawler();
})()