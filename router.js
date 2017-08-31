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
        // get datas
    let condition = {};
    if (req.query.category) {
        condition = {
            "category": req.query.category
        }
    }
    if (req.query.keyword) {
        condition = {
            "keywords": req.query.keyword
        }
    }
    let articles = await db.find('blog_article', condition, { "details": 0 }, { time: -1 })

    await res.send(articles)
});
router.get('/getTop10Article', async(req, res) => {
    setHeadJson(res)
        // get datas
    let collection = 'blog_article';
    let condition = {};
    let select = { name: 1 };
    let sort = { view_count: -1 };
    let limit = 10;
    let skip = 0;
    let articles = await db.find(collection, condition, select, sort, limit, skip);

    await res.send(articles)
});
router.get('/getHotKeywords', async(req, res) => {
    setHeadJson(res)
        // get datas
    let keywords = await db.find('blog_hot_keywords', {}, {}, {})

    await res.send(keywords)
});
router.get('/getArticleDetails', async(req, res) => {
    setHeadJson(res)
        // get datas
    let condition = {};
    if (req.query.id) {
        condition = {
            "_id": ObjectId(req.query.id)
        }
    }
    let details = await db.find('blog_article', { _id: ObjectId(req.query.id) });
    let comments = await db.find('blog_article_comment', { article_id: ObjectId(req.query.id) }, {}, { time: -1 });
    let result = await db.update('blog_article', { _id: ObjectId(req.query.id) }, { view_count: details[0].view_count + 1 });
    let article = {
        details: details[0],
        comments: comments
    }
    await res.send(article)
});

router.post('/newArticle', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));
    let result = await db.insert('blog_article', {
        "name": data.name,
        "brief": data.brief,
        "category": data.category,
        "image": data.image,
        "keywords": data.keywords,
        "details": data.details,
        "time": new Date(),
        "view_count": 1
    });
    res.send(result);
});

router.post('/setArticle', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));
    let result = await db.update('blog_article', { _id: ObjectId(data._id) }, {
        "name": data.name,
        "brief": data.brief,
        "category": data.category,
        "image": data.image,
        "keywords": data.keywords,
        "details": data.details,
        "time": new Date()
    });
    res.send(result);
});

//New Comment
router.post('/newComment', async(req, res) => {
    setHeadJson(res);
    let data = JSON.parse(JSON.stringify(req.body.data));
    let result = await db.insert('blog_article_comment', {
        "username": data.username,
        "email": data.email,
        "details": data.details,
        "time": new Date(),
        "article_id": ObjectId(data.id)
    });
    res.send(result);
});

// router.post('/newStudentEntranceExam', function(req, res) {
//     setHeadJson(res);
//     var data = JSON.parse(JSON.stringify(req.body.data)); //获取传来的数据数组，exam_id, user_id, details
//     var sql = "INSERT INTO student_entrance_exam (exam_id, student_id, time, details) VALUES ";
//     for (var i = 0; i < data.length; i++) {
//         sql += "('" + data[i].exam_id + "', " + data[i].student_id + ", NOW(), " + data[i].details + "),";
//     }
//     sql = sql.substring(0, sql.length - 1) + ';';

//     db.query(sql, function(err, rows, fields) {
//         if (!err) {
//             res.send(rows);
//         } else {
//             res.send(err);
//         }
//     });
// });

module.exports = router;