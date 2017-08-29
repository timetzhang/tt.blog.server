const MongoClient = require('mongodb').MongoClient;
const DB_CONN_STR = 'mongodb://localhost:27017/zhangtt';

module.exports = {
    find: function(collection, condition, projection, sort) {
        return new Promise(
            function(resolve) {
                MongoClient.connect(DB_CONN_STR, function(err, db) {
                    //连接到表 site
                    var col = db.collection(collection);
                    col.find(condition, projection).sort(sort).toArray(
                        function(err, result) {
                            if (err) {
                                console.log('Error:' + err);
                                return;
                            }
                            resolve(result);
                            db.close();
                        });
                });
            }
        );
    },
    insert: function(collection, data) {
        return new Promise(
            function(resolve) {
                MongoClient.connect(DB_CONN_STR, function(err, db) {
                    //连接到表 site
                    var col = db.collection(collection);
                    col.insert(data, function(err, result) {
                        if (err) {
                            console.log('Error:' + err);
                            return;
                        }
                        resolve(result);
                        db.close();
                    });
                });
            }
        )
    },
    update: function(collection, condition, data) {
        return new Promise(
            function(resolve) {
                MongoClient.connect(DB_CONN_STR, function(err, db) {
                    //连接到表 site
                    var col = db.collection(collection);
                    col.update(condition, { '$set': data }, function(err, result) {
                        if (err) {
                            console.log('Error:' + err);
                            return;
                        }
                        resolve(result);
                        db.close();
                    });
                });
            }
        )
    },
}