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

router.use(logger('dev'));
router.use(bodyParser.urlencoded({ extended: true }));

var setHeadJson = function(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since');
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader('Content-Type', 'text/json');
}

/*--------------------------------------------------------------------------------------------------------*/
/*--- ##Entrance Exam ------------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------------------------------*/
router.get('/getArticle', async(req, res) => {
    setHeadJson(res)
    let pagesize = parseInt(req.query.pagesize)
    let pagenum = parseInt(req.query.pagenum)

    let query = {
        collection: 'blog_article',
        condition: {},
        projection: { "details": 0 },
        sort: { time: -1 },
        limit: pagesize,
        skip: pagenum * pagesize
    };
    if (req.query.category) {
        query.condition = {
            "category": req.query.category
        }
    }
    if (req.query.keyword) {
        condition = {
            "keywords": req.query.keyword
        }
    }
    let articles = await db.find(query)

    await res.send(articles)
});
router.get('/getTop10Article', async(req, res) => {
    setHeadJson(res)
        // get datas
    let query = {
        collection: 'blog_article',
        condition: {},
        projection: { name: 1 },
        sort: { view_count: -1 },
        limit: 10,
        skip: 0
    };
    let articles = await db.find(query);

    await res.send(articles)
});
router.get('/getHotKeywords', async(req, res) => {
    setHeadJson(res)
        // get datas
    let query = {
        collection: 'blog_hot_keywords',
        condition: {},
        projection: {},
        sort: {},
        limit: 0,
        skip: 0
    };
    let keywords = await db.find(query)

    await res.send(keywords)
});
router.get('/getArticleDetails', async(req, res) => {
    setHeadJson(res)
        // get datas

    let details = await db.find({
        collection: 'blog_article',
        condition: { _id: ObjectId(req.query.id) },
        limit: 1,
        skip: 0
    });

    let comments = await db.find({
        collection: 'blog_article_comment',
        condition: { article_id: ObjectId(req.query.id) },
        projection: {},
        sort: { time: -1 },
        limit: 0,
        skip: 0
    });
    let result = await db.update({
        collection: 'blog_article',
        condition: { _id: ObjectId(req.query.id) },
        data: { view_count: details[0].view_count + 1 }
    });
    let article = {
        details: details[0],
        comments: comments
    }
    await res.send(article)
});

router.post('/newArticle', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));

    let result = await db.insert({
        collection: 'blog_article',
        data: {
            "name": data.name,
            "brief": data.brief,
            "category": data.category,
            "image": data.image,
            "keywords": data.keywords,
            "details": data.details,
            "time": new Date(),
            "view_count": 1
        }
    });
    res.send(result);
});

router.post('/setArticle', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));
    let result = await db.update({
        collection: 'blog_article',
        condition: { _id: ObjectId(data._id) },
        data: {
            "name": data.name,
            "brief": data.brief,
            "category": data.category,
            "image": data.image,
            "keywords": data.keywords,
            "details": data.details,
            "time": new Date()
        }
    });
    res.send(result);
});

//New Comment
router.post('/newComment', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));
    let result = await db.insert({
        collection: 'blog_article_comment',
        data: {
            "username": data.username,
            "email": data.email,
            "details": data.details,
            "time": new Date(),
            "article_id": ObjectId(data.id)
        }
    });
    res.send(result);
});

module.exports = router;