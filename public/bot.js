function Bot(param){
    this.signaling;
    this.signaling_head;
    this.jumping;
    this.moveTime;
    this.node;
    this.x=0;
    this.y=0;
    this.parent =param.body;
    this.scale=param.scale?param.scale:0.8;
    this.rotation=0;
    this.isSignaling=false;
    this.isSignaling_head=false;
    this.isJumping = false;
    this.left_arm;
    this.right_arm;
    this.left_leg;
    this.right_leg;
    this.foreArm_left;
    this.hands_color =param.hands_color;
    this.svg = param.svg;
    this.create({id:param.body,width: param.width,height:param.height});
  }
   Bot.prototype.move = function(param){
     var that=this;
     var x = (param.x?param.x:0);
     var y = (param.y?param.y:0);
     this.x=x;
     this.y=y;
     try {
       that.node.on("end",()=>{
         if(param.callBack){
           param.callBack();
         }
       }).transition().attr("transform", "translate("+x+", "+y+") rotate("+this.rotation+") scale("+this.scale+")").duration(param.speed?param.speed:100);
  
     }catch(e){
      console.log("ADS BOT",e);
     }
   }
   Bot.prototype.rotate = function(num){
     this.rotation=num;
     this.node.transition()
     .attr("transform", "translate("+this.x+", "+this.y+") rotate("+this.rotation+") scale("+this.scale+")")
     .duration(1000);
   }
   Bot.prototype.sized = function(num){
     this.scale=num;
     this.node.transition()
     .attr("transform", "translate("+this.x+", "+this.y+") rotate("+this.rotation+") scale("+num+")")
     .duration(1000);
   }
   Bot.prototype.hide = function(){
     var this_bot = this;
     //this_bot.rotate(30);
     this_bot.move({
       x:-10,  //10
       y:0,
       callBack:function(){
         this_bot.sized(0.5);
         this_bot.move({
           x:6,  //10
           y:10,
           callBack:function(){
             this_bot.move({
               x:6,  //10
               y:12,
               callBack:function(){
                // console.log("done");
                 this_bot.jump();
                  setTimeout(function(){
                    this_bot.stop("jumping");
                  },3000);
              },
            });
          },
        });
      },
    });
   }
  Bot.prototype.signal = function(col){
    var color = (col?col:"yellow");
    this.isSignaling = color;
    clearInterval(this.signaling);
    var x_counter =0, that = this;
    this.signaling = setInterval(function(){
      var fills =["white",color];
      var strokes = ["steelblue",color];
      $(".bot_eyes").css({
        "fill":fills[x_counter],
        "stroke": strokes[x_counter],
      });
      if(x_counter===0){
        x_counter =1;
      }else {
        x_counter =0;
      }
    },500);
  }
  Bot.prototype.changeColor = function(args){
    this.rotateArm("left",{
      direction:"left",
      degree:100,
      speed:100,
      callBack:()=>{
        for(let i =0; i< args.styles.length; i++){
          let obj = {};
          if(args.styles[i].stroke){
            obj["stroke"] = args.styles[i].color;
          }
          if(args.styles[i].fill){
            obj["fill"] = args.styles[i].color;
          }
          $(`.${args.styles[i].target}`).css(obj);
        }
      setTimeout(()=>{
         this.rotateForeArm("left",{direction:"left", degree:30, speed:100});
         this.rotateForeArm("right",{direction:"left", degree:90, speed:100});
      },500);
    },
  });
  }
  Bot.prototype.signal_head = function(col){
    var color = (col?col:"yellow");
    this.isSignaling_head = color;
    clearInterval(this.signaling_head);
    var x_counter =0, that = this;
    this.signaling_head = setInterval(function(){
      var fills =["steelblue",color];
      var strokes = ["steelblue",color];
      $(".light").css({
        "fill":fills[x_counter],
        "stroke": strokes[x_counter],
      });
      if(x_counter===0){
        x_counter =1;
      }else {
        x_counter =0;
      }
    },500);
  }
  Bot.prototype.jump = function(){
    this.isJumping = true;
    clearInterval(this.jumping);
    var x_counter =-1;
    var that = this;
    this.jumping = setInterval(function(){
      var y = that.y - (5*x_counter);
      that.node.transition()
      .attr("transform", "translate("+that.x+", "+y+") rotate("+that.rotation+") scale("+that.scale+")")
      .duration(100)
      .select('.light')
      .attr("transform", "translate(0, "+(((-4)*x_counter))+")")
      .delay(750)
      if(x_counter===-1){
        x_counter =1;
      }else {
        x_counter =-1;
      }
    //  this.y=y;
    },100);
  }
  Bot.prototype.stop = function(what){
    $(".bot_eyes").css({
      "fill":"white",
      "stroke":"steelblue",
    });
    clearInterval(this[what]);
    if(what==="jumping"){
      this.isJumping = false;
       this.node.transition()
      .select('.light')
      .attr("transform", "translate(0,0)")
      .duration(100)
      this.node.transition()
      .attr("transform", "translate("+this.x+", "+this.y+") rotate("+this.rotation+") scale("+this.scale+")")
      .duration(100)
    }else if (what==="signaling") {
      this.isSignaling = false;
    }
    else if (what==="signaling_head") {
      this.isSignaling_head = false;
      $(".light").css({
        "fill":"steelblue",
        "stroke": "steelblue",
      });
    }
  }
  Bot.prototype.rotateArm = function(arm,param){
    var direction= param.direction, deg = param.degree, speed=param.speed;
    try {
      if(arm ==="left"){
        var deg_sign =(direction==="left"?"+":"-");
        this.left_arm.transition()
        .attr("transform", "rotate("+deg_sign+""+deg+",25, 53)")
        .duration(speed)
        .on("end", function(){
          if(param.callBack){
            param.callBack();
          }
        });
      }else if (arm==="right") {
        var deg_sign =(direction==="left"?"+":"-");
        this.right_arm.transition()
        .attr("transform", "rotate("+deg_sign+""+deg+",75, 53)")
        .duration(speed)
        .on("end", function(){
          if(param.callBack){
            param.callBack();
          }
        });
      }
    } catch (e) {
      console.log();
    }
  }
  Bot.prototype.rotateForeArm = function(arm,param){
    var direction= param.direction, deg = param.degree, speed=param.speed;
    try {
      if(arm ==="left"){
        var deg_sign =(direction==="left"?"+":"-");
        this.foreArm_left.transition()
        .attr("transform", "rotate("+deg_sign+""+deg+",20, 70)")
        .duration(speed)
        .on("end", function(){
          if(param.callBack){
            param.callBack();
          }
        });
      }else if (arm==="right") {
        var deg_sign =(direction==="left"?"+":"-");
        this.foreArm_right.transition()
        .attr("transform", "rotate("+deg_sign+""+deg+",80, 70)")
        .duration(speed)
        .on("end", function(){
          if(param.callBack){
            param.callBack();
          }
        });
      }
    } catch (e) {
  
    }
  
  }
  Bot.prototype.duty = function(){
    var that = this;
    this.is_on_duty = true;
    that.rotateArm("left",{direction:"right", degree:0, speed:100});
    that.rotateForeArm("left",{direction:"left", degree:0, speed:100});
    that.rotateArm("right",{direction:"left", degree:0, speed:100});
    that.rotateForeArm("left",{direction:"right", degree:90, speed:100});
    that.rotateArm("left",{
      direction:"left",
      degree:100,
      speed:100,
      callBack:function(){
      setTimeout(function(){
         that.rotateForeArm("left",{direction:"left", degree:30, speed:100});
         that.rotateForeArm("right",{direction:"left", degree:90, speed:100});
      },500);
    },
  });
    that.rotateArm("right",{direction:"left", degree:10, speed:100});
  }
  Bot.prototype.say_hi = function(){
    var that = this;
    //console.log("say hi");
    that.rotateArm("left",{direction:"left", degree:110, speed:100});
  //   that.rotateForeArm("left",{direction:"left", degree:0, speed:100});
  //   that.rotateArm("right",{direction:"left", degree:0, speed:100});
  //   that.rotateForeArm("left",{direction:"right", degree:90, speed:100});
  //   that.rotateArm("left",{
  //     direction:"left",
  //     degree:100,
  //     speed:100,
  //     callBack:function(){
  //     setTimeout(function(){
  //        that.rotateForeArm("left",{direction:"left", degree:30, speed:100});
  //        that.rotateForeArm("right",{direction:"left", degree:90, speed:100});
  //     },500);
  //   },
  // });
  //   that.rotateArm("right",{direction:"left", degree:10, speed:100});
  }
  Bot.prototype.relax = function(){
    var that = this;
    that.rotateArm("left",{direction:"right", degree:0, speed:100});
    that.rotateForeArm("left",{direction:"left", degree:0, speed:100});
    that.rotateArm("right",{direction:"left", degree:0, speed:100});
    that.rotateForeArm("left",{direction:"right", degree:90, speed:100});
    this.is_on_duty = false;
    //that.rotateArm("right",{direction:"left", degree:10, speed:100});
  }
  Bot.prototype.lean = function(param){
    var that = this;
    var direction= param.direction, deg = param.degree, speed=param.speed;
    var deg_sign =(direction==="left"?"+":"-");
    this.node.transition()
    .attr("transform", "translate("+this.x+", "+this.y+") rotate("+deg_sign+""+deg+",50,15) scale("+this.scale+")")
    .duration(speed)
    .on("end", function(){
      if(param.callBack){
        param.callBack();
      }
    });
  }
  Bot.prototype.rotateLeg = function(leg,param){
    var direction= param.direction, deg = param.degree, speed=param.speed;
   if(leg ==="left"){
     var deg_sign =(direction==="left"?"+":"-");
     this.left_leg.transition()
     .attr("transform", "rotate("+deg_sign+""+deg+",33, 90)")
     .duration(speed)
     .on("end", function(){
       if(param.callBack){
         param.callBack();
       }
     });
   }else if (leg==="right") {
     var deg_sign =(direction==="left"?"+":"-");
     this.right_leg.transition()
     .attr("transform", "rotate("+deg_sign+""+deg+",67, 90)")
     .duration(speed)
     .on("end", function(){
       if(param.callBack){
         param.callBack();
       }
     });
   }
  }
  Bot.prototype.create = function(param){
    var width =param.width;
    var height = param.height;
    var arm_color = (this.hands_color?this.hands_color:"black");
    var svg = false;
    if(this.svg){
       svg = d3.select(this.svg[0]);
    }else{
       svg = d3.select(param.id).append("svg").attr("width", width).attr("height", height).attr("border",1);
    }
  
  
        var node = svg.selectAll(".node")
            .data([1])
            .enter().append("g")
            .attr("transform", "translate(400, -30) rotate(30) scale( 0.5 ) ")
            .style("filter", "url(#drop-shadow)")
            .on("click",function(d){
                 //console.log("mouse Entered");
            })
            .attr("class", function(d){
              return "the_bot";
            });
            //border
           //  var borderPath = svg.append("rect")
           // .attr("x", 0)
           // .attr("y", 0)
           // .attr("height", height)
           // .attr("width", width)
           // .style("stroke", "blue")
           // .style("fill", "none")
           // .style("stroke-width", 1);
           // filters go in defs element
           var defs = svg.append("defs");
  
           // create filter with id #drop-shadow
           // height=130% so that the shadow is not clipped
           var filter = defs.append("filter")
           .attr("id", "drop-shadow")
           .attr("height", "300%");
  
           // SourceAlpha refers to opacity of graphic that this filter will be applied to
           // convolve that with a Gaussian with standard deviation 3 and store result
           // in blur
           filter.append("feGaussianBlur")
           .attr("in", "SourceAlpha")
           .attr("stdDeviation", 3)
           .attr("result", "blur");
  
           // translate output of Gaussian blur to the right and downwards with 2px
           // store result in offsetBlur
           filter.append("feOffset")
           .attr("in", "blur")
           .attr("dx", 1)
           .attr("dy", 5)
           .attr("result", "offsetBlur");
  
           // overlay original SourceGraphic over translated blurred opacity by using
           // feMerge filter. Order of specifying inputs is important!
           var feMerge = filter.append("feMerge");
  
           feMerge.append("feMergeNode")
           .attr("in", "offsetBlur")
           feMerge.append("feMergeNode")
           .attr("in", "SourceGraphic");
           //gradient
           var mainGradient = defs.append('linearGradient')
              .attr('id', 'mainGradient');
  
          // Create the stops of the main gradient. Each stop will be assigned
          // a class to style the stop using CSS.
          mainGradient.append('stop')
              .attr('class', 'stop-left')
              .attr('offset', '0');
  
          mainGradient.append('stop')
              .attr('class', 'stop-right')
              .attr('offset', '1');
         //wheel gradient
        var wheelGradient = defs.append('linearGradient')
            .attr('id', 'wheelGradient');
        wheelGradient.append('stop')
            .attr('class', 'wheel_stop-left')
            .attr('offset', '0.3');
  
        wheelGradient.append('stop')
            .attr('class', 'wheel_stop-middle')
            .attr('offset', '0.5');
        wheelGradient.append('stop')
            .attr('class', 'wheel_stop-right')
            .attr('offset', '0.7');
        // add the nodes
        //neck
        node.append("circle")
            .attr("r",15)
            .attr("cx",50)
            .attr("fill", "white")
            .attr("stroke", "lightblue")
            .attr("stroke-width", 1)
            .attr("class","neck")
            .attr("cy", 50);
       //head
        node.append("ellipse")
        .attr("cx", 50)
        .attr("cy", 35)
        .attr("rx", 25)
        .attr("ry", 15)
        .attr("fill", "url(#mainGradient)");
  
        //body
        node.append("path")
        .attr("d", "M 30 50 C 30 50 50 60 70 50 C 70 50 70 70 60 90 L 40 90 C 40 90 30 70 30 50 ") //C 30 50 30 70 40 60
        .attr("stroke", "grey")
        .attr("stroke-width", 2)
        .attr("fill", "url(#mainGradient)");
        node.append("rect")
            .attr("x", 25)
            .attr("y",28)
            .attr("width",50)
            .attr("height",14)
            .attr("fill", "rgb(37, 40, 40)")
            .attr("stroke", "none")
            .attr("stroke-width", 1);
        //left eye
        node.append("circle")
            .attr("r", 5)
            .attr("cx",38)
            .attr("fill", "white")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("class","bot_eyes")
            .attr("cy", 35);
       //right eye
        node.append("circle")
            .attr("r", 5)
            .attr("cx",62)
            .attr("fill", "white")
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("class","bot_eyes")
            .attr("cy", 35);
       //power
        node.append("circle")
            .attr("r", 10)
            .attr("cx",50)
            .attr("fill", "white")
            .attr("stroke", "lightblue")
            .attr("stroke-width", 3)
            .attr("class","power")
            .attr("cy", 70);
        node.append("path")
        .attr("d", "M 45 75 C 45 75 45 60 50 70 C 50 70 53 75 55 65 ")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 2)
        // .attr("transform", "translate(5, -47)")
        .attr("fill", "none");
        node.append("circle")
            .attr("r", 3)
            .attr("cx",50)
            .attr("fill", "steelblue")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3)
            .attr("class","light")
            .attr("cy", 15);
        var handL = node.append("g");//.attr("transform", "translate(0, 0) rotate(-30,25, 53)");
        var handR = node.append("g");//.attr("transform", "translate(0, 0) rotate(-30,75, 53)");
        //shoulder left
        handL.append("circle").attr("r", 3).attr("cx",25).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","shoulder-left left-m-c").attr("cy", 53);
        handL.append("line").attr("x1", 25).attr("y1",53).attr("x2", 20).attr("y2",70).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","arm-left left-m-l");
        var foreArmL = handL.append("g");
        foreArmL.append("circle").attr("r", 3).attr("cx",20).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","elbow-left left-m-c").attr("cy", 70);
        foreArmL.append("line").attr("x1", 20).attr("y1",70).attr("x2", 0).attr("y2",65).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","foreArm-left left-m-l");
        foreArmL.append("circle").attr("r", 3).attr("cx",0).attr("fill", "grey").attr("stroke", "grey").attr("stroke-width", 3).attr("class","hand-left").attr("cy", 65);
        //shoulder right
        handR.append("circle").attr("r", 3).attr("cx",75).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","shoulder-right right-m-c").attr("cy", 53);
        handR.append("line").attr("x1", 75).attr("y1",53).attr("x2", 80).attr("y2",70).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","arm-right right-m-l");
        var foreArmR = handR.append("g");
        foreArmR.append("circle").attr("r", 3).attr("cx",80).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","elbow-right right-m-c").attr("cy", 70);
        foreArmR.append("line").attr("x1", 80).attr("y1",70).attr("x2", 100).attr("y2",65).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","foreArm-right right-m-l");
        foreArmR.append("circle").attr("r", 3).attr("cx",100).attr("fill", "grey").attr("stroke", "grey").attr("stroke-width", 3).attr("class","hand-right").attr("cy", 65);
        var legL = node.append("g");
        var legR = node.append("g");
            //hip left
        legL.append("circle").attr("r", 3).attr("cx",33).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","hip-left left-m-c").attr("cy", 90);
        legL.append("polyline").style("stroke", arm_color).style("fill", "none").attr("stroke-width", 3).attr("points", "30,93 25,105 25, 120").attr("class","left-m-l");
        legL.append("ellipse").attr("cx", 25).attr("cy", 120).attr("rx", 7).attr("ry", 3).attr("fill", "steelblue");
        //hip right
        legR.append("circle").attr("r", 3).attr("cx",67).attr("fill", arm_color).attr("stroke", arm_color).attr("stroke-width", 3).attr("class","hip-right right-m-c").attr("cy", 90);
        legR.append("polyline").style("stroke", arm_color).style("fill", "none").attr("stroke-width", 3).attr("points", "70,93 75,105 75, 120").attr("class","leg-right right-m-l");
        legR.append("ellipse").attr("cx", 75).attr("cy", 120).attr("rx", 7).attr("ry", 3).attr("fill", "steelblue");
  
        this.node = node;
        this.left_arm = handL;
        this.right_arm= handR;
        this.left_leg = legL;
        this.right_leg= legR;
        this.foreArm_left = foreArmL;
        this.foreArm_right = foreArmR;
        this.duty();
  }
  