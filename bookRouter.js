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

router.get('/searchBook', async(req, res) => {
    setHeadJson(res)
    let pagesize = parseInt(req.query.pagesize)
    let pagenum = parseInt(req.query.pagenum)
    let query = {
        collection: 'books',
        condition: {
            '$or': [
                { name: { $regex: req.query.search } },
                { isbn: { $regex: req.query.search } }
            ]
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

/**
 * 从douban.com爬虫到书的内容
 */
router.get('/searchOnlineBook', async(req, res) => {
    setHeadJson(res);
    var book = {};

    httpClient.get('https://book.douban.com/subject_search?search_text=' + req.query.search, result => {
        var html = ''; //用来存储请求网页的整个html内容
        var titles = [];
        result.setEncoding('utf-8'); //防止中文乱码
        //监听data事件，每次取一块数据
        result.on('data', function(chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        result.on('end', function() {
            var $ = cheerio.load(html); //采用cheerio模块解析html
            book.name = $('h2 a:first-child').text().trim(); //书名
            book.image = $('img:first-child').attr('src'); //书图片

            var pub = $('.pub').text().trim().split('/');
            if (pub.length > 4) { //有2个作者
                book.author = pub[0].trim() + '/' + pub[1].trim();
                book.publisher = pub[2].trim();
                book.year = pub[3].trim();
                book.price = pub[4].trim();
            } else {
                book.author = pub[0].trim();
                book.publisher = pub[1].trim();
                book.year = pub[2].trim();
                book.price = pub[3].trim();
            }

            res.send(book);
        })
    });


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