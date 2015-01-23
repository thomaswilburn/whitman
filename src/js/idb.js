/* global Promise */

define(function() {

  var Database = function(name, version, upgrade) {
    var self = this;
    this.ready = new Promise(function(ok, fail) {
      var req = window.indexedDB.open(name, version);
      req.onupgradeneeded = function(db) {
        self.db_ = req.result;
        if (upgrade) upgrade();
      };
      req.onsuccess = function(db) {
        self.db_ = req.result;
        ok();
      };
      req.onerror = fail;
    });
  };
  Database.prototype = {
    ready: null,
    db_: null,
    createStore: function(name, schema) {
      var self = this;
      schema = schema || {};
      return new Promise(function(ok) {
        var store = self.db_.createObjectStore(name, { keyPath: schema.key, autoIncrement: schema.autoIncrement });
        if (schema.index) {
          for (var key in schema.index) {
            var options = schema.index[key] || {};
            store.createIndex(key, key, options);
          }
        }
      });
    },
    transaction_: function(stores, write) {
      return this.db_.transaction(stores, write ? "readwrite" : undefined);
    },
    put: function(store, value, key) {
      var self = this;
      return new Promise(function(ok, fail) {
        var request = self.transaction_(store, true);
        request.objectStore(store).put(value, key);
        request.oncomplete = function() {
          ok();
        };
        request.onerror = fail;
      });
    },
    get: function(table, index, key) {
      if (!key) {
        key = index;
        index = null;
      }
      var self = this;
      return new Promise(function(ok, fail) {
        var transaction = self.transaction_(table);
        var store = transaction.objectStore(table);
        var request;
        if (index) {
          request = store.index(index).get(key);
        } else {
          request = store.get(key);
        }
        transaction.oncomplete = function() {
          ok(request.result);
        };
        request.onerror = fail;
      });
    },
    getAll: function(table, bounds) {
      var self = this;
      return new Promise(function(ok, fail) {
        var transaction = self.transaction_(table);
        var store = transaction.objectStore(table);
        var items = {};
        var req = store.openCursor();
        req.onsuccess = function() {
          var cursor = req.result;
          if (cursor) {
            var item = cursor.value;
            var key = cursor.key;
            items[key] = item;
            cursor.continue();
          } else {
            ok(items);
          }
        };
      });
    }
  };

  return Database;

});