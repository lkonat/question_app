class ProvideQuestions{
    constructor(args) {
        this.host =args.host;
        this.width =args.width;
        this.shadow_color = args.shadow_color;
        this.background_color = args.background_color;
        this.top = args.top;
        this.left = args.left;
        this.current_quiz ={};
        this.customeEvents ={};
        this.initViews();
        this.populateOne({
            question:{
                id:'gwfdgwfguwfdu',
                question:'what is what?',
                topic:"life"
            }
        });
    }
    populateOne(args){
        this.cleanInputs({all:true});
        this.questions_text.val(args.question.question);
        this.topic.find("input").val(args.question.topic);
    }
    addOneQuestion(args){
        return new Promise((resolve, reject) => {
            console.log(args.question.answers);
            console.log({
                quiz_id:this.current_quiz.id,
                question:args.question.question,
                answers:JSON.stringify(args.question.answers),
                correct_answer:args.question.correct_answer,
                topic:args.question.topic,
                time_in_seconds:10
            });
            this.addQuizQuestionAjax({
                quiz_id:this.current_quiz.id,
                question:args.question.question,
                answers:JSON.stringify(args.question.answers),
                correct_answer:args.question.correct_answer,
                topic:args.question.topic,
                time_in_seconds:10
            },(outcome)=>{
                resolve(outcome);
            });
        });
    }
    cleanInputs(args){
        console.log("CLEAN INPUTS");
        if(args && args.all){
          this.topic.find("input").val("");
        }
        this.questions_text.val("");
        this.correct_answer_text.val("");
        this.other_answer_text.val("");
        this.add_question_btn.html(`Add Questions to quiz ${this.current_quiz.name} `);
    }
    changePosition(args){
        let pos = {};
        if(args.left){
            pos["left"]=args.left;
        }
        if(args.top){
            pos["top"]=args.top;
        }
        this.view.animate(pos,300);

    }
    AddQuestionsView(args){
        //let questions_to_ask = args.questions_to_ask;
        if(this.addQuestionView ){
            this.addQuestionView .remove();
        }
        this.addQuestionView = $(`<div style='width:100%;'></div>`);
        this.view.append(this.addQuestionView);
        this.quizModule = {};
        this.header_section = $(`<div class='dragg_area' style='width:100%; height:30px;position:relative;'></div>`);
        this.body_section = $(`<div style='width:100%; height:300px;'></div>`);
        this.footer_section = $(`<div style='width:100%; height:30px;'></div>`);
        this.addQuestionView.append(this.header_section,this.body_section,this.footer_section);
        //
        this.topic = $(`<center style='color:grey;'>Topic: <input type='text' placeholder='topic?' style='background-color:inherit;border:none; outline:none; color:white;resize:none;'></input></center>`);
        this.questions_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='Type the question'></textarea>`);
        this.correct_answer_text = $(`<textarea  style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type the correct answer'></textarea>`);
        this.other_answer_text = $(`<textarea style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type all the others answers'></textarea>`);
        this.add_question_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>Add Questions to quiz ${this.current_quiz.name}</button>`);
        this.add_other_quiz_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>Done</button>`);
        this.body_section.append(this.topic ,this.questions_text,this.correct_answer_text,this.other_answer_text,this.add_question_btn,this.add_other_quiz_btn);

        this.add_other_quiz_btn.click((e)=>{
           e.stopPropagation();
           this.swicthView("quiz");
        });
        this.add_question_btn.click((e)=>{
            e.stopPropagation();
            let question = this.questions_text.val().trim();
            let correct_answer = this.correct_answer_text.val().trim();
            let others_answer = this.other_answer_text.val().trim().split(',');
            let topic = this.topic.find("input").val().trim();
            if(question.length<=0){
               return alert("please provide a question");
            }
            if(correct_answer.length<=0){
                return alert("please provide a correct answer");
            }
            if(others_answer.length<=0){
                return alert("please provide at least one wrong answer");
            }
            let rand = Math.floor(Math.random() * 100);
            let rand2 = Math.floor(Math.random() * 100);
            let base = rand>50?1:0;
            let limit = rand2>50?others_answer.length/2:others_answer.length;
            others_answer.splice(Math.floor(Math.random() * limit) + base, 0, correct_answer);
            console.log(rand);
            let allAnswers = {};
            for(var i =0; i<others_answer.length; i++ ){
              if(others_answer[i].trim().length<=0){
                return alert ("wrong input for anwsers");
              }
              if(!allAnswers[others_answer[i].trim()]){
                allAnswers[others_answer[i].trim()] = true;
              }else{
                  return alert("DUPLICATED ANSWER FOUND");
              }
            }
            if(others_answer.length%2 !==0){
              return alert("Number of answers need to be an even number");
            }
            if(others_answer.length>4){
                return alert("Number of answers cannot be more than 4");
              }
            let question_asked = {
                topic:topic,
                question:question,
                answers:others_answer,
                correct_answer:correct_answer,
                time_in_seconds:10
            }
            this.add_question_btn.hide();
            this.addOneQuestion({
                question:question_asked
            }).then((outcome)=>{
                console.log("outcome",outcome);
                if(outcome.ok){
                    this.cleanInputs();
                    this.add_question_btn.show();
                }else{
                    this.add_question_btn.show();
                }
            });
        });
        this.addQuestionView.hide();
    }
    addQuizQuestionAjax(args,callBack){
        $.ajax({
            type: "POST",
            url:"add-quiz-question",
            data:{
                quiz_id: args.quiz_id,
                question:args.question,
                answers:args.answers,
                correct_answer:args.correct_answer,
                topic:args.topic,
                time_in_seconds:args.time_in_seconds
            }
            }).done(function(res) {
              callBack(res);
          }).fail(function(err) {
              callBack({err:err});
          });
    }
    startQuiz(args){
      this.triggerEvent('quiz',args);
    }
    onEvents(type,that){
        this.customeEvents[type] = that;
      }
  
      triggerEvent(type,args){
        if(this.customeEvents[type]){
          this.customeEvents[type](args);
        }
      }
    getAllQuizes(){
        this.quizModule.view_right.empty();
        $.ajax({
            type: "POST",
            url:"get-quizes",
            }).done((res) =>{
              if(res.ok){
                  let table = $(`<table style='width:100%;'></table>`);
                  this.quizModule.view_right.append(table);
                  for(let i =0; i< res.ok.length; i++){
                      (()=>{
                          let tr = $(`<tr class='quizLinks'></tr>`);
                          let td1 = $(`<td style='width:90%;'></td>`);
                          let td2 = $(`<td style='width:10%;'></td>`);
                          tr.append(td1,td2);
                          table.append(tr);
                          let oneView = $(`<div class='oneviews' style='color:lightgrey; width:100%; background-color:rgb(5,7,7);margin-top:5px;display:none;'></div>`);
                          let name = $(`<span style='cursor:pointer; color:lightgrey;'>${res.ok[i].name}</span>`);
                          let startQuize = $(`<span style='color:dodgerblue;cursor:pointer;'> Start Quiz</span>`);
                          let deleteQuiz = $(`<span style='color:red;cursor:pointer;font-size:0.7em;'> Delete</span>`)
                          //oneView.append(name,startQuize);
                          td1.append(name,oneView);
                          td2.append(startQuize,deleteQuiz);
                        //   this.quizModule.view_right.append(oneView);
                          name.click((e)=>{
                            e.stopPropagation();
                            this.quizModule.view_right.find(".oneviews").hide();
                            this.getOneQuiz({quiz_id:res.ok[i].id},(all)=>{
                                oneView.show();
                                oneView.empty();
                                for(let x = 0 ; x< all.ok.length; x++){
                                    ((x)=>{
                                        let q = $(`<div style='color:grey; font-size:0.7em;'></div>`);
                                        let name = $(`<span>${all.ok[x].question}</span>`);
                                        let del = $(`<span style='color:red; font-size:0.6em; cursor:pointer;'> delete</span>`);
                                        let modify = $(`<span style='color:grey; font-size:0.6em; cursor:pointer;'> Edit</span>`);
                                        q.append(name,del,modify);
                                        oneView.append(q);
                                        modify.click((e)=>{
                                            e.stopPropagation();
                                            this.triggerEvent('modify-question',all.ok[x]);
                                        });
                                        del.click(()=>{
                                            if(confirm(`Delete Question "${all.ok[x].question}" ?`)){
                                                $.ajax({
                                                    type: "POST",
                                                    url:"delete-question",
                                                    data:{
                                                        question_id:all.ok[x].id
                                                    }
                                                    }).done(function(res) {
                                                      console.log("delete Question",res);
                                                      if(res.ok){
                                                        q.remove();
                                                      }
                                                  }).fail(function(err) {
                                                      console.log("delete Question",err);
                                                  }); 
                                            }
                                        });
                        
                                    })(x);
                                }
                                let add_one = $(`<div style=' display:table; padding:1px; background-color:black; color:white; border-radius:3px;'>Add</div>`);
                                oneView.append(add_one);
                                add_one.click((e)=>{
                                    e.stopPropagation();
                                    console.log(res.ok[i],"add one");
                                    this.current_quiz = {
                                        name:res.ok[i].name,
                                        id:res.ok[i].id
                                    };
                                    this.swicthView("questions",{
                                        name:res.ok[i].name,
                                        id:res.ok[i].id
                                    });
                                });
                            });
                          });
                          deleteQuiz.click((e)=>{
                              e.stopPropagation();
                              if(confirm(`Are you sure to delete Quiz "${res.ok[i].name}"`)){
                                this.deleteOneQuiz({
                                    quiz_id:res.ok[i].id
                                  },(outcome)=>{
                                      if(outcome && outcome.ok){
                                         tr.remove();
                                      }
                                     console.log("outcome deleting quiz",outcome);
                                  });
                              }
                          });
                          startQuize.click((e)=>{
                              e.stopPropagation();
                              this.getOneQuiz({quiz_id:res.ok[i].id},(all)=>{
                                 this.startQuiz({
                                     name:res.ok[i].name,
                                     questions:all.ok
                                 });
                              });
                          });
                      })();
                  }
              }
          }).fail(function(err) {
              console.log({err:err});
          });
    }

    deleteOneQuiz(args,callBack){
        $.ajax({
            type: "POST",
            url:"delete-quiz",
            data:{
                quiz_id:args.quiz_id
            }
            }).done(function(res) {
              callBack(res);
          }).fail(function(err) {
              callBack({err:err});
          });  
    }
    getOneQuiz(args,callBack){
        $.ajax({
            type: "POST",
            url:"get-one-quiz",
            data:{
                quiz_id:args.quiz_id
            }
            }).done(function(res) {
              callBack(res);
          }).fail(function(err) {
              callBack({err:err});
          });
    }
    addQuizAjax(args,callBack){

        $.ajax({
            type: "POST",
            url:"add-quiz",
            data:{
                actor_id:args.user_name,
                name:args.name
            }
            }).done(function(res) {
              callBack(res);
          }).fail(function(err) {
              callBack({err:err});
          });
    }
    AddQuizView(){
        this.quizModule = {};
        this.quizModule.view = $(`<div style='width:100%;display:flex; flex-direction:row;'></div>`);
        this.quizModule.view_left = $(`<div class='dragg_area' style='width:20%; border-right:3px solid rgba(5,7,7,0.5);'></div>`);
        this.quizModule.view_right = $(`<div class='dragg_area' style='width:80%;padding:3px;'></div>`);
        this.quizModule.view.append(this.quizModule.view_left,this.quizModule.view_right);
        this.quizModule.header_section = $(`<div class='dragg_area' style='width:100%; height:30px;position:relative;'></div>`);
        this.quizModule.body_section = $(`<div style='width:100%; height:300px;'></div>`);
        this.quizModule.questions_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='Type the quiz name'></textarea>`);
        this.quizModule.body_section.append(this.quizModule.questions_text);
        this.quizModule.footer_section = $(`<div style='width:100%; height:30px;'></div>`);
        this.view.append(this.quizModule.view);
        this.quizModule.view_left.append(this.quizModule.header_section,this.quizModule.body_section, this.quizModule.footer_section);
        this.quizModule.add_new_quiz_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:rgba(5,7,7,0.5);border:none;'>Add quiz</button>`);
        this.quizModule.add_question_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;'>Add Quesions Now</button>`);
        this.quizModule.body_section.append(this.quizModule.add_new_quiz_btn,this.quizModule.add_question_btn);
        this.quizModule.add_question_btn.hide();
        this.quizModule.add_new_quiz_btn.click((e)=>{
            e.stopPropagation();
            let quiz_name = this.quizModule.questions_text.val().trim();
            if(quiz_name.length<=0){
              return alert("Quiz name is mising");
            }
            this.addQuizAjax({
                user_name:'lkonat',
                name:quiz_name
            },(outcome)=>{
                console.log(outcome);
                if(outcome.ok){
                    this.current_quiz = {
                        name:quiz_name,
                        id:outcome.quiz_id
                    };
                    console.log("this.current_quiz",this.current_quiz);
                    this.quizModule.add_question_btn.show();
                }
            });
        });
        this.quizModule.add_question_btn.click((e)=>{
            e.stopPropagation();
            //show questions view 
            console.log("show questions view ");
            // this.AddQuestionsView();
            this.swicthView("questions");
        });
        this.quizModule.view.hide();

    }
    swicthView(view,args){
      if(view === "quiz"){
        this.quizModule.view.show();
        this.addQuestionView.hide();
        this.getAllQuizes();
      }else if(view === "questions"){
        this.addQuestionView.show();
        this.cleanInputs({all:true});
        this.quizModule.view.hide();
      }
    }
    hideSelf(){
        this.view.hide();
    }

    showSelf(){
        this.view.show();
    }

    initViews(){
        this.view = $(`<div style='width:${this.width}px; position:fixed; top:${this.top}; left:${this.left}; box-shadow: 0 0 5px ${this.shadow_color}; background-color:${this.background_color}; display:flex; flex-direction:column;'></div>`);
        this.host.append(this.view);
        makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:this.shadow_color});
        this.AddQuestionsView();
        this.AddQuizView();
        this.swicthView("quiz");
  
    }
}