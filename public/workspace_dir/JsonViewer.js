class JsonViewer {
    constructor(args) {
      this.height = args.height ? args.height : 500;
      this.width = args.width ? args.width : "100%";
      this.data = args.data;
      this.data_structure = {};
      this.host = args.host;
      this.styles = {
        subtitles: "color:grey; font-size:0.7em;",
        strings: "color:rgb(255,153,153); font-size:0.8em;",
        numbers: "color:steelblue; font-size:0.8em;font-weight:bold;",
        booleans: "color:coral; font-size:0.8em;font-weight:bold;",
        objects: "color:white; font-size:0.7em;",
        arrays: "color:white; font-size:0.7em;",
        one: `margin-left:30px; border-left:2px solid black;padding-left:10px;font-size:10px;color:grey;`,
        dots: `color:grey; font-size:inherit;`,
        arrows: `color:grey; font-size:inherit;`,
        array_idx: `color:grey; font-size:inherit;position:relative;`,
        carets: `font-size:inherit;color:grey; font-weight:bold;`,
        title_names: `font-size:inherit;color:grey;`,
        one_hover_on: {
          "margin-left": "30px",
          "border-left": "2px solid black",
          "padding-left": "10px",
          "font-size": "10px",
          color: "grey"
        },
        one_hover_off: {
          "margin-left": "30px",
          "border-left": "2px solid dodgerblue",
          "padding-left": "10px",
          "font-size": "10px",
          color: "grey"
        },
        undefines: `color:red; font-size:inherit;`,
        input_field: `background-color:inherit; color:grey; outline:none; border:none; font-size:7px;margin-left:3px;`,
        option_fields: `background-color:inherit;color:grey;border:none;outline:none;`,
        submit: `background-color:inherit; outline:none; border:none; color:white;`
      };
      if (args.theme && args.theme === "white") {
        this.styles.objects = "color:black; font-size:0.7em;";
        this.styles.arrays = "color:black; font-size:0.7em;";
        this.styles.strings = "color:rgb(204,0,0); font-size:0.8em;";
        this.styles.title_names = `font-size:inherit;color:black;`;
        this.styles.one = `margin-left:30px; border-left:1px solid grey;padding-left:10px;font-size:10px;color:grey;`;
        this.styles.one_hover_on = {
          "margin-left": "30px",
          "border-left": "1px solid grey",
          "padding-left": "10px",
          "font-size": "10px",
          color: "grey"
        };
        this.styles.one_hover_off = {
          "margin-left": "30px",
          "border-left": "1px solid dodgerblue",
          "padding-left": "10px",
          "font-size": "10px",
          color: "grey"
        };
        this.styles.input_field = `background-color:inherit; color:white; outline:none; border:none; font-size:7px;`;
        this.styles.option_fields = `background-color:inherit;color:grey;border:none;outline:none;`;
        this.styles.submit = `background-color:inherit; outline:none; border:none; color:black;`;
      }
      this.main_view = $(
        `<div style='width:100%; height:${this.height}px; display:flex; flex-direction:column;'></div>`
      );
      this.tools_div = $(`<div style='width:100%;height:30px;'></div>`);
      let form = $(`<form style='display:inline-block;'></form>`);
      this.select_option = $(
        `<select  title='Sort by ' style='${this.styles.option_fields}'><option value='value'>Value</option><option value='key'>Key</option><option value='key_pair'>Key Pair</option></select>`
      );
      this.search_input = $(
        `<input type='text' style='${this.styles.input_field}' placeholder='Search'></input>`
      );
      this.search_btn = $(
        `<input type="submit" value="Search" style='${this.styles.submit}'>`
      );
      form.append(this.search_input, this.search_btn);
      this.display_area = $(
        `<div style='width:100%;height:${this.height -
          30}px; overflow:scroll;'></div>`
      );
      this.result_label = $(
        `<div style='display:inline-block; color:dodgerblue; font-size:inherit;'></div>`
      );
      this.tools_div.append(this.select_option, form, this.result_label);
      this.main_view.append(this.tools_div, this.display_area);
      this.host.append(this.main_view);
      form.on("submit", e => {
        e.preventDefault();
        e.stopPropagation();
        let target = this.select_option.val();
        let str = this.search_input.val().trim();
        let value = str;
        let key = str;
        if (target === "key_pair") {
          let temp = str.split(":");
          key = temp[0].trim();
          value = this.formatIt(temp[1].trim());
        } else if (target === "value") {
          value = this.formatIt(str);
        } else if (target === "key") {
          key = str;
        } else {
          return alert("error");
        }
  
        console.log(value, "value-------", key, "key");
        this.searchKeyWord({
          value: value,
          key: key,
          target: target ? target : false,
          done: founds => {
            this.showResults(founds);
          }
        });
      });
      this.init();
  
      // this.searchKeyWord({
      //   key:'branch',
      //   target:'key',
      //   done:(founds)=>{
      //     console.log("founds",founds);
      //   }
      // });
      //
      // this.searchKeyWord({
      //   key:'branch',
      //   value:'datascience',
      //   target:'key-pair',
      //   done:(founds)=>{
      //     console.log("founds",founds);
      //   }
      // });
    }
    changeHeight(height) {
      this.height = height;
      this.display_area.css({ height: this.height });
    }
    showResults(founds) {
      this.result_label.empty();
      this.current_results = { idx: 0 };
      if (founds && founds.length > 0) {
        this.autoOpen(founds[this.current_results.idx], g => {
          if (g) {
            g.html_elt.addClass("jsonViewerSearchHighlight");
            this.scrollViewToElem({
              elt: g.html_elt
            });
          }
          console.log("DATA STRUCTURE ", this.data_structure);
        });
        if (founds.length > 1) {
          let next = $(
            `<span style='font-size:0.8em; cursor:pointer;'> Next</span>`
          );
          let prev = $(
            `<span style='font-size:0.8em; cursor:pointer;'> Prev</span>`
          );
          next.click(e => {
            e.stopPropagation();
            if (founds[this.current_results.idx + 1]) {
              this.autoOpen(founds[this.current_results.idx + 1], g => {
                if (g) {
                  g.html_elt.addClass("jsonViewerSearchHighlight");
                  this.scrollViewToElem({
                    elt: g.html_elt
                  });
                }
                console.log("DATA STRUCTURE ", this.data_structure);
              });
              this.current_results.idx = this.current_results.idx + 1;
            }
          });
          prev.click(e => {
            e.stopPropagation();
            if (founds[this.current_results.idx - 1]) {
              this.autoOpen(founds[this.current_results.idx - 1], g => {
                if (g) {
                  g.html_elt.addClass("jsonViewerSearchHighlight");
  
                  this.scrollViewToElem({
                    elt: g.html_elt
                  });
                }
                console.log("DATA STRUCTURE ", this.data_structure);
              });
              this.current_results.idx = this.current_results.idx - 1;
            } else {
            }
          });
          this.result_label.append(
            prev,
            next,
            `<span style='font-size:0.8em; color:coral;'> ${founds.length}</span>`
          );
        } else {
          this.result_label.html(
            `<span style='font-size:inherit; color:coral;'> ${founds.length}</span>`
          );
        }
      }
    }
    formatIt(str) {
      if (Number(str)) {
        return Number(str);
      }
      if (str === "false") {
        return false;
      } else if (str === "true") {
        return true;
      } else if (str === `"false"`) {
        return "false";
      } else if (str === `"true"`) {
        return "true";
      } else {
        return str;
      }
    }
    init() {
      this.displayOne({
        data: this.data,
        host: this.display_area,
        location: "root"
      });
    }
    openOneByOne(args) {
      let current_id = args.steps[args.idx];
      if (!current_id) {
        return args.callBack();
      }
      if (current_id.length === 0 || current_id === "root") {
        this.openOneByOne({
          steps: args.steps,
          idx: args.idx + 1,
          previous: "root",
          callBack: args.callBack
        });
      } else {
        let elt = this.data_structure[args.previous + `.${current_id}`]
          ? this.data_structure[args.previous + `.${current_id}`]
          : false;
        console.log(args.previous + `.${current_id}`, elt);
        if (args.idx === args.steps.length - 1) {
          return args.callBack(elt);
        }
        if (elt) {
          if (!elt.visible) {
            elt.onReady = () => {
              this.openOneByOne({
                steps: args.steps,
                idx: args.idx + 1,
                previous: args.previous + `.${current_id}`,
                callBack: args.callBack
              });
            };
            elt.html_elt.trigger("click");
          } else {
            this.openOneByOne({
              steps: args.steps,
              idx: args.idx + 1,
              previous: args.previous + `.${current_id}`,
              callBack: args.callBack
            });
          }
        }
      }
    }
    scrollViewToElem(args) {
      let x_factor = this.display_area[0].offsetTop;
      this.display_area.animate({
        scrollTop: args.elt[0].offsetTop - x_factor
      });
    }
    autoOpen(path, callBack) {
      $(this.display_area.find(".jsonViewerSearchHighlight")).removeClass(
        "jsonViewerSearchHighlight"
      );
      let p = path.split(".");
      console.log(p, "paths");
      this.openOneByOne({
        steps: p,
        idx: 0,
        callBack: g => {
          return callBack(g);
        }
      });
    }
    cleanId(id) {
      return id;
    }
    searchKeyWord(param) {
      $(this.display_area.find(".jsonViewerSearchHighlight")).removeClass(
        "jsonViewerSearchHighlight"
      );
      let value = param.value;
      let key = param.key;
      let target = param.target;
      var count = 0;
      let founds = [];
      if (target === "value") {
        search({
          data: this.data,
          section: "root",
          target: "value",
          value: value
        });
      } else if (target === "key") {
        search({
          data: this.data,
          section: "root",
          target: "key",
          key: key
        });
      } else if (target === "key_pair") {
        search({
          data: this.data,
          section: "root",
          target: "key_pair",
          key: key,
          value: value
        });
      }
      function outOne() {
        count = count - 1;
        if (count <= 0) {
          param.done(founds);
        }
      }
      function search(args) {
        count++;
        if (Array.isArray(args.data)) {
          for (let i = 0; i < args.data.length; i++) {
            search({
              data: args.data[i],
              section: `${args.section}.[${i}]`,
              target: args.target,
              key: args.key,
              value: args.value
            });
          }
          return outOne();
        } else if (typeof args.data === "object") {
          if (!args.data) {
            if (args.target === "value" && args.value === "null") {
              founds.push(args.section);
            }
            return outOne();
          } else {
            for (let elt in args.data) {
              if (args.target === "key" && elt === args.key) {
                founds.push(args.section + `.${args.key}`);
              } else if (
                args.target === "key_pair" &&
                elt === args.key &&
                args.value === args.data[elt]
              ) {
                founds.push(args.section + `.${args.key}`);
              }
              search({
                data: args.data[elt],
                section: `${args.section}.${elt}`,
                target: args.target,
                key: args.key,
                value: args.value
              });
            }
            return outOne();
          }
        } else if (
          args.target === "value" &&
          (args.data === args.value ||
            (args.value.length === 0 && args.data && args.data.length === 0))
        ) {
          founds.push(args.section);
          return outOne();
        } else {
          return outOne();
        }
      }
    }
  
    checkDataType(data) {
      if (Array.isArray(data)) {
        return "array";
      } else if (typeof data === "number") {
        return "number";
      } else if (typeof data === "string") {
        return "string";
      } else if (typeof data === "object") {
        if (!data) {
          return "null";
        }
        return "object";
      } else if (typeof data === "boolean") {
        return "boolean";
      } else {
        return "undefined";
      }
    }
    previewObjectStrOnly(args) {
      let type = this.checkDataType(args.data);
      if (type === "object") {
        return `<span style='color:grey; font-size:inherit;'> {...}</span>`;
      } else if (type === "array") {
        return `<span style='color:grey; font-size:inherit;'> [...]</span>`;
      } else if (type === "string") {
        return `<span style='color:grey; font-size:inherit;'> "${
          args.data.length > 10 ? "........" : args.data
        }"</span>`;
      } else if (type === "number") {
        return `<span style='color:grey; font-size:inherit;'> ${args.data}</span>`;
      } else if (type === "boolean") {
        return `<span style='color:grey; font-size:inherit;'> ${args.data}</span>`;
      }
    }
    previewObjectStr(args) {
      let type = this.checkDataType(args.data);
      if (!args.data) {
        return args.data;
      } else {
        if (type === "object") {
          let str = `<i class='previews' style='font-size:0.9em;'> { `;
          let keys = Object.keys(args.data);
          let limit = keys.length > 2 ? 2 : keys.length;
          for (let i = 0; i < limit; i++) {
            str += `${i === 0 ? "" : ","} ${
              keys[i]
            }: ${this.previewObjectStrOnly({ data: args.data[keys[i]] })}`;
          }
          str += `${limit < keys.length ? ", ....." : ""}}</i>`;
          return str;
        } else if (type === "array") {
          let str = `<i class='previews' style='font-size:0.9em;'>[ `;
          let limit = args.data.length > 2 ? 2 : args.data.length;
          for (let i = 0; i < limit; i++) {
            str += `${i === 0 ? "" : ","} ${i}: ${this.previewObjectStrOnly({
              data: args.data[i]
            })}`;
          }
          str += `${limit < args.data.length ? ", ....." : ""} ]</i>`;
          return str;
        }
      }
    }
    displayOne(args, callBack) {
      if (!args.data) {
        return callBack({ err: `no data` });
      }
      if (!args.host) {
        return callBack({ err: `no host` });
      }
      let type = this.checkDataType(args.data);
      if (type === "object") {
        for (let elt in args.data) {
          ((name, data) => {
            let u_id = this.makeid();
            let new_location = args.location + `.${name}`;
            let div = $(
              `<div class='${this.cleanId(name)}' data-name='${u_id}' style='${
                this.styles.one
              }'></div>`
            );
            // div.hover(()=>{
            //   div.css(this.styles.one_hover_on);
            // },()=>{
            //   div.css(this.styles.one_hover_off);
            // });
            args.host.append(div);
            div.hide();
            let title = $(
              `<span class='titles' style='position:relative;'> <span style='${this.styles.title_names}'>${name}</span></span>`
            );
            this.data_structure[new_location] = { html_elt: title };
            let its_type = this.checkDataType(data[name]);
            if (its_type === "string") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              if (data[name].length > 1000) {
                //title.css({"cursor":"pointer"});
                let x = $(
                  `<span style='${this.styles.strings} font-size:0.7em;' data-open='false'>"${data[name]}"</span>`
                );
                // let x_content = $(`<span class='c-long-strings' style='font-size:inherit; color:inherit;'>"${data[name].substring(0,10)+'.....'}"</span>`);
                // x.append(x_content);
                title.append(x);
                // title.click((e)=>{
                //   e.stopPropagation();
                //   if(x[0].dataset.open ==='true'){
                //      x_content.toggle("fast","swing");
                //   }else {
                //     x_content.html(data[name]);
                //     x[0].dataset.open = true;
                //   }
                // });
              } else {
                let x = $(
                  `<span style='${this.styles.strings}'> "${data[name]}"</span>`
                );
                title.append(x);
              }
            } else if (its_type === "number") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(
                `<span style='${this.styles.numbers}'> ${data[name]}</span>`
              );
              title.append(x);
            } else if (its_type === "boolean") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(
                `<span style='${this.styles.booleans}'> ${data[name]}</span>`
              );
              title.append(x);
            } else if (its_type === "object") {
              title.css({ cursor: "pointer" });
              title.append(
                `<span class='${u_id}_arrow' style='${this.styles.arrows}'><i class="fa fa-caret-right" style="${this.styles.carets}"></i></span>`
              );
              let x = $(
                `<span style='${this.styles.objects}'> ${this.previewObjectStr({
                  data: data[name]
                })}</span>`
              );
              title.append(x);
            } else if (its_type === "array") {
              title.css({ cursor: "pointer" });
              title.append(
                `<span class='${u_id}_arrow' style='${this.styles.arrows}'><i class="fa fa-caret-right" style="${this.styles.carets}"></i></span>`
              );
              let x = $(
                `<span style='${this.styles.arrays}'> ${this.previewObjectStr({
                  data: data[name]
                })} <span style='color:inherit; font-size:inherit;'>[${
                  data[name].length
                }]</span></span>`
              );
              title.append(x);
            } else if (its_type === "null" || its_type === "undefined") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(
                `<span style='${this.styles.undefines}'> ${its_type}</span>`
              );
              title.append(x);
            }
            div.append(title);
            div.show("fast", "swing");
            title.click(e => {
              e.stopPropagation();
              if (its_type === "object" || its_type === "array") {
                let is_area = div.find(`.${u_id}`);
                let preview = title.find(".previews");
                preview.toggle();
                if (is_area.length > 0) {
                  is_area.toggle("fast", "swing", () => {
                    let area_arrow = div.find(`.${u_id}_arrow`);
                    if (is_area.is(`:visible`)) {
                      area_arrow.html(
                        `<i class="fa fa-caret-down" style="${this.styles.carets}"></i>`
                      );
                      if (this.data_structure[new_location].onReady) {
                        this.data_structure[new_location].onReady();
                        delete this.data_structure[new_location].onReady;
                      }
                      this.data_structure[new_location].visible = true;
                    } else {
                      area_arrow.html(
                        `<i class="fa fa-caret-right" style="${this.styles.carets}"></i>`
                      );
                      this.data_structure[new_location].visible = false;
                    }
                  });
                } else {
                  let object_area = $(
                    `<div class='${u_id}' style='background-color:inherit;'></div>`
                  );
                  div.append(object_area);
                  let area_arrow = div.find(`.${u_id}_arrow`);
                  area_arrow.html(
                    `<i class="fa fa-caret-down" style="f${this.styles.carets}"></i>`
                  );
                  this.displayOne({
                    data: data[name],
                    host: object_area,
                    location: new_location
                  });
                  if (this.data_structure[new_location].onReady) {
                    this.data_structure[new_location].onReady();
                    delete this.data_structure[new_location].onReady;
                  }
                  this.data_structure[new_location].visible = true;
                  this.data_structure[new_location].is_ready = false;
                }
              }
            });
          })(elt, args.data);
        }
      } else if (type === "array") {
        for (let i = 0; i < args.data.length; i++) {
          ((idx, data) => {
            let u_id = this.makeid();
            let new_location = args.location + `.[${idx}]`;
            let div = $(
              `<div class='${this.cleanId(
                "idx_" + idx
              )}' data-name='${u_id}' style='${this.styles.one}'></div>`
            );
            args.host.append(div);
            // div.hover(()=>{
            //   div.css(this.styles.one_hover_on);
            // },()=>{
            //   div.css(this.styles.one_hover_off);
            // });
            div.hide();
            let title = $(
              `<span class='titles' style='${this.styles.array_idx}'> <span style='${this.styles.title_names}'>${idx}</span></span>`
            );
            this.data_structure[new_location] = { html_elt: title };
            let its_type = this.checkDataType(data);
            if (its_type === "string") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(`<span style='${this.styles.strings}'> "${data}"</span>`);
              title.append(x);
            } else if (its_type === "number") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(`<span style='${this.styles.numbers}'> ${data}</span>`);
              title.append(x);
            } else if (its_type === "boolean") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(`<span style='${this.styles.booleans}'> ${data}</span>`);
              title.append(x);
            } else if (its_type === "null" || its_type === "undefined") {
              title.append(`<span style='${this.styles.dots}'>:</span>`);
              let x = $(
                `<span style='${this.styles.undefines}'> ${its_type}</span>`
              );
              title.append(x);
            } else if (its_type === "object" || its_type === "array") {
              title.append(
                `<span class='${u_id}_arrow' style='${this.styles.arrows}'><i class="fa fa-caret-right" style="${this.styles.carets}"></i></span>`
              );
              let x_elt = false;
              if (its_type === "object") {
                x_elt = $(
                  `<span style='${this.styles.objects}'> ${this.previewObjectStr({
                    data: data
                  })}</span>`
                );
                title.append(x_elt);
              } else if (its_type === "array") {
                x_elt = $(
                  `<span style='${this.styles.arrays}'> ${this.previewObjectStr({
                    data: data
                  })} <span style='color:inherit; font-size:inherit;'>[${
                    data.length
                  }]</span></span>`
                );
                title.append(x_elt);
              }
              if (x_elt) {
                title.css({ cursor: "pointer" });
                title.click(e => {
                  e.stopPropagation();
                  let is_area = div.find(`.${u_id}`);
                  let preview = title.find(".previews");
                  preview.toggle();
                  if (is_area.length > 0) {
                    is_area.toggle("fast", "swing", () => {
                      let area_arrow = div.find(`.${u_id}_arrow`);
                      if (is_area.is(`:visible`)) {
                        area_arrow.html(
                          `<i class="fa fa-caret-down" style="${this.styles.carets}"></i>`
                        );
                        if (this.data_structure[new_location].onReady) {
                          this.data_structure[new_location].onReady();
                          delete this.data_structure[new_location].onReady;
                        }
                        this.data_structure[new_location].visible = true;
                      } else {
                        area_arrow.html(
                          `<i class="fa fa-caret-right" style="${this.styles.carets}"></i>`
                        );
                        this.data_structure[new_location].visible = false;
                      }
                    });
                  } else {
                    let object_area = $(
                      `<div class='${u_id}' style='background-color:inherit;'></div>`
                    );
                    div.append(object_area);
                    let area_arrow = div.find(`.${u_id}_arrow`);
                    area_arrow.html(
                      `<i class="fa fa-caret-down" style="${this.styles.carets}"></i>`
                    );
                    this.displayOne({
                      data: data,
                      host: object_area,
                      location: new_location
                    });
                    if (this.data_structure[new_location].onReady) {
                      this.data_structure[new_location].onReady();
                      delete this.data_structure[new_location].onReady;
                    }
                    this.data_structure[new_location].visible = true;
                    this.data_structure[new_location].is_ready = false;
                  }
                });
              }
            }
            // else if(its_type ==='object'){
            //   let x = $(`<span style='${this.styles.objects}'> Object</span>`);
            //   title.append(x);
            // }else if(its_type ==='array'){
            //   let x = $(`<span style='${this.styles.arrays}'> Array <span style='color:rgb(255,102,102); font-size:inherit;'>[${data.length}]</span></span>`);
            //   title.append(x);
            // }
            div.append(title);
            div.show("fast", "swing");
          })(i, args.data[i]);
        }
      }
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
  }
  