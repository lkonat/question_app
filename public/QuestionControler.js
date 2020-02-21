class QuestionControler {
    constructor(args) {
     this.waitTimeAfterResponse = 0;
     this.waitTimes ={
       correct:3000,
       fail:3000,
       no_answer:3000
     }
     this.abscd = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','Z'];
     this.numbers_maps = {
       "one":0,
       "two":1,
       "three":2,
       "four":3,
       "five":4,
       "six":5,
       "seven":6,
       "eight":7,
       "nine":8,
       "ten":9,
     };
     this.numbers = [1,2,3,4,5,6,7,8,9];
     this.width = args.width?args.width:300;
     this.host = args.host?args.host:$(`body`);
     this.customeEvents = {};
     this.shadow_color = args.shadow_color? args.shadow_color:'red';
     this.background_color = args.background_color? args.background_color :'inherit';
     this.current_question = false;
     this.currenTimer = false;
     this.currentSeconds = false;
     this.current_btn = {};
     this.current_btn_Indexes = {};
     this.current_answers = [];
     this.initView();
    }

    onEvents(type,that){
      this.customeEvents[type] = that;
    }

    triggerEvent(type,args){
      if(this.customeEvents[type]){
        this.customeEvents[type](args);
      }
    }
    
    answerCurrent(args,callBack){
      // console.log("chosed",args);
      // console.log("asked",this.current_question);
      this.manageAllButtons({
        location:this.answerTable,
        disable:true
      });
      if((args.chosen).toLowerCase() === this.current_question.correct_answer.toLowerCase()){
        callBack({correct:args.chosen,time:this.currentSeconds,question:this.current_question});
      }else{
        callBack({failed:args.chosen,time:this.currentSeconds,question:this.current_question});
      }
    }

    showAnimate(args,callBack){
      this.animation_div.html(args.html);
      setTimeout(()=>{
        this.animation_div.html(``);
        callBack();
      },args.time);
    }
    foundAnswer(args,callBack){
      if(args && args.divToAnimate){
        this.colorAnimate({
          colors:["coral","dodgerblue","yellow","coral","dodgerblue","yellow","green"],
          elt:args.divToAnimate,
          callBack:()=>{
            args.divToAnimate.css({"background-color":'green'});
            this.triggerEvent('correct-answer',true);
            this.showAnimate({
              html:`<center style='color:white;font-size:2em;font-weight:bold;'>Correct!</center>`,
              time:this.waitTimes.correct
            },()=>{
              callBack();
            });
          },
          speed:100,
          background:true
        });
      }
    }
    didNotAnswer(args,callBack){
      this.triggerEvent('time-up',true);
      this.showAnimate({
        html:`<center style='color:coral;'><span style='font-size:2em;font-weight:bold;color:coral;'>TIME IS UP!</span> <br> "<span style='color:white;'>${args.outcome.question.correct_answer}</span>" was the correct answer</center>`,
        time:this.waitTimes.no_answer
      },()=>{
        callBack();
      });
    }
    missedAnswer(args,callBack){
      if(args && args.divToAnimate){
        this.colorAnimate({
          colors:["coral","dodgerblue","yellow","coral","dodgerblue","yellow","red"],
          elt:args.divToAnimate,
          callBack:()=>{
            args.divToAnimate.css({"background-color":'Red'});
            this.triggerEvent('wrong-answer',true);
            this.showAnimate({
              html:`<center style='color:red;'><span style='font-size:2em;font-weight:bold;color:red;'>WRONG!</span> <br> "<span style='color:white;'>${args.outcome.question.correct_answer}</span>" was the correct answer</center>`,
              time:this.waitTimes.fail
            },()=>{
              callBack();
            });
          },
          speed:100,
          background:true
        });
      }
    }
    askQuestions(args,done){
      this.animation_div.html('');
        if(args.questions[args.idx]){
          this.askOne(args.questions[args.idx],(obj)=>{
            let outcomes= args.outcomes?args.outcomes:[];
            outcomes.push(obj);
            this.askQuestions({
              questions:args.questions,
              idx:(args.idx +1),
              outcomes:outcomes
            },done);
          });
        }else{
          done(args.outcomes);
        }

    }

    testOver(args){
      clearInterval(this.currenTimer);
      this.currenTimer = false;
      this.timer_view.empty();
      if(args.finished){
        this.question_asked_div.html('TEST OVER');
      }else if(args.quitted){
        this.question_asked_div.html('TEST Quit');
      }
      this.answerTable.empty();
      this.current_question = false;
      this.currenTimer = false;
      this.currentSeconds = false;
      this.animation_div.html('');
      if(args.final_outcome){
        for(let i =0; i<args.final_outcome.length; i++){
          let elt = $(`<div style='color:white;'>${args.final_outcome[i].failed? `<span style='color:red;'>Wrong</span>` :args.final_outcome[i].did_not_answer?`<span style='color:coral;'>no answer</span>` :args.final_outcome[i].correct? `<span style='color:dodgerblue;'>correct</span>` :'?' }  ${args.final_outcome[i].question.question} <span style='color:dodgerblue;'>----></span> <span style='color:dodgerblue;'>${args.final_outcome[i].question.correct_answer}</span></div>`);
          this.animation_div.append(elt);
        }
      }
      this.triggerEvent('test-over',true);
    }
    manageAllButtons(args){
      if(args.disable){
        args.location.find('.answerbuttons').prop('disabled', true);
        //args.location.find('.answerbuttons').hide();
      }else{
        args.location.find('.answerbuttons').prop('disabled', false);
      }
    }
    answerIt(answer){
      if(this.current_btn[answer]){
        this.current_btn[answer].trigger("click");
      }else{
        let index = this.abscd.indexOf(answer.toUpperCase());
        if(index !==-1 && this.current_answers[index] && this.current_btn[this.current_answers[index]]){
          console.log("clicked");
          this.current_btn[this.current_answers[index]].trigger("click");
        }
      }
      
    }
     colorAnimate(args){
      if(!args.idx){args.idx = 0;}
      if(args.colors && args.colors[args.idx]){
        if(args.background){
            if(!args.original_color){ args.original_color = args.elt.css("background-color");}
            args.elt.css({"background-color":args.colors[args.idx]});
            console.log("background-color",args.colors[args.idx]);
        }else {
            if(!args.original_color){ args.original_color = args.elt.css("color");}
            args.elt.css({"color":args.colors[args.idx]});
        }
        setTimeout(()=>{
         this.colorAnimate({
           colors:args.colors,
           elt:args.elt,
           callBack:args.callBack,
           original_color:args.original_color,
           speed:args.speed,
           idx:(args.idx +1),
           background:args.background
         });
        },args.speed?args.speed:300);
      }else {
        if(args.background){
            args.elt.css({"background-color":args.original_color});
        }else {
            args.elt.css({"color":args.original_color});
        }
        if(args.callBack){
          args.callBack();
        }
      }
    }
    addOnebutton(args){
      let td = $(`<td style='width:50%; height:${args.row_height}px;color:white;'></td>`);
      let div = $(`<div style='width:70%; height:100%; margin:0 auto;box-shadow: 0 0 5px grey;border-radius:3px;background-color:rgba(71, 229, 237,0.5);'></div>`);
      this.current_btn[args.this_answer] = $(`<button class='answerbuttons' style='width:100%;cursor:pointer;background-color:transparent;color:inherit;border:none;outline:none;text-align:left;'><span style='color:coral;font-weight:bold;padding-left:3px; '>${args.index}:</span> ${args.this_answer}</button>`);
      this.current_btn_Indexes[args.index] = this.current_btn[args.this_answer];
      div.append(this.current_btn[args.this_answer]);
      td.append(div);
      args.tr.append(td);
      this.current_btn[args.this_answer].click((e)=>{
        e.stopPropagation();
        this.stopTimer();
        this.answerCurrent({
          chosen:args.this_answer
        },(outcome)=>{
          if(outcome.correct){
            this.foundAnswer({divToAnimate:div,outcome:outcome},()=>{
              setTimeout(()=>{
                args.next(outcome);
              },this.waitTimeAfterResponse);
            });
          }else{
            this.missedAnswer({divToAnimate:div,outcome:outcome},()=>{
              setTimeout(()=>{
                args.next(outcome);
              },this.waitTimeAfterResponse);
            });
          }
        });
      });
    }
    askOne(args,next){
      this.current_question = args;
      this.question_asked_div.html(`${args.topic?` <span style='color:lightgrey;'>${args.topic}</span><br>` :''}${args.question}`);
      this.triggerEvent('question-asked',args.question);
      //add answer table
      let answers = JSON.parse(args.answers);
      this.current_answers = (answers);
      let nRow = answers.length/2; 
      this.answerTable.empty();
      this.current_btn = {};
      this.current_btn_Indexes = {};
      for(let i =0; i< nRow; i++){
        ((i)=>{
          let tr = $(`<tr></tr>`);
          this.answerTable.append(tr);
          let row_height=30;
          let this_answer = answers[i*2].toLowerCase();
          if(this_answer){
            this.addOnebutton({
              row_height:row_height,
              this_answer:this_answer,
              tr:tr,
              index:this.abscd[i*2],
              next:next
            });
          }else{
            tr.append(`<td style='width:50%; height:${row_height}px;color:white;'></td>`);
          }
          let this_answer2 = answers[(i*2)+1].toLowerCase();
          if(this_answer2){
            this.addOnebutton({
              row_height:row_height,
              this_answer:this_answer2,
              tr:tr,
              index:this.abscd[(i*2)+1],
              next:next
            });


            // td2 = $(`<td style='width:50%; height:${row_height}px;color:white;'></td>`);
            // let div = $(`<div style='width:70%; height:100%; margin:0 auto;box-shadow: 0 0 5px grey; border-radius:3px;background-color:rgba(71, 229, 237,0.5);'><span style='color:coral;font-weight:bold;padding-left:3px;'>${this.abscd[(i*2)+1]}:</span></div>`);
            // this.current_btn[this_answer2] = $(`<button class='answerbuttons' style='cursor:pointer;background-color:transparent;color:inherit;border:none;outline:none;'>${this_answer2}</button>`);
            // div.append(this.current_btn[this_answer2]);
            // td2.append(div);
            // this.current_btn[this_answer2].click((e)=>{
            //   e.stopPropagation();
            //   this.stopTimer();
            //   this.answerCurrent({
            //     chosen:this_answer2
            //   },(outcome)=>{
            //     if(outcome.correct){
            //       this.foundAnswer({divToAnimate:div,outcome:outcome},()=>{
            //         setTimeout(()=>{
            //           next(outcome);
            //         },this.waitTimeAfterResponse);
            //       });
            //     }else{
            //       this.missedAnswer({divToAnimate:div,outcome:outcome},()=>{
            //         setTimeout(()=>{
            //           next(outcome);
            //         },this.waitTimeAfterResponse);
            //       });
            //     }
            //   });
            // });
          }else{
            tr.append(`<td style='width:50%; height:${row_height}px;color:white;'></td>`);
          }
        })(i);
      }
      this.startTime({
        seconds:args.time_in_seconds
      },()=>{
        console.log("time is up");
        this.manageAllButtons({
          location:this.answerTable,
          disable:true
        });
        let outcome = {
          did_not_answer:true,
          question:this.current_question
        }
        this.didNotAnswer({outcome:outcome},()=>{
          next(outcome);
        });
      });
    }



    stopTimer(){
      if(this.currenTimer){
        clearInterval(this.currenTimer);
        this.currenTimer = false;
      }
    }
    startTime(args,callBack){
      console.log("startTime args",args);
      let seconds = args.seconds;
      this.currentSeconds = seconds;
      if(this.currenTimer){
        clearInterval(this.currenTimer);
      }else{
        this.currenTimer = setInterval(()=>{
          seconds--;
          this.currentSeconds = seconds;
          if(seconds<=0){
            clearInterval(this.currenTimer);
            this.currenTimer = false;
            callBack();
          }
          let view = $(`<span style='font-size:1.3em;'>${seconds<100?`${seconds<10?`00${seconds} s` :`0${seconds} s`}`:`${seconds} s`}</span>`);
          let pause = $(`<span style='color:red; cursor:pointer;'> Pause</span>`);
          let resume = $(`<span style='color:yellow;display:none;cursor:pointer;'> Resume</span>`);
          let quit = $(`<span style='color:yellow;cursor:pointer;'> Quit</span>`);
          this.timer_view.empty();
          this.timer_view.append(view,pause,resume,quit);
          quit.click((e)=>{
            e.stopPropagation();
            this.testOver({quitted:true});
          });
          pause.click((e)=>{
            e.stopPropagation();
            clearInterval(this.currenTimer);
            this.currenTimer = false;
            resume.show();
            pause.hide();
            this.manageAllButtons({
              location:this.answerTable,
              disable:true
            });
          });
          resume.click((e)=>{
            e.stopPropagation();
            resume.hide();
            pause.show();
            args.seconds = this.currentSeconds;
            this.startTime(args,callBack);
            this.manageAllButtons({
              location:this.answerTable,
              disable:false
            });
            //clearInterval(this.currenTimer);
          });
        },1000);
      }
    }
    start(){
      let btn = this.question_asked_div.find("#start_btn");
      if(btn.length>0){
        btn.trigger("click");
      }
    }

    prepareToStart(args){
      let name = args? args.name:false;
      this.question_asked_div.empty();
      let start = $(`<button id='start_btn' style='color:white; cursor:pointer; border:none; background-color:transparent;'>Start ${name?name:''}!</button>`);
      let cancel = $(`<button id='start_btn' style='color:red; cursor:pointer;border:none; background-color:transparent;'>Cancel</button>`);
      this.question_asked_div.append(start,cancel);
      cancel.click((e)=>{
        e.stopPropagation();
        this.question_asked_div.empty();
        this.triggerEvent('cancel-test',true);
      });
      start.click((e)=>{
        e.stopPropagation();
        this.triggerEvent('start-test',true);
        let questions= [
          // {
          //   topic:'Chien',
          //   question:`C'est quoi un chien?`,
          //   answers:['animal','une chaise','je ne sais pas','une voiture'],
          //   correct_answer:'animal',
          //   time_in_seconds:30
          // },
          // {
          //   topic:'Technology',
          //   question:`Python est un ________ qui permet de fair de la magie avec un ordinateur.`,
          //   answers:['language','un serpent','unjouet','une marque de voiture'],
          //   correct_answer:'language',
          //   time_in_seconds:10
          // },
          // {
          //   topic:'Technology',
          //   question:`C'est quoi Hello world?`,
          //   answers:['rien','culture','je ne sais pas','blah blah blah'],
          //   correct_answer:'culture',
          //   time_in_seconds:7
          // },
          // {
          //   topic:'Culture generale',
          //   question:`who are you?`,
          //   answers:['a human','une culture','je ne sais pas','qui sait'],
          //   correct_answer:'a human',
          //   time_in_seconds:7
          // }


{
  topic:'Science',
  question:`Which device do we use to look at the stars?`,
  answers:['telescope','Barometer'],
  correct_answer:'telescope',
  time_in_seconds:10
},
{
   topic:'Science',
   question:`What is the lightest existing metal?`,
   answers:['aluminium','iron',	'Ammoniac','Hydrogen'],
   correct_answer:'aluminium',
   time_in_seconds:10
 },

 {
    topic:'Science',
    question:`How many kidneys does a normal person have?`,
    answers:['two kidneys','One kidneys'],
    correct_answer:'two kidneys',
    time_in_seconds:10
  },
  {
     topic:'Science',
     question:`Who was the first president of the USA?`,
     answers:['george washington','John Adams',	'Barrack Obama','Donald Trump'],
     correct_answer:'george washington',
     time_in_seconds:10
   },

   {
      topic:'Science',
      question:`What is the world s largest office building?`,
      answers:['the pentagon','the iron house',	'the white house','the parthenon'],
      correct_answer:'the pentagon',
      time_in_seconds:10
    }
        ];
        this.askQuestions({
          questions:args && args.questions?args.questions: questions,
          idx:0
        },(final_outcome)=>{
          this.testOver({finished:true,final_outcome:final_outcome});

          // this.prepareToStart({
          //   questions:[{
          //     topic:'Science',
          //     question:`What is the lightest existing metal?`,
          //     answers:['aluminium','iron',	'Ammoniac','Hydrogen'],
          //     correct_answer:'aluminium',
          //     time_in_seconds:10
          //   },
           
          //   {
          //      topic:'Science',
          //      question:`How many kidneys does a normal person have?`,
          //      answers:['two kidneys','One kidneys'],
          //      correct_answer:'two kidneys',
          //      time_in_seconds:10
          //    },]
          // });
        });
      });
    }
    initView(){
        this.view = $(`<div style='width:${this.width}px; margin:0 auto; margin-top:10px;box-shadow: 0 0 5px ${this.shadow_color}; background-color:${this.background_color}; display:flex; flex-direction:column;'></div>`);
        this.host.append(this.view);
        this.header_section = $(`<div class='dragg_area' style='width:100%; height:300px;position:relative;'>Header</div>`);
        this.timer_view = $(`<div style='position:absolute; top:3px; right:3px; color:white;cursor:default;'></div>`);
        this.animation_div = $(`<div style='width:80%; height:200px; margin:0 auto; margin-top:30px; overflow:scroll;'></div>`);
        this.header_section.append(this.timer_view,this.animation_div);
        this.body_section = $(`<div style='width:100%; height:300px;'>Body</div>`);
        this.footer_section = $(`<div style='width:100%; height:30px;'>Footer</div>`);
        this.question_asked_div = $(`<div style='width:80%; margin:0 auto; background-color:rgba(71, 229, 237,0.5); box-shadow: 0 0 5px grey;text-align:center;color:white;'></div>`);


        this.answers_div = $(`<div style='width:80%; margin:0 auto; margin-top:30px; '></div>`);
        this.answerTable =$(`<table style='width:100%;border-collapse:separate; border-spacing:0 10px;'></table>`);
        this.answers_div.append(this.answerTable);
        this.body_section.append(this.question_asked_div,this.answers_div);
        this.view.append(this.header_section,this.body_section,this.footer_section);
        makeItDraggleWIthClassName({elt:this.view, className:"dragg_area",color:this.shadow_color});
        //this.prepareToStart();



    }

  }