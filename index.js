const cool = require('cool-ascii-faces')
    const bodyParser = require('body-parser');
    const express = require('express')
    const request = require('request');
    const apiKey = '49a5c598f19d73fccdded27f90fcaf8f';
    const path = require('path')
    const { Pool } = require('pg');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
    });

const PORT = process.env.PORT || 5000

    express()
    .use(express.static(path.join(__dirname, 'public')))
    .use(bodyParser.urlencoded({ extended: true }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    //    .get('/', (req, res) => res.render('pages/index'))
    //    .get('/', function (req, res) { res.render('index');})

    .get('/', function (req, res) {res.render('index', {weather: null, error: null});})

    //.post('/', function (req, res) {res.render('index');})
    // .post('/', function (req, res) {res.render('index');console.log(req.body.city);})
    
    .post('/', function (req, res) {
	    let city = req.body.city;
	    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
	    request(url, function (err, response, body) {
		    if(err){
			res.render('index', {weather: null, error: 'Error, please try again'});
		    } else {
			let weather = JSON.parse(body)
			if(weather.main == undefined){
			    res.render('index', {weather: null, error: 'Error, please try again'});
			} else {
        let weatherText = `It is ${weather.main.temp} degrees in ${weather.name}!`;
        res.render('index', {weather: weatherText, error: null});
      }
    }
  });
})


    .get('/cool', (req, res) => res.send(cool()))
    .get('/times', (req, res) => res.send(showTimes()))
    .get('/db', async (req, res) => {
	    try {
		const client = await pool.connect()
		const result = await client.query('SELECT * FROM test_table');
		const results = { 'results': (result) ? result.rows : null};
		res.render('pages/db', results );
		client.release();
	    } catch (err) {
		console.error(err);
		res.send("Error " + err);
	    }
	})

    .listen(PORT, () => console.log(`Listening on ${ PORT }`))

    showTimes = () => {
  let result = ''
  const times = process.env.TIMES || 5
  for (i = 0; i < times; i++) {
    result += i + ' '
  }
  return result;
}