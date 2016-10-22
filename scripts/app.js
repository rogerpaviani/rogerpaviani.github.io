(function (d, idb) {
  'use strict';

  // const currency = function(amount) {
  //   var i = parseFloat(amount);
  //   if(isNaN(i)) { i = 0.00; }
  //   var minus = '';
  //   if(i < 0) { minus = '-'; }
  //   i = Math.abs(i);
  //   i = parseInt((i + .005) * 100);
  //   i = i / 100;
  //   s = new String(i);
  //   if(s.indexOf('.') < 0) { s += '.00'; }
  //   if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
  //   s = minus + s;
  //   return s;
  // };


  ////////////////////////////////////////////////////////////////////////////////////
  const balance = {
    card: d.querySelector('.card.balance'),
    update: function (v) {
      idbKeyval.set('balance', v)
        .then(() => balance.card.querySelector('.stitle').textContent = v.toLocaleString('pt-br'))
        .catch(err => console.log('balance.update failed!', err));
    },
    show: function () {
      this.card.removeAttribute('hidden');
    },
    hide: function () {
      this.card.removeAttribute('hidden');
    },
  };

  balance.update(52678.90);
  balance.show();

  ////////////////////////////////////////////////////////////////////////////////////
  const income = {
    p: new Promise(function (resolve) {
      resolve()
    }),
    card: d.querySelector('.card.income'),
    template: d.querySelector('.card.income .entryTemplate'),
    container: d.querySelector('.card.income .entries'),
    show: function () {
      this.card.removeAttribute('hidden');
    },
    hide: function () {
      this.card.removeAttribute('hidden');
    },
    update: function () {
      var c = this.container;
      this.p.then(() => income._get().then((ii) => {
        while (c.lastChild) {
          c.removeChild(c.lastChild);
        }!!ii && ii.forEach(function (i, n) {
          //escrever no card
          //{ val: 99.8, desc: 'jantar', date: 20161001 }
          var entry = income.template.cloneNode(true);
          entry.classList.remove('entryTemplate');
          entry.querySelector('.t').textContent = i.desc;
          entry.querySelector('.v').textContent = i.val;
          entry.querySelector('.d').textContent = i.date;
          entry.removeAttribute('hidden');
          c.appendChild(entry);
        });
      }));
    },
    add: function (i) {
      this.p = this.p.then(() => {
        return income._get().then((ii) => {
          ii = ii || [];
          ii.push(i);
          ii = ii.sort(function (a, b) {
            return a.date - b.date
          });
          return income._set(ii).then(() => {
            //income.update();
          });
        });
      });
    },
    remove: function () {
      //
    },
    _get: function () {
      return idbKeyval.get('income')
        .catch(err => console.log('income.get failed!', err));
    },
    _set: function (ii) {
      return idbKeyval.set('income', ii)
        .catch(err => console.log('income.set failed!', err));
    },
  };

  // income.add({ val: 99.8, desc: 'jantar', date: 20161001 });
  // income.add({ val: 35.67, desc: 'táxi', date: 20160124 });
  // income.add({ val: 7.08, desc: 'suco', date: 20161219 });
  // income.add({ val: 9.98, desc: 'sanduíche', date: 20160221 });
  // income.add({ val: 199.85, desc: 'mercado', date: 20160821 });
  income.update();
  income.show();

  ////////////////////////////////////////////////////////////////////////////////////
  // app.atualizaSaldo = function(novo) {
  //   if (!!novo) {
  //     return idbKeyval.set('saldo', novo)
  //       .then(() => app.atualizaSaldo())
  //       .catch(err => console.log('Falha atualizar saldo!', err));      
  //   }
  //   else {
  //     return idb.get('saldo').then(val => {
  //       d.querySelector('.saldo .stitle').textContent = val.toLocaleString();
  //     });
  //   }
  // };

  // idbKeyval.set('hello', 'world')
  //   .then(() => console.log('It worked!'))
  //   .catch(err => console.log('It failed!', err));
  // idbKeyval.set('foo', 'bar');

  // app.atualizaSaldo(678.99).then(v => {
  // d.querySelector('.saldo').removeAttribute('hidden');
  // });





  // if ('userData' in localStorage)
  // {
  //   d.querySelector('.main').classList.remove('hide');
  //   alert('ok!');
  // }
  // else{
  //   alert('not ok!');
  //   console.log('UserData not set. Redirecting to login.');
  //   location.href = 'fb-login.html';
  // }

  var initialWeatherForecast = {
    key: 'newyork',
    label: 'New York, NY',
    currently: {
      time: 1453489481,
      summary: 'Clear',
      icon: 'partly-cloudy-day',
      temperature: 52.74,
      apparentTemperature: 74.34,
      precipProbability: 0.20,
      humidity: 0.77,
      windBearing: 125,
      windSpeed: 1.52
    },
    daily: {
      data: [{
        icon: 'clear-day',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'rain',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'snow',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'sleet',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'fog',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'wind',
        temperatureMax: 55,
        temperatureMin: 34
      }, {
        icon: 'partly-cloudy-day',
        temperatureMax: 55,
        temperatureMin: 34
      }]
    }
  };

  var app = {
    hasRequestPending: false,
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('btnRefresh').addEventListener('click', function () {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  // document.getElementById('btnAdd').addEventListener('click', function () {
  //   app.toggleAddDialog(true);
  // });

  document.getElementById('btnAddCity').addEventListener('click', function () {
    // Add the newly selected city
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getForecast(key, label);
    app.selectedCities.push({
      key: key,
      label: label
    });
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

  document.getElementById('btnAddCancel').addEventListener('click', function () {
    // Close the add new city dialog
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
  //window.app = app;
  app.hideAllCards = function () {
    app.container.querySelectorAll('.card').forEach(function (elem) {
      elem.setAttribute('hidden', 'hidden');
    });
  };

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function (data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.title').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.currently.summary;
    card.querySelector('.stitle').textContent =
      new Date(data.currently.time * 1000);
    card.querySelector('.current .icon').classList.add(data.currently.icon);
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.currently.temperature);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round(data.currently.apparentTemperature);
    card.querySelector('.current .precip').textContent =
      Math.round(data.currently.precipProbability * 100) + '%';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.currently.humidity * 100) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.currently.windSpeed);
    card.querySelector('.current .wind .direction').textContent =
      data.currently.windBearing;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.daily.data[i];
      if (daily && nextDay) {
        nextDay.querySelector('.stitle').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(daily.icon);
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.temperatureMax);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.temperatureMin);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function (key, label) {
    var url = 'https://publicdata-weather.firebaseio.com/';
    url += key + '.json';
    if ('caches' in window) {
      caches.match(url).then(function (response) {
        if (response) {
          response.json().then(function (json) {
            // Only update if the XHR is still pending, otherwise the XHR
            // has already returned and provided the latest data.
            if (app.hasRequestPending) {
              console.log('updated from cache');
              json.key = key;
              json.label = label;
              app.updateForecastCard(json);
            }
          });
        }
      });
    }
    // Make the XHR to get the data, then update the card
    app.hasRequestPending = true;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.hasRequestPending = false;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function () {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function (key) {
      app.getForecast(key);
    });
  };

  // Save list of cities to localStorage, see note below about localStorage.
  app.saveSelectedCities = function () {
    var selectedCities = JSON.stringify(app.selectedCities);
    // IMPORTANT: See notes about use of localStorage.
    localStorage.selectedCities = selectedCities;
  };

  app.selectedCities = localStorage.selectedCities;
  if (app.selectedCities) {
    app.selectedCities = JSON.parse(app.selectedCities);
    app.selectedCities.forEach(function (city) {
      app.getForecast(city.key, city.label);
    });
  } else {
    app.updateForecastCard(initialWeatherForecast);
    app.selectedCities = [{
      key: initialWeatherForecast.key,
      label: initialWeatherForecast.label
    }];
    app.saveSelectedCities();
  }

  // if('serviceWorker' in navigator) {
  //   navigator.serviceWorker
  //            .register('./service-worker.js')
  //            .then(function() { console.log('Service Worker Registered'); });
  // }

  (window.onhashchange = function () {
    console.log('hash:', location.hash);
    app.toggleAddDialog(false);
    switch (location.hash) {
      case "#new":
        {
          app.toggleAddDialog(true);
          break;
        }
      case "#more-income":
        {
          break;
        }
      case "#refresh":
        {
          break;
        }
    }
  })();

})(document, idbKeyval);