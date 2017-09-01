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

router.get('/searchBook', async(req, res) => {
    setHeadJson(res)
    let pagesize = parseInt(req.query.pagesize)
    let pagenum = parseInt(req.query.pagenum)
    let query = {
        collection: 'books',
        condition: {
            name: { $regex: req.query.search }
        },
        projection: {},
        sort: {},
        limit: pagesize,
        skip: pagenum * pagesize
    };

    let books = await db.find(query)

    await res.send(books)
});

router.post('/newBook', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));

    let result = await db.insert({
        collection: 'books',
        data: {
            "name": data.name,
            "image": data.image,
            "subject": data.subject,
            "type": data.type,
            "price": data.price,
            "status": '在库',
            "isbn": data.isbn,
            "time": new Date()
        }
    });
    res.send(result);
});

// router.get('/getArticleDetails', async(req, res) => {
//     setHeadJson(res)
//         // get datas

//     let details = await db.find({
//         collection: 'blog_article',
//         condition: { _id: ObjectId(req.query.id) },
//         limit: 1,
//         skip: 0
//     });

//     let comments = await db.find({
//         collection: 'blog_article_comment',
//         condition: { article_id: ObjectId(req.query.id) },
//         projection: {},
//         sort: { time: -1 },
//         limit: 0,
//         skip: 0
//     });
//     let result = await db.update({
//         collection: 'blog_article',
//         condition: { _id: ObjectId(req.query.id) },
//         data: { view_count: details[0].view_count + 1 }
//     });
//     let article = {
//         details: details[0],
//         comments: comments
//     }
//     await res.send(article)
// });



// router.post('/setArticle', async(req, res) => {
//     setHeadJson(res);
//     let data = JSON.parse(JSON.stringify(req.body.data));
//     let result = await db.update({
//         collection: 'blog_article',
//         condition: { _id: ObjectId(data._id) },
//         data: {
//             "name": data.name,
//             "brief": data.brief,
//             "category": data.category,
//             "image": data.image,
//             "keywords": data.keywords,
//             "details": data.details,
//             "time": new Date()
//         }
//     });
//     res.send(result);
// });

module.exports = router;