class SpeechClass {
  constructor(param) {
    this.name = param.name;
    this.host = param.host;
    this.recognition;
    this.speakIt;
    this.listening=true;
    this.hasResponded =false;
    this.isTalking = false;
    this.cEvents = {};
    this.keepListening = true;
    this.nameCalledCounter = 0;
    this.stop = false;
    this.init();
  }
  changeHost(args){
    this.host = args.host;
    this.initView();
  }
  on(what,that){
    this.cEvents[what] = that;
  }
  nameCalled(on){
    if(on){
      this.nameCalledCounter = 2;
      this.actorView.css({"border":"5px solid coral"});
    }else {
      this.nameCalledCounter --;
      if(this.nameCalledCounter===0){
          this.actorView.css({"border":"1px solid dodgerblue"});
      }
    }
  }
  changeName(name){
    this.name = name;
    this.initView();
  }
  getName(name){
    return this.name;
  }
  handleTranslation(ev){
   let transLated = false;
   for(var i =ev.resultIndex; i<ev.results.length; i++){
     var trans = ev.results[i][0].transcript;
     let temp = trans ?trans.toLowerCase():false;
     if(temp.split(" ").indexOf(this.name)!== -1) {
       this.recognition.abort();
       this.on("end",()=>{
          this.nameCalled(true);
          this.listen();
       });
     }
     if(ev.results[i].isFinal){
       transLated =trans;
     }
   }
   if(transLated){
      this.handleIt(transLated);
   }
  }
  handleIt(sentence){
    if(this.nameCalledCounter>0){
      if(sentence ==='speak'){

      }
      // console.log("*************", sentence,"*************");
      //this.speak(sentence);
      if(this.cEvents["sentence"]){
          this.cEvents["sentence"](sentence.toLowerCase());
      }
      this.fire_event_Sentence(sentence.toLowerCase());
    }else {
      if(this.cEvents["discret-sentence"]){
        this.cEvents["discret-sentence"](sentence.toLowerCase().trim());
      }
      this.fire_event_discret_sentence(sentence.toLowerCase().trim());
    }

  }
  //-----
  onSentence(that){
    if(!this.on_envent_sentences){
      this.on_envent_sentences= [];
    }
    this.on_envent_sentences.push(that);
  }
  fire_one(args,counter0){
    let counter = counter0;
    if(this.on_envent_sentences[counter]){
      this.on_envent_sentences[counter](this.name,args,()=>{
         this.fire_one(args,(counter+1));
      });
    }
  }
  fire_event_Sentence(args){
    if(this.on_envent_sentences){
      this.fire_one(args,0);
    }
  }
//----
  on_discret_sentence(that){
    if(!this.on_envent_discret_sentences){
      this.on_envent_discret_sentences= [];
    }
    this.on_envent_discret_sentences.push(that);
  }
  fire_discret_one(args,counter0){
    let counter = counter0;
    if(this.on_envent_discret_sentences[counter]){
      this.on_envent_discret_sentences[counter](this.name,args,()=>{
         this.fire_discret_one(args,(counter+1));
      });
    }
  }
  fire_event_discret_sentence(args){
    if(this.on_envent_discret_sentences){
      this.fire_discret_one(args,0);
    }
  }


  init(){
    let self = this;
    this.speakIt = new SpeechSynthesisUtterance();
    this.speakIt.voice = speechSynthesis.getVoices()[32];
    this.speakIt.lang= "en-US";
    this.speakIt.rate=1;
    this.speakIt.onend= ()=>{
      self.isTalking = false;
      if(self.cEvents["doneSpeaking"]){
        self.cEvents["doneSpeaking"]();
      }
      // console.log("dobe speaking..s..s.s...s..");
      self.listen();
    }
    //recognition
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.msSpeechRecognition)();
    this.recognition.lang ='en-US';//'en-US';'fr-FR'
    this.recognition.interimResults = true;

    this.recognition.onresult = (event)=>{
      if(self.cEvents["onresult"]){
        self.cEvents["onresult"]();
      }
      self.handleTranslation(event);
    };

    this.recognition.onboundary = function(event) {
    //  console.log('onboundary');
       //console.log(event.name + ' boundary reached after ' + event.elapsedTime + ' milliseconds.');
    }
    this.recognition.onaudiostart = function(event){
      // console.log('onaudiostart');
       if(self.cEvents["onaudiostart"]){
         self.cEvents["onaudiostart"]();
       }
    }
    this.recognition.onsoundend = function(event){
        //console.log('onsoundend');
       if(self.cEvents["onsoundend"]){
         self.cEvents["onsoundend"]();
       }
    }
    this.recognition.onaudioend = function(event) {
      //console.log('onaudioend');
        if(self.cEvents["onaudioend"]){
          self.cEvents["onaudioend"]();
        }
    }

    this.recognition.onerror = function(event){
    //  console.log('onerror',event.error);
      if(self.cEvents["onerror"]){
        self.cEvents["onerror"](event);
      }
      if(event.error=== "no-speech"){

      }else if (event.error=== 'aborted') {
        self.stop = true;
      }
    }

    this.recognition.onend = function(event) {
       if(self.cEvents["onend"]){self.cEvents["onend"](event);}
       if(self.cEvents["end"]){self.cEvents["end"](event); delete self.cEvents["end"]}
       self.nameCalled(false);
       if(!self.stop){
         self.listen();
       }
    }
    this.recognition.onstart = function(event) {
      self.recStarted = true;
    }

    this.recognition.onspeechstart = function(e) {
    //  console.log('Speech has been detected');
      if(self.cEvents["onspeechstart"]){
        self.cEvents["onspeechstart"](e);
      }
    }
   this.recognition.onspeechend = function(e) {
     //console.log('Speech has stopped being detected');
     if(self.cEvents["onspeechend"]){
       self.cEvents["onspeechend"](e);
     }
   }
   this.recognition.onnomatch = function(e) {
    //  console.log('Speech not recognised');
      if(self.cEvents["onnomatch"]){
        self.cEvents["onnomatch"](e);
      }
    }

    // this.actorView = $(`<div style='width:70px; height:70px; border-radius:100%; border:1px solid dodgerblue; position:absolute; top:3px; left:3px; text-align:center;line-height:70px;box-shadow: 0 0 5px #aaaaaa;'>${this.name}</div>`);
    // if(this.host){
    //   this.host.append(this.actorView);
    //   this.actorView.draggable();
    // }

    // this.speakView = $(`<div style='width:100px; height:100px; border-radius:100%; border:1px solid dodgerblue; position:absolute; top:3px; right:3px; text-align:center;line-height:100px;'>Speak</div>`);
    // if(this.host){
    //   this.host.append(this.speakView);
    // }
    // this.actorView.click(function(e){
    //   e.stopPropagation();
    //   self.listen();
    // });
    // this.speakView.click(function(e){
    //   e.stopPropagation();
    //   self.speak("hi");
    // });
    this.initView();
  }
  initView(){
    if(this.actorView){
      this.actorView.remove();
    }
    if(this.speakView){
      this.speakView.remove();
    }
    this.actorView = $(`<div style='width:70px; height:70px; border-radius:100%; border:1px solid dodgerblue; position:absolute; top:3px; left:3px; text-align:center;line-height:70px;box-shadow: 0 0 5px #aaaaaa;'>${this.name}</div>`);
    if(this.host){
      this.host.append(this.actorView);
      this.actorView.draggable();
    }

    this.speakView = $(`<div style='width:100px; height:100px; border-radius:100%; border:1px solid dodgerblue; position:absolute; top:3px; right:3px; text-align:center;line-height:100px;'>Speak</div>`);
    if(this.host){
      this.host.append(this.speakView);
    }
    this.actorView.click((e)=>{
      e.stopPropagation();
      this.listen();
    });
    this.speakView.click((e)=>{
      e.stopPropagation();
      this.speak("hi");
    });
  }
  doneSpeaking(){

  }
  doneListening(){
   if(this.keepListening){
     //this.listen();
     console.log("DOne listenong",this.isListening);

   }
  }
  stopRec(){
    try {
      this.stop = true;
      this.recognition.abort();
    } catch (e) {
       console.log("Error aborting.......");
    }
  }
  listen(){
      try {
        this.stop = false;
        this.recognition.start();
      } catch (e) {
        console.log("Error try listening.......",e);
      }
  }
  speak(text){
    let self = this;
    this.on("end",function(){
      self.isTalking = true;
      self.speakIt.voice = speechSynthesis.getVoices()[32];
      self.speakIt.text= text;
      speechSynthesis.speak(self.speakIt);
      console.log("start speaking");
    });
    this.stop = true;
    this.recognition.abort();
  }
}
