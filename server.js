javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/parse', async (req, res) => {
    try {
        const url = req.query.url;
        
        if (!url || !url.includes('wildberries.ru')) {
            return res.status(400).json({ error: 'Неверная ссылка WB' });
        }

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        };

        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);

        // Парсим данные
        const title = $('h1').first().text() || $('[data-type="product-title"]').text() || 'Не найдено';
        const description = $('[data-type="description"]').text() || 'Не найдено';
        const price = $('[data-type="price"]').text() || 'Не найдено';
        const rating = $('[data-type="rating"]').text() || 'Не найдено';
        const reviewCount = $('[data-type="reviews-count"]').text() || '0';
        
        // Считаем фото
        const photos = $('img[data-type="product-photo"]').length || 0;
        
        // Считаем характеристики
        const characteristics = $('[data-type="characteristic"]').length || 0;

        res.json({
            success: true,
            data: {
                title,
                description,
                price,
                rating,
                reviewCount,
                photos,
                characteristics,
                url
            }
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при парсинге: ' + error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
