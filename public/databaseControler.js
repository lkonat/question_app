const sqlite3 = require('sqlite3').verbose();
class DatabaseControler{
  constructor(param){
    this.path = param && param.path? param.path:false;
    this.db = false;
    this.create_table_querries={
        quizes:`CREATE TABLE IF NOT EXISTS quizes(
              id TEXT PRIMARY KEY,
              actor_id TEXT NOT NULL,
              ts integer NOT NULL,
              name TEXT NOT NULL
      );`,
      questions:`CREATE TABLE IF NOT EXISTS questions(
              id TEXT PRIMARY KEY,
              quiz_id TEXT NOT NULL,
              question TEXT,
              answers TEXT,
              correct_answer TEXT,
              topic TEXT,
              time_in_seconds integer NOT NULL,
              FOREIGN KEY (quiz_id) REFERENCES quizes (id)
      );`
    };
  }

  addCustomTransactions(args){
    return new Promise((resolve, reject) => {
      this.db.serialize(()=>{
        this.db.run("BEGIN");
        this.runEachQuery(this.db,args.transactions,0,(outcome)=>{
          if(outcome.ok){
            this.db.run('commit');
            return resolve({ok:true});
          }else {
            this.db.run('rollback');
            return resolve({err:outcome.err});
          }
        });
      });
    });
   }
   runEachQuery(db,all_data,idx,callBack){
    if(all_data[idx]){
      db.run(all_data[idx].query,all_data[idx].data,(err,success)=>{
        if(err){
          return callBack({err:err.toString()});
        }else {
         this.runEachQuery(db,all_data,(idx+1),callBack);
        }
      });
    }else {
       return callBack({ok:true});
    }
  }
getOneQuiz(args){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM quizes JOIN questions ON questions.quiz_id = quizes.id where quizes.id =?`,[args.quiz_id],(err,rows)=>{
            if(err){
                return resolve({err:err.toString()});
            }else {
                return resolve({ok:rows});
            }
            });
    }); 
}
deleteOneQuestion(args){
    return new Promise((resolve, reject) => {
        this.db.run(`DELETE FROM questions WHERE id =?`,[args.question_id],(err,rows)=>{
            if(err){
                return resolve({err:err.toString()});
            }else {
                return resolve({ok:true});
            }
        });
    }); 
}
deleteQuiz(args){
    return new Promise((resolve, reject) => {
        if(!args.quiz_id){
            return resolve({err:'no id'});
        }
        this.addCustomTransactions({
            transactions:[
              {
                query:`DELETE FROM quizes WHERE id =?`,
                data:[args.quiz_id]
              },
              {
                query:`DELETE FROM questions WHERE quiz_id =?`,
                data:[args.quiz_id]
              },
            ]
          }).then((outcome)=>{
             return resolve(outcome);
          });
    }); 
}
getQuizes(){
    return new Promise((resolve, reject) => {
        this.db.all(`SELECT * FROM quizes`,(err,rows)=>{
            if(err){
              return resolve({err:err.toString()});
            }else {
              return resolve({ok:rows});
            }
          });
    }); 
}
createQuiz(args){
    return new Promise((resolve, reject) => {
        if(!args.actor_id){
            return resolve({err:'no user name provided'});
          }
         if(!args.name){
           return resolve({err:'no name provided'});
         }
         let id = this.makeid();
         this.db.run(`INSERT INTO quizes(id,actor_id,ts,name) VALUES(?,?,?,?)`,[ id,args.actor_id,new Date().getTime(), args.name],(err,success)=> {
             if (err) {
               return resolve({err:err.toString()});
             }else {
               return resolve({ok:true,quiz_id:id});
             }
         });
    });
}
getOneQuestion(args){
    return new Promise((resolve, reject) => {
        this.db.get(`SELECT * FROM questions WHERE id=?`,[args.question_id],(err,row)=> {
            if (err) {
              return resolve({err:err.toString()});
            }else {
              return resolve({ok:row});
            }
        });
    });
}
updateOneQuestion(args){
    return new Promise((resolve, reject) => {
        this.db.run(`UPDATE questions SET question =?, answers =?,correct_answer =?,topic =?,time_in_seconds=? WHERE id=?`,[args.question,args.answers,args.correct_answer,args.topic,args.time_in_seconds,args.question_id],(err,success)=> {
            if (err) {
              return resolve({err:err.toString()});
            }else {
              return resolve({ok:true});
            }
        });
    });
}
addQuestionToQuiz(args){
  return new Promise((resolve, reject) => {
    if(!args.quiz_id){
        return resolve({err:'no quiz_id provided'});
      }
     if(!args.question){
       return resolve({err:'no question provided'});
     }
     if(!args.correct_answer){
       return resolve({err:'no correct_answer provided'});
     }
     let id = this.makeid();
     this.db.run(`INSERT INTO questions(id,quiz_id,question,answers,correct_answer,topic,time_in_seconds ) VALUES(?,?,?,?,?,?,?)`,[ id,args.quiz_id,args.question, args.answers, args.correct_answer, args.topic, args.time_in_seconds],(err,success)=> {
         if (err) {
           return resolve({err:err.toString()});
         }else {
           return resolve({ok:true});
         }
     });
  });
}




  getQuiz(args){
      return new Promise((resolve, reject) => {
       if (args.quiz_id) {
          this.db.all(`SELECT quizzes.*, questions.* FROM quizzes JOIN questions ON quizzes.id = questions.quiz_id WHERE quizzes.id =? `,[args.quiz_id],(err,rows)=>{
            if(err){
              return resolve({err:err.toString()});
            }else {
              return resolve({ok:rows});
            }
          });
        }else {
            return resolve({err:"please provide quiz id"});
        }
      });
  }



  load(path,callBack){
    let self = this;
    this.path = path;
    this.db = new sqlite3.Database(this.path,function(err){
      if(err){
        console.log(err);
        callBack(false);
      }else {
        self.db.run('PRAGMA journal_mode = WAL;');
        callBack(self.db);
      }
    });
  }

  makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  prepare(args){
    return new Promise((resolve, reject) => {
      if(args.create){
        this.createDb().then((res)=>{
          if(res.ok){
            return resolve(true);
          }else {
            console.log(res,"DATABASE CREATION database");
            return reject(`could not create database,error occured`);
          }
        });
      }else {
        return resolve(true);
      }
    });
  }
  createDb(){
    let that = this;
    let promise = new Promise((resolve, reject) => {
        let global_success =true, err_stack='';
        var all_count=0;
        function notify(){
          all_count--;
          if(all_count<=0){
            if(!global_success){
              try {
                that.db.run("ROLLBACK;");
              } catch (e) {
                console.log(e);
              }
                 resolve({err:err_stack});
            }else {
                that.db.run("COMMIT;",function(err,success) {
                if (err) {
                   resolve({err:err.message});
                }else {
                  if(global_success){
                     resolve({ok:true});
                  }else {
                     resolve({err:err_stack});
                  }
                }
              });
            }
          }
        }
        that.db.serialize(function(){
          that.db.run("BEGIN TRANSACTION;");
          for(var elt in that.create_table_querries){
            console.log(elt,"elt");
            all_count++;
            that.db.run(that.create_table_querries[elt],function(err,success){
              if(err){
                console.log(err, elt);
                global_success=false;err_stack+="\n"+err;
              }
              notify();
            });
          }
        });
    });
    return promise;
  }
}
let databaseControler = new DatabaseControler();
exports.controler =  databaseControler;
