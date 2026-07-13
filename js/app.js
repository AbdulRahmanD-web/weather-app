let track = document.querySelector('.city_track');;

let next = document.querySelector('.next');

let prev = document.querySelector('.prev');

let card = document.querySelectorAll('.city_card');


let current = 0;

function slider(){
   track.style.transform = `translateX(-${current * 310}px)`; 
}


  next.addEventListener('click', function() {
   current++;
   if(current >= card.length){
    current = 0;
   }
   slider();
  });


  prev.addEventListener('click', function(){
    current--;

    if(current < 0){
        current = card.length - 1;
    }
 slider();
  })

slider();


const API_KEY = 'ba15430b391143cf91961703262706';

const cityMap = {
  'москва': 'Moscow',
  'санкт-петербург': 'Saint Petersburg',
  'спб': 'Saint Petersburg',
  'казань': 'Kazan',
  'краснодар': 'Krasnodar',
  'екатеринбург': 'Yekaterinburg',
  'новгород': 'Veliky Novgorod',
  'волгоград': 'Volgograd',
  'красноярск': 'Krasnoyarsk',
  'ростов': 'Rostov-on-Don',
  'новосибирск': 'Novosibirsk',
  'владивосток': 'Vladivostok',
  'сочи': 'Sochi',
  'калининград': 'Kaliningrad',
  'владикавказ': 'Vladikavkaz'
};

let lastRequestTime = 0;       

const REQUEST_DELAY = 120000;      

function canMakeRequest() {
  const now = Date.now();
  const timePassed = now - lastRequestTime;
  if (timePassed < REQUEST_DELAY) {
    const secondsLeft = Math.ceil((REQUEST_DELAY - timePassed) / 1000);
    alert(`⏳ Подождите ${secondsLeft} секунд перед новым запросом`);
    return false;
  }
  lastRequestTime = now;
  return true;
}

async function getWeather(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&lang=ru`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Город не найден');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      alert('❌ Не удалось соединиться с сервером. Проверьте интернет и попробуйте позже.');
    } else {
      alert('Ошибка: ' + error.message);
    }
    console.error(error);
  }
}


function updateUI(data) {
  if (!data) return;

  document.getElementById('cityName').textContent = data.location.name;

  const now = new Date(data.location.localtime);
  const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };
  document.getElementById('dateText').textContent = now.toLocaleDateString('ru-RU', options);

  document.getElementById('tempText').textContent = `☀️ +${data.current.temp_c}°`;
  document.getElementById('descText').textContent = data.current.condition.text;
  document.getElementById('humidityText').textContent = `Влажность ${data.current.humidity}%`;
  document.getElementById('sunriseText').textContent = data.forecast.forecastday[0].astro.sunrise;
  document.getElementById('sunsetText').textContent = data.forecast.forecastday[0].astro.sunset;

  document.getElementById('detailTemp').textContent = `${data.current.temp_c}°`;
  document.getElementById('detailHumidity').textContent = `${data.current.humidity}%`;
  document.getElementById('detailWind').textContent = `${data.current.wind_kph} м/с`;
  document.getElementById('detailPressure').textContent = `${data.current.pressure_mb} гПа`;

  if (data.forecast && data.forecast.forecastday) {
    renderForecast(data.forecast.forecastday);
  }else{
    document.getElementById('forecastContainer').innerHTML = '<p>Прогноз временно не доступен</p>'
  }
}

let conditionEl = document.getElementById('conditionText');

document.querySelector('.nav_btn').addEventListener('click', () => {
  let city = document.querySelector('.label_input').value.trim();
  if (!city) {
    alert('Введите название города');
    return;
  }
  conditionEl.style.display = 'block';
  conditionEl.textContent = '⏳ Загрузка данных...';

  let lowerCity = city.toLowerCase();
  let Listity = cityMap[lowerCity] || city;  
  if (!canMakeRequest()){
     conditionEl.style.display = 'none';
    return; 
  }  
  getWeather(city).then(data => {
    if (data) updateUI(data);
  })
  .finally(() =>{
    conditionEl.style.display = 'none';
  });
});

document.querySelector('.label_input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.querySelector('.nav_btn').click();
  }
});


function renderForecast(forecastData) {
  const container = document.getElementById('forecastContainer');
  container.innerHTML = ''; 

  forecastData.forEach(day => {
    const date = new Date(day.date);
    const fullDay = date.toLocaleDateString('ru-RU', { weekday: 'long' });
    const dayName = fullDay.charAt(0).toUpperCase() + fullDay.slice(1);
    const card = document.createElement('div');
    card.className = 'forecast__card';

    card.innerHTML = `
      <span class="forecast__day">${dayName}</span>
      <span class="forecast__icon">${getWeatherIcon(day.day.condition.text)}</span>
      <span class="forecast__temp">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</span>
      <span class="forecast__desc">${day.day.condition.text}</span>
    `;

    container.appendChild(card);
  });
}

function getWeatherIcon(condition) {
  const map = {
    'ясно': '☀️',
    'солнечно': '☀️',
    'облачно': '☁️',
    'пасмурно': '☁️',
    'небольшой дождь': '🌦️',
    'дождь': '🌧️',
    'снег': '❄️',
    'гроза': '⛈️'
  };

  for (let key in map) {
    if (condition.toLowerCase().includes(key)) {
      return map[key];
    }
  }
  return '🌤️'; 
}


