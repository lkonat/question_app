const sqlite3 = require("sqlite3").verbose();
class FileDBControler {
  constructor(param) {
    this.path = param && param.path ? param.path : false;
    this.db = false;
    this.create_table_querries = {
        files:`CREATE TABLE IF NOT EXISTS files(
            file_path TEXT PRIMARY KEY,
            file_name TEXT NOT NULL,
            ts integer NOT NULL
        );`,
        tasks:`CREATE TABLE IF NOT EXISTS tasks(
            task_id TEXT PRIMARY KEY,
            task_type TEXT NOT NULL,
            file_path TEXT NOT NULL,
            ts integer NOT NULL,
            source_path TEXT,
            destination_path TEXT,
            FOREIGN KEY(file_path) REFERENCES files(file_path)
        );`,
        bookmarks:`CREATE TABLE IF NOT EXISTS bookmarks(
          path TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT
      );`
    };
  }

  getBookMarks(){
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT * FROM bookmarks;`,(err, rows) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok: rows });
        }
      });
    });
  }
  removeBookMarks(args){
    return new Promise((resolve, reject) => {
      let path = args.path;
      console.log(path);
      this.db.run(`DELETE FROM bookmarks WHERE path =?`,[path],(err, success) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok:true});
        }
      });
    });
  }
  renameBookMarks(args){
    return new Promise((resolve, reject) => {
      let path = args.path;
      let name = args.name;
      this.db.run(`UPDATE bookmarks SET name = ? WHERE path =?`,[name,path],(err, success) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok:true});
        }
      });
    });
  }
  addBookMarks(args){
    return new Promise((resolve, reject) => {
            //safe
            let transactions = [];
            transactions.push({
                query: `INSERT INTO bookmarks(
                    path,
                    name,
                    description,
                    type
                    ) VALUES(?,?,?,?)`,
                data: [
                    args.path,
                    args.name,
                    args.description,
                    args.type
                ]
              });
            if (transactions.length > 0) {
                this.addCustomTransactions({
                    transactions: transactions
                }).then(outcome => {
                    return resolve(outcome);
                });
            } else {
                return resolve({ err: `could not built transactions` });
            }
    });
  }
  removeTask(args){
    return new Promise((resolve, reject) => {
      let task_id = args.task_id;
      this.db.run(`DELETE FROM tasks WHERE task_id =?`,[task_id],(err, success) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok:true});
        }
      });
    });
  }
  runQuery(query, data) {
    return new Promise((resolve, reject) => {
      this.db.all(query, data, (err, rows) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok: rows });
        }
      });
    });
  }
  getAllPaths(){
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT DISTINCT(tasks.file_path),files.file_name FROM files JOIN tasks ON files.file_path = tasks.file_path;`,(err, rows) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok: rows });
        }
      });
    });
  }
  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all(`SELECT *, tasks.* FROM files JOIN tasks ON files.file_path = tasks.file_path`,(err, rows) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok: rows });
        }
      });
    });
  }

  getTaskForFile(args){
    return new Promise((resolve, reject) => {
      if(!args.file_path){
         return resolve({err:`file_path missing`});
      }
      this.db.all(`SELECT *, tasks.* FROM files JOIN tasks ON files.file_path = tasks.file_path WHERE files.file_path=?`, [args.file_path], (err, rows) => {
        if (err) {
          return resolve({ err: err.toString() });
        } else {
          return resolve({ ok: rows });
        }
      });
    });
  }
  addFile(args){
    return new Promise((resolve, reject) => {
        let ts = new Date().getTime();
        if(!ts){
            return resolve({ err: `ts is missing` });
        }
        if (!args.file_name) {
            return resolve({ err: `file name was not provided` });
        }
        if (!args.file_path) {
            return resolve({ err: `file_path  was not provided` });
        }
        //safe 
        let transactions = [];
        transactions.push({
            query: `INSERT INTO files(
                file_path,
                file_name,
                ts
                ) VALUES(?,?,?)`,
            data: [
                args.file_path,
                args.file_name,
                ts
            ]
          });

        if (transactions.length > 0) {
            this.addCustomTransactions({
                transactions: transactions
            }).then(outcome => {
                return resolve(outcome);
            });
        } else {
            return resolve({ err: `could not built transactions` });
        }
    });
  }
  addTask(args){
    return new Promise((resolve, reject) => {
        let allowedTasks={scp:true};
        let task_id = this.makeid();
        let ts = new Date().getTime();
        if(!allowedTasks[args.task_type]){
            return resolve({ err: `task type error` });
        }
        if(!args.file_path){
          return resolve({ err: `file_path is missing` });
        }
        if(!ts){
          return resolve({ err: `ts is missing` });
        }
        if(args.task_type ==='scp'){
             if (!args.source_path) {
                return resolve({ err: `source_path was not provided` });
             }
             if (!args.destination_path) {
                return resolve({ err: `destination_path was not provided` });
             }
        }
        //safe
        let transactions = [];

        transactions.push({
            query: `INSERT INTO tasks(
                task_id,
                task_type,
                file_path,
                ts,
                source_path,
                destination_path
                ) VALUES(?,?,?,?,?,?)`,
            data: [
                task_id,
                args.task_type,
                args.file_path,
                ts,
                args.source_path?args.source_path:null,
                args.destination_path?args.destination_path:null
            ]
          });

        if (transactions.length > 0) {
            this.addCustomTransactions({
                transactions: transactions
            }).then(outcome => {
                return resolve(outcome);
            });
        } else {
            return resolve({ err: `could not built transactions` });
        }
    });
  }


  runALL(db, query, all_data, idx, callBack) {
    if (all_data[idx]) {
      db.run(query, all_data[idx], (err, success) => {
        if (err) {
          return callBack({ err: err.toString() });
        } else {
          this.runALL(db, query, all_data, idx + 1, callBack);
        }
      });
    } else {
      return callBack({ ok: true });
    }
  }

  runEachQuery(db, all_data, idx, callBack) {
    if (all_data[idx]) {
      db.run(all_data[idx].query, all_data[idx].data, (err, success) => {
        if (err) {
          return callBack({ err: err.toString() });
        } else {
          this.runEachQuery(db, all_data, idx + 1, callBack);
        }
      });
    } else {
      return callBack({ ok: true });
    }
  }

  addTransactions(args) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN");
        this.runALL(this.db, args.query, args.transactions, 0, outcome => {
          if (outcome.ok) {
            this.db.run("commit");
            return resolve({ ok: true });
          } else {
            this.db.run("rollback");
            return resolve({ err: outcome.err });
          }
        });
      });
    });
  }

  addCustomTransactions(args) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN");
        this.runEachQuery(this.db, args.transactions, 0, outcome => {
          if (outcome.ok) {
            this.db.run("commit");
            return resolve({ ok: true });
          } else {
            this.db.run("rollback");
            return resolve({ err: outcome.err });
          }
        });
      });
    });
  }

  load(path, callBack) {
    let self = this;
    this.path = path;
    this.db = new sqlite3.Database(this.path, function(err) {
      if (err) {
        console.log(err);
        callBack(false);
      } else {
        self.db.run("PRAGMA journal_mode = WAL;");
        callBack(self.db);
      }
    });
  }

  makeid() {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  prepare(args) {
    return new Promise((resolve, reject) => {
      if (args.create) {
        this.createDb().then(res => {
          if (res.ok) {
            return resolve(true);
          } else {
            console.log(res, "DATABASE CREATION database");
            return reject(`could not create database,error occured`);
          }
        });
      } else {
        return resolve(true);
      }
    });
  }
  createDb() {
    let that = this;
    let promise = new Promise((resolve, reject) => {
      let global_success = true,
        err_stack = "";
      var all_count = 0;
      function notify() {
        all_count--;
        if (all_count <= 0) {
          if (!global_success) {
            try {
              that.db.run("ROLLBACK;");
            } catch (e) {
              console.log(e);
            }
            resolve({ err: err_stack });
          } else {
            that.db.run("COMMIT;", function(err, success) {
              if (err) {
                resolve({ err: err.message });
              } else {
                if (global_success) {
                  resolve({ ok: true });
                } else {
                  resolve({ err: err_stack });
                }
              }
            });
          }
        }
      }
      that.db.serialize(function() {
        that.db.run("BEGIN TRANSACTION;");
        for (var elt in that.create_table_querries) {
          console.log(elt, "elt");
          all_count++;
          that.db.run(that.create_table_querries[elt], function(err, success) {
            if (err) {
              console.log(err, elt);
              global_success = false;
              err_stack += "\n" + err;
            }
            notify();
          });
        }
      });
    });
    return promise;
  }
}
let databaseControler = new FileDBControler();
exports.controler = databaseControler;
