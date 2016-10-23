(function (d, idb) {
  'use strict';

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

  ////////////////////////////////////////////////////////////////////////////////////
  var app = {
    hasRequestPending: false,
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    menuDialog: document.querySelector('.menu-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  // document.getElementById('btnAddCity').addEventListener('click', function () {
  //   // Add the newly selected city
  //   var select = document.getElementById('selectCityToAdd');
  //   var selected = select.options[select.selectedIndex];
  //   var key = selected.value;
  //   var label = selected.textContent;
  //   app.getForecast(key, label);
  //   app.selectedCities.push({
  //     key: key,
  //     label: label
  //   });
  //   app.saveSelectedCities();
  //   app.toggleAddDialog(false);
  // });

  // document.getElementById('btnAddCancel').addEventListener('click', function () {
  //   // Close the add new city dialog
  //   app.toggleAddDialog(false);
  // });

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/
  app.hideAllCards = function () {
    app.container.querySelectorAll('.card').forEach(function (elem) {
      elem.setAttribute('hidden', true);
    });
  };

  app.toogleMenuDialog = function (visible) {
    if (visible) {
      app.menuDialog.classList.add('menu-container--visible');
    } else {
      app.menuDialog.classList.remove('menu-container--visible');
    }
  }

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.init = function () {
    balance.update(52678.90);
    balance.show();

    // income.add({ val: 99.8, desc: 'jantar', date: 20161001 });
    // income.add({ val: 35.67, desc: 'táxi', date: 20160124 });
    // income.add({ val: 7.08, desc: 'suco', date: 20161219 });
    // income.add({ val: 9.98, desc: 'sanduíche', date: 20160221 });
    // income.add({ val: 199.85, desc: 'mercado', date: 20160821 });
    income.update();
    income.show();

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

  // app.selectedCities = localStorage.selectedCities;
  // if (app.selectedCities) {
  //   app.selectedCities = JSON.parse(app.selectedCities);
  //   app.selectedCities.forEach(function (city) {
  //     app.getForecast(city.key, city.label);
  //   });
  // } else {
  //   app.updateForecastCard(initialWeatherForecast);
  //   app.selectedCities = [{
  //     key: initialWeatherForecast.key,
  //     label: initialWeatherForecast.label
  //   }];
  //   app.saveSelectedCities();
  // }

  // if('serviceWorker' in navigator) {
  //   navigator.serviceWorker
  //            .register('./service-worker.js')
  //            .then(function() { console.log('Service Worker Registered'); });
  // }

  app.init();

  (window.onhashchange = function () {
    console.log('hash:', location.hash);
    app.toogleMenuDialog(false);
    app.toggleAddDialog(false);
    switch (location.hash) {
      case "#menu":
        {
          app.toogleMenuDialog(true);
          break;
        }
      case "#new":
        {
          app.toggleAddDialog(true);
          break;
        }
      case "#more-income":
        {
          break;
        }
    }
  })();

})(document, idbKeyval);