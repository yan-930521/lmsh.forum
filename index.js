/**
 * Copyright 2021 yan-930521  All Rights Reserved.
 */

var socket = io('https://lmshforumserver.sakuraeinfach.repl.co', {
  "transports": ['websocket']
});
var text = document.getElementById('text');
var sendblock = document.getElementById('send-block');
var al = document.getElementById('alert');
var home = document.getElementById('type-首頁');
home.innerHTML = '<p></p><p></p><h1>歡迎！</h1><h3 class="alert alert-secondary" role="alert">注意事項</h3><pre class="alert alert-primary" role="alert"><h3># 請勿人身攻擊<br># 請勿散播假消息<br># 開車要注意車速<br># 本站不提供私訊系統<br># 本站在手機端會稍微跑版<br># 老師請勿進入</h3></pre><h2 class="alert alert-danger" role="alert">本站之訊息傳輸接受<a href="https://developer.mozilla.org/zh-TW/docs/Learn/Getting_started_with_the_web/HTML_basics">HTML</a>語法<br>一旦發現訊息有任何問題，請大家立刻點選『ban』按鈕暫時隱藏</h2><br>Copyright 2021 yan-930521  All Rights Reserved.';
var Msgs = false;
var Data = false;
var Load = false;
var User = {
  name: "user",
  id: "0",
  role: []
}
var nowfloor;
var nowty = false;
var nowcl = false;
var nowch = false;
allowsend(false);
socket.on("ALLmessage", d => {
  Data = d;
  let tyary = {};
  for (let ty in Data) {
    let clary = {};
    for (let cl in Data[ty]) {
      let chary = {};
      for (let ch in Data[ty][cl]) {
        let msgary = [];
        for (let m = 0; m < Data[ty][cl][ch]['messages'].length; m++) {
          nowfloor = m;

          let msg = handleMsg(Data[ty][cl][ch]['messages'][m]);
          msgary.push(msg);
          // .onclick = () => {}
        }
        chary[ch] = msgary;
      }
      clary[cl] = chary;
    }
    tyary[ty] = clary;
  }
  Msgs = tyary;
  Load = true;
});
socket.on('NewMessage', msg => {
  console.log(msg);
  nowfloor++;
  let { ty, cl, ch } = msg;
  Data[ty][cl][ch]['messages'].push(msg);
  Msgs[ty][cl][ch].push(handleMsg(msg));
  showMsg(ty, cl, ch)
})

window.onkeydown = e => {
  if (event.keyCode == 13) {
    sendMsg();
    e.preventDefault();
  }
}

function setwrong(str) {
  al.innerHTML = str;
}
function allowsend(b) {
  if (b) {
    sendblock.innerHTML = '<button class="btn btn-outline-secondary" type="button" id="send-btn" onclick="sendMsg()">send</button>';
  } else {
    sendblock.innerHTML = '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">send</button>';
    setwrong('請先選擇頻道');
  }
}
function sendMsg() {
  if (!nowch) {
    alert("plz choose a channel");
    return;
  }
  if (text.value == "") {
    return;
  }
  let m = new Msg(text.value, User.name, User.id, nowty, nowcl, nowch, new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }))
  socket.emit("CreateMessage", m);
  text.value = "";
}
function removeAll(na) {
  let d1 = document.querySelector(na);
  let child = d1.lastElementChild;
  while (child) {
    d1.removeChild(child);
    child = d1.lastElementChild;
  }
}

function showCl(ty) {
  if (!Data) {
    alert('尚未連接到伺服器');
    return;
  }
  if (!Load) {
    alert('尚未載入完畢');
    return;
  }
  removeAll(`.now-class`);
  removeAll(`.now-channel`);
  removeAll(`.now-messages`);
  nowty = ty;
  nowcl = false;
  nowch = false;
  allowsend(false);
  let d1 = document.querySelector(`.now-class`);
  for (let cl in Data[ty]) {
    let d2 = document.createElement('button');
    let d3 = document.createElement('div');
    d2.className = "btn btn-dark btn-lg";
    d2.innerHTML = cl;
    d2.onclick = () => {
      showCh(ty, cl);
    }
    d3.appendChild(d2);
    d1.appendChild(d3);
  }
}

function showCh(ty, cl) {
  removeAll(`.now-class`);
  removeAll(`.now-channel`);
  removeAll(`.now-messages`);
  nowty = ty;
  nowcl = cl;
  nowch = false;
  allowsend(false);
  let d1 = document.querySelector(`.now-channel`);
  for (let ch in Data[ty][cl]) {
    let d2 = document.createElement('button');
    let d3 = document.createElement('div');
    d2.className = "btn btn-secondary";
    d2.innerHTML = ch;
    d2.onclick = () => {
      showMsg(ty, cl, ch)
    }
    d3.appendChild(d2);
    d1.appendChild(d3);
  }
}
function showMsg(ty, cl, ch) {
  removeAll(`.now-messages`);
  nowty = ty;
  nowcl = cl;
  nowch = ch;
  allowsend(true);
  let d1 = document.querySelector(`.now-messages`);
  for (let i in Msgs[ty][cl][ch]) {
    d1.appendChild(Msgs[ty][cl][ch][i]);
  }
}
function handleTime(msgob) {
  let timestr = "";
  let d = new Date(msgob.timestamp).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  let now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
  if (d.split('/')[0] != now.split('/')[0]) {
    timestr += `${d.split('/')[0]}年 ${d.split('/')[1]}月 ${d.split('/')[2].split(' ')[0]}日 `;
  } else {
    if (d.split('/')[1] != now.split('/')[1]) {
      timestr += `${d.split('/')[1]}月 `;
    }
    if (d.split('/')[2].split(' ')[0] != now.split('/')[2].split(' ')[0]) {
      timestr += `${d.split('/')[2].split(' ')[0]}日 `;
    }
    if (d.split('/')[0] == now.split('/')[0] && d.split('/')[1] == now.split('/')[1] && d.split('/')[2].split(' ')[0] == now.split('/')[2].split(' ')[0]) {
      timestr += `今天 `;
    }
  }
  timestr += `${d.split(' ')[1].split(':')[0]}:${d.split(' ')[1].split(':')[1]}`;
  return timestr;
}

function handleMsg(msgob) {
  let msg = document.createElement('div');
  let str = document.createElement('div');
  let content = linkifyHtml(msgob.content);
  let timestr = handleTime(msgob);
  //str.className = "msgs"
  //let more = checkUrl(msgob.content);
  str.innerHTML = `<span class="badge badge-pill badge-secondary">第${nowfloor}樓</span>` + ` ${msgob.author.name ? msgob.author.name : "匿名"} - <span class="badge badge-pill badge-light">${timestr}</span><br>${removehref(msgob.content)}<br><img src="">`;//+more?`<br>${more}`:"";
  //str.innerHTML = `<span class="badge badge-pill badge-light "> 第${nowfloor}樓 </span>` + ` ${msgob.author.name ? msgob.author.name : "匿名"} - ${timestr}<br>      ${removehref(msgob.content)}`;//+more?`<br>${more}`:"";
  msg.appendChild(str);
  return msg;
}
function removehref(str) {
  str = str.replace("<a","<a onclick='return false;'");
  return str;
}
/*
function checkUrl(str) {
  let ans = linkify.find(str);
  let insert = "";
  for (let link in ans) {
    if (ans[link].type != "url") continue;
    let l = ans[link].value;
    
    let img = new Image();
    img.src = l;
    img.onload = () => {
      insert += `<video controls loop autoplay muted src="${l}"></video>`;
    }
    img.onerror = () => {
      let video = document.createElement("video");
      video.src = l;
      video.onload = () => {
        insert += `<video controls loop autoplay src="${l}"></video>`;
      }
      video.onerror = () => {
        let audio = new Audio();
        audio.src = l;
        audio.onload = () => {
          insert += `<audio controls autoplay src="${l}"></audio>`;
        }
      }
    }
    
  }
  return insert;
}*/

class Msg {
  constructor(content, name, id, ty, cl, ch, t) {
    this.content = content;
    this.name = name;
    this.id = id;
    this.ty = ty;
    this.cl = cl;
    this.ch = ch;
    this.t = t;
  }
}
//https://getbootstrap.com/docs/4.1/components/button-group/
//someParentObject.insertBefore(someChildObject,someParentObject.firstChild);
//http://www.denisvlasov.net/129/javascript-prependchild/