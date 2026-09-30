const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

const TOHOKU_PREFECTURES = {
  aomori: { name: '青森縣', tenkiId: '2' },
  iwate: { name: '岩手縣', tenkiId: '3' },
  miyagi: { name: '宮城縣', tenkiId: '4' },
  akita: { name: '秋田縣', tenkiId: '5' },
  yamagata: { name: '山形縣', tenkiId: '6' },
  fukushima: { name: '福島縣', tenkiId: '7' }
};

app.get('/api/forecast/:pref', async (req, res) => {
  const { pref } = req.params;
  const prefInfo = TOHOKU_PREFECTURES[pref];

  if (!prefInfo) return res.status(400).json({ error: '無效縣市' });

  try {
    const url = `https://tenki.jp/kouyou/map/${prefInfo.tenkiId}/`;
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const $ = cheerio.load(data);
    const spots = [];

    $('.kouyou-spot-item').each((i, el) => {
      const name = $(el).find('.spot-name').text().trim();
      const status = $(el).find('.status-text').text().trim();
      const forecastDate = $(el).find('.date-text').text().trim();

      if (name) {
        spots.push({
          spotName: name,
          tenkiStatus: status || '預測中',
          forecastDate: forecastDate || '更新中',
          source: 'Tenki.jp'
        });
      }
    });

    res.json({ prefecture: prefInfo.name, spots });
  } catch (error) {
    res.status(500).json({ error: '失敗' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running`));
