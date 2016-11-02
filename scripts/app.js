(function (w, d, l, idb) {
  'use strict';

  window.onerror = function () {
    alert(JSON.stringify(arguments));
  };

  ////////////////////////////////////////////////////////////////////////////////////
  const balance = {
    section: d.querySelector('section.balance'),
    update: function (v) {
      idbKeyval.set('balance', v)
        .then(() => balance.section.querySelector('.currency').textContent = v.toLocaleString('pt-br'))
        .catch(err => console.log('balance.update failed!', err));
    },
    show: function () {
      this.section.removeAttribute('hidden');
    },
    hide: function () {
      this.section.setAttribute('hidden', true);
    },
    init: function () {
      balance.update(52678.90);
      balance.show();
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////
  const income = {
    p: new Promise(function (resolve) {
      resolve()
    }),
    section: d.querySelector('section.income'),
    template: d.querySelector('section.income .entryTemplate'),
    container: d.querySelector('section.income .entries'),
    show: function () {
      this.section.removeAttribute('hidden');
    },
    hide: function () {
      this.section.setAttribute('hidden', true);
    },
    update: function () {
      var c = this.container;
      this.p.then(() => income._get().then((ii) => {
        while (c.lastChild) {
          c.removeChild(c.lastChild);
        }!!ii && ii.forEach(function (i, n) {
          //escrever no section
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
    init: function () {
      // income.add({ val: 99.8, desc: 'jantar', date: 20161001 });
      // income.add({ val: 35.67, desc: 'táxi', date: 20160124 });
      // income.add({ val: 7.08, desc: 'suco', date: 20161219 });
      // income.add({ val: 9.98, desc: 'sanduíche', date: 20160221 });
      // income.add({ val: 199.85, desc: 'mercado', date: 20160821 });
      income.update();
      income.show();
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////
  const app = {
    hasRequestPending: false,
    isLoading: true,
    spinner: document.querySelector('.loader'),
    container: document.querySelector('main'),
    addDialog: document.querySelector('.dialog-container'),
  };

  app.hideAllSections = function () {
    app.container.querySelectorAll('section').forEach(function (elem) {
      elem.setAttribute('hidden', true);
    });
  };

  app.toggleMenu = function (visible) {
    if (visible) {
      document.querySelector('header details').setAttribute('open', true);
    } else {
      document.querySelector('header details').removeAttribute('open');
    }
  };

  // app.toggleAddDialog = function (visible) {
  //   if (visible) {
  //     app.addDialog.classList.add('dialog-container--visible');
  //   } else {
  //     app.addDialog.classList.remove('dialog-container--visible');
  //   }
  // };

  app.init = function () {
    balance.init();
    income.init();

    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }

  };

  (window.onhashchange = function () {
    switch (l.hash) {
      default: {
        app.hideAllSections();
        app.toggleMenu(false);
        app.container.querySelectorAll('section.' + (l.hash.substr(1) || 'default')).forEach(function (elem) {
          elem.removeAttribute('hidden');
        });
      }
    }
  })();

  app.init();

  // if('serviceWorker' in navigator) {
  //   navigator.serviceWorker
  //            .register('./service-worker.js')
  //            .then(function() { console.log('Service Worker Registered'); });
  // }

})(window, document, location, idbKeyval);