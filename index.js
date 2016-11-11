'use strict';

const Client = require('swagger-client');
const superagent = require('superagent');
const _ = require('underscore');

class MyClient{
  constructor(spec, cb){
    this.spec = spec;
    if(cb){
      this.ready(cb);
    }
  }

  agent(){
    return new MyAgent(this.client);
  }
  ready(cb){
    new Client({
      spec: this.spec,
      usePromise: true,
    })
    .then((client) => {
      this.client = client;
      this.createMethods();
      cb(null);
    }).catch(cb);
  }

  createMethods(){
    _.each(this.client.apis, (obj, tag) => {
      if(typeof obj === 'object'){
        _.each(obj.apis, (obj, operationId) => {
          this.createMethod(tag, operationId);
        });
      }
    });
  }

  createMethod(tag, operationId){
    if(!this[tag]){
      this[tag] = {};
    }

    this[tag][operationId] = (data, opts) => {
      return this.client[tag][operationId](data, opts);
    };
  }
}


class MyAgent{
  constructor(client){
    this.agent = superagent.agent();
    this.client = client;
    this.createMethods();
  }

  createMethods(){
    _.each(this.client.apis, (obj, tag) => {
      if(typeof obj === 'object'){
        _.each(obj.apis, (obj, operationId) => {
          this.createMethod(tag, operationId);
        });
      }
    });
  }

  createMethod(tag, operationId){
    if(!this[tag]){
      this[tag] = {};
    }

    this[tag][operationId] = (data, opts) => {
      opts = opts || {};
      opts.connectionAgent = this.agent;
      return this.client[tag][operationId](data, opts);
    };
  }
}

module.exports = MyClient;
