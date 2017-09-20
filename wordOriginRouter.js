/*
 * Name / Database Interfaces
 * Author / T.T
 * Time / 2016-11-4
 */

//Basic components
const express = require('express');
const router = express.Router();
const db = require('./db');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');
const multiparty = require('multiparty');
const util = require('util');
const formidable = require('formidable');
const datetime = require('./datetime')
const ObjectId = require('mongodb').ObjectId;

const cheerio = require('cheerio'); //html parser
const httpClient = require('https');

router.use(logger('dev'));
router.use(bodyParser.urlencoded({ extended: true }));

var setHeadJson = function(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since');
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Content-Type', 'text/json');
}

router.get('/search', async(req, res) => {
    setHeadJson(res)
    let pagesize = parseInt(req.query.pagesize)
    let pagenum = parseInt(req.query.pagenum)
    let query = {
        collection: 'word_origin',
        condition: {
            name: { $regex: req.query.search },
        },
        projection: {},
        sort: {},
        limit: pagesize,
        skip: pagenum * pagesize
    };

    let result = await db.find(query)

    await res.send(result)
});


router.get('/getDetails', async(req, res) => {
    setHeadJson(res)

    let details = await db.find({
        collection: 'word_origin',
        condition: { _id: ObjectId(req.query.id) },
        limit: 1,
        skip: 0
    });

    await res.send(details)
});


module.exports = router;