class PersonalityMe{
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
        this.questionsA = [
            "What’s one thing I always procrastinate on?",
            "What would I do with my life if I was suddenly awarded a billion dollars?",
            "Is there anything you consider absolutely unforgivable?",
            "If you woke up tomorrow with no fear, what would you do first?",
            "In your life, what has been the biggest blessing in disguise?",
            "If you could pick one year of your life to do-over, which would it be and why?",
            "What is one behavior that you never tolerate?",
            "If you could write a note to your younger self, what would you say in only three words?",
            "What is the one thing that makes you feel alive?",
            "What would your perfect day look like?",
            "Do you usually follow your head or your heart when making decisions?",
            "What is something that never ends well?",
            "If you could change anything about the way you were raised, what would it be?",
            'Given the choice of anyone in the world, whom would you want as a dinner guest?',
            'How Would you like to be famous?',
            'If you were able to live to the age of 90 and retain either the mind or body of a 30-year old for the last 60 years of your life, which would you choose?',
            'Do you have a secret hunch about how you will die?',
            'If you could wake up tomorrow having gained one quality or ability, what would it be?',
            'If a crystal ball could tell you the truth about yourself, your life, the future or anything else, what would you want to know?',
            'Is there something that you’ve dreamt of doing for a long time? Why haven’t you done it?',
            'If you knew that in one year you would die suddenly, would you change anything about the way you are now living?',
            'One embarrassing moment in your life.',
            'Your house, containing everything you own, catches fire. After saving your loved ones and pets, you have time to safely make a final dash to save any one item. What would it be?',
            'Where do you see yourself in 5 years?',
            'How do you see your future with your partenair?',
            'What are your goals in a relationship?',
            'What are your thoughts on having a family?',
            'Where do you see yourself living when you retire?',
            'What are your financial priorities and goals?',
            'What’s the one thing you want to achieve the most before you die?',
            'Do you have any habits you want to change?',
            'What do you most look forward to about getting old?',
            'What are you hoping to learn in the coming year?',
            'If you could see into the future, what’s one thing you want to see?',
            'How do you want to be remembered?'
        ];
        this.questionFun = [
            'Given the choice of anyone in the world, whom would you want as a dinner guest?',
            'How Would you like to be famous?',
            'If you were able to live to the age of 90 and retain either the mind or body of a 30-year old for the last 60 years of your life, which would you choose?',
            'Do you have a secret hunch about how you will die?',
            'If you could wake up tomorrow having gained one quality or ability, what would it be?',
            'If a crystal ball could tell you the truth about yourself, your life, the future or anything else, what would you want to know?',
            'Is there something that you’ve dreamt of doing for a long time? Why haven’t you done it?',
            'If you knew that in one year you would die suddenly, would you change anything about the way you are now living?',
            'One embarrassing moment in your life.',
            'Your house, containing everything you own, catches fire. After saving your loved ones and pets, you have time to safely make a final dash to save any one item. What would it be?',
        ];
        this.questionFuture =[
            'Where do you see yourself in 5 years?',
            'How do you see your future with your partenair?',
            'What are your goals in a relationship?',
            'What are your thoughts on having a family?',
            'Where do you see yourself living when you retire?',
            'What are your financial priorities and goals?',
            'What’s the one thing you want to achieve the most before you die?',
            'Do you have any habits you want to change?',
            'What do you most look forward to about getting old?',
            'What are you hoping to learn in the coming year?',
            'If you could see into the future, what’s one thing you want to see?',
            'How do you want to be remembered?'
        ];
    }

    hideSelf(){
        this.view.hide();
    }

    showSelf(){
        this.view.show();
    }
    onEvents(type,that){
        this.customeEvents[type] = that;
    }
  
    triggerEvent(type,args){
        if(this.customeEvents[type]){
            this.customeEvents[type](args);
        }
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
    done(args){
        this.triggerEvent("done",args);
        this.startNew();
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
    askQuestions(args){
        console.log(args,"args");
        if(!args.questions[args.idx]){
            args.questions.push(" ");
        }
        if(args.questions[args.idx]){
            this.body.empty();
            let div = $(`<div style='width:100%'></div>`);
            this.body.append(div);
            let questions_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='Type the question'></textarea>`);
            let correct_answer_text = $(`<textarea  style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type the correct answer'></textarea>`);
            let other_answer_text = $(`<textarea style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type all the others answers'></textarea>`);
            let add_question_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>Add</button>`);
            let done=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>I am Done with this!</button>`);
            let cancel=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;color:red;'>cancel!</button>`);
            let divB = $(`<div style='text-align:center;'></div>`);
            let prev = $(`<button type="button" class="btn btn-dark" style='padding:3px;cursor:pointer;background-color:inherit;display:none;'>Prev</button>`);
            let next = $(`<button type="button" class="btn btn-dark" style='padding:3px;cursor:pointer;background-color:inherit;display:none;'>Next</button>`);
            divB.append(prev,next);
            div.append(divB,questions_text,correct_answer_text,other_answer_text,add_question_btn,done,cancel);
            questions_text.val(args.questions[args.idx].trim());
            cancel.click((e)=>{
                e.stopPropagation();
                this.deleteOneQuiz({
                    quiz_id:args.id
                  },(outcome)=>{
                      if(outcome && outcome.ok){
                        this.done();
                      }
                     console.log("outcome deleting quiz",outcome);
                  });
            });
            done.click((e)=>{
                e.stopPropagation();
                this.done();
            });
            if(args.questions[(args.idx - 1)]){
                prev.show();
            }
            prev.click((e)=>{
                e.stopPropagation();
                args.idx = (args.idx - 1);
                this.askQuestions(args);
            });
            if(args.questions[(args.idx +1)]){
                next.show();
            }
            next.click((e)=>{
                e.stopPropagation();
                args.idx = (args.idx +1);
                this.askQuestions(args);
            });
            add_question_btn.click((e)=>{
                e.stopPropagation();
                let question = questions_text.val().trim();
                let correct_answer = correct_answer_text.val().trim();
                let others_answer = other_answer_text.val().trim().split(',');
                let topic = args.name;
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
                this.addOneQuestion({
                    quiz_id:args.id,
                    question:question_asked
                }).then((outcome)=>{
                    console.log("outcome",outcome);
                    if(outcome.ok){
                        console.log("QUESTINS", question_asked);
                        args.idx = (args.idx +1);
                        this.askQuestions(args);
                    }else{
                        alert("could not add this question");
                    }
                });
            });
        }else{
           this.done();
        }
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
    addOneQuestion(args){
        return new Promise((resolve, reject) => {
            console.log(args.question.answers);
            console.log({
                quiz_id:args.quiz_id,
                question:args.question.question,
                answers:JSON.stringify(args.question.answers),
                correct_answer:args.question.correct_answer,
                topic:args.question.topic,
                time_in_seconds:10
            });
            this.addQuizQuestionAjax({
                quiz_id:args.quiz_id,
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
    startNew(){
        let div = $(`<div></div>`);
        let name_input =  $(`<textarea  style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type your name'></textarea>`);
        let start_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>Start</button>`);
        div.append(name_input,start_btn);
        this.body.empty();
        this.body.append(div);
        start_btn.click((e)=>{
            e.stopPropagation();
            let name = name_input.val().trim();
            if(name.length<=0){
               return alert("please add a name");
            }
            this.addQuizAjax({
                user_name:name,
                name:`${name}'s personalityMe`
            },(outcome)=>{
                console.log("OUTCOME ADDING A NEW QUIZ",outcome);
                if(outcome.ok){
                    this.triggerEvent("start",true);
                    this.askQuestions({
                        questions:this.questionsA,
                        idx:0,
                        name:name,
                        id:outcome.quiz_id
                    });
                }else{
                    alert("Sorry could not add this quiz");
                }
            });
        });
    }
    initViews(){
        this.view = $(`<div style='width:${this.width}px; position:fixed; top:${this.top}; left:${this.left}; box-shadow: 0 0 5px ${this.shadow_color}; background-color:${this.background_color}; display:flex; flex-direction:column;'></div>`);
        this.header = $(`<div class='dragg_area' style='width:100%;' ><center class='dragg_area' style='font-weight:bold;color:white;'>PersonalityMe</center></div>`);
        this.body = $(`<div style='width:100%; min-height:100px;' ></div>`);
        this.view.append(this.header,this.body);
        this.host.append(this.view);
        makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:this.shadow_color});
        this.startNew();
        
  
    }
}