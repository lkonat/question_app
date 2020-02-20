class ModifyQuestion{
    constructor(args){
        this.host =args.host;
        this.width =args.width;
        this.shadow_color = args.shadow_color;
        this.background_color = args.background_color;
        this.top = args.top;
        this.left = args.left;
        this.current_quiz ={};
        this.customeEvents ={};
        this.initViews();
    }
    initViews(){
        this.view = $(`<div style='width:${this.width}px; position:fixed; top:${this.top}; left:${this.left}; box-shadow: 0 0 5px ${this.shadow_color}; background-color:${this.background_color}; display:flex; flex-direction:column;display:none;'></div>`);
        this.header = $(`<div class='dragg_area' style='width:100%;' ><center class='dragg_area' style='font-weight:bold;color:white;'>Modify</center></div>`);
        this.body = $(`<div style='width:100%; min-height:100px;' ></div>`);
        this.view.append(this.header,this.body);
        this.host.append(this.view);
        makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:this.shadow_color});  
    }
    showSelf(){
        this.view.show();
    }
    hideSelf(){
        this.view.hide();
    }
    getQuestion(args){
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                url:"get-one-question",
                data:{
                    question_id:args.question_id
                }
            }).done((res)=>{
                if(res && res.ok){
                    return resolve({question:res.ok});
                }else{
                    return resolve({err:true});
                }
            }).fail(function(err) {
                return resolve({err:err});
            });
        }); 
    }
    modifyOne(args,callBack){
        this.showSelf();
        this.body.empty();
        this.getQuestion({
            question_id:args.questions.id
        }).then((outcome)=>{
            if(outcome.question){
              let question_obj = outcome.question;
              let div = $(`<div style='width:100%'></div>`);
              this.body.append(div);
              let topic_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='Type the topic'></textarea>`);
              let questions_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='Type the question'></textarea>`);
              let correct_answer_text = $(`<textarea  style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type the correct answer'></textarea>`);
              let other_answer_text = $(`<textarea style='width:100%; height:60px;background-color:inherit;border:none; outline:none; color:white;resize:none;' placeholder='type all the others answers'></textarea>`);
              let time_text = $(`<textarea style='width:100%; height:60px; background-color:inherit;border:none; outline:none; color:dodgerblue;resize:none; font-size:1.2em; font-weight:bold;' placeholder='time'></textarea>`);
              let modify_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;'>Submit</button>`);
              let cancel_btn=$(`<button type="button" class="btn btn-dark" style='width:100%;padding:3px;cursor:pointer;background-color:inherit;color:red;'>Cancel</button>`);
              div.append(topic_text,questions_text,correct_answer_text,other_answer_text,time_text,modify_btn,cancel_btn);
              topic_text.val(question_obj.topic);
              questions_text.val(question_obj.question.trim());
              correct_answer_text.val(question_obj.correct_answer);
              let answers_A = JSON.parse(question_obj.answers);
              console.log("ANSWERS",answers_A);
              let str = false;
              for(let i =0; i< answers_A.length; i++){
                  if(question_obj.correct_answer!==answers_A[i]){
                      if(!str){
                          str = `${answers_A[i]}`;
                        }else{
                          str +=`, ${answers_A[i]}`;
                        }
                  }
              }
              other_answer_text.val(str);
              time_text.val(question_obj.time_in_seconds);
              cancel_btn.click((e)=>{
                  e.stopPropagation();
                  callBack({cancel:true});
              });
              modify_btn.click((e)=>{
                  e.stopPropagation();
                  let question = questions_text.val().trim();
                  let correct_answer = correct_answer_text.val().trim();
                  let others_answer = other_answer_text.val().trim().split(',');
                  let topic = topic_text.val().trim();
                  let time_in_seconds = time_text.val().trim();
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
                      question_id:question_obj.id,
                      topic:topic,
                      question:question,
                      answers:JSON.stringify(others_answer),
                      correct_answer:correct_answer,
                      time_in_seconds:time_in_seconds
                  }
                  console.log(args,"args");
                  //console.log(question_asked,question_asked);
                  $.ajax({
                      type: "POST",
                      url:"update-question",
                      data:question_asked
                      }).done((res)=>{
                          if(res && res.ok){
                              callBack({ok:question_asked});
                              this.hideSelf();
                          }else{
                              alert(`Could not update`);
                              callBack({err:'could not update'});
                          }
                    }).fail(function(err) {
                        callBack({err:err});
                    });
      
                  // this.addOneQuestion({
                  //     quiz_id:args.id,
                  //     question:question_asked
                  // }).then((outcome)=>{
                  //     console.log("outcome",outcome);
                  //     if(outcome.ok){
                  //         console.log("QUESTINS", question_asked);
                  //         args.idx = (args.idx +1);
                  //         this.askQuestions(args);
                  //     }else{
                  //         alert("could not add this question");
                  //     }
                  // });
              });
            }
        });
    }
    
}