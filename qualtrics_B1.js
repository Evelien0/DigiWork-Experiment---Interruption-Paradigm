/*
  IMPORTANT: ADD THIS BLOCK TO THE EXISTING B1 JAVASCRIPT.
  Keep the original B1 chatbot addOnload unchanged.
  Replace the example URL below with YOUR ACTUAL GitHub Pages URL.
  B1 must be alone on its Qualtrics page.
*/
Qualtrics.SurveyEngine.addOnReady(function () {
    var self = this;
    var TRIAL = "B1"; // Change to B2, B3, B4 in other questions.
    var PAGE_URL = "https://YOUR-USERNAME.github.io/digiwork-interruption/index.html";
    var INTERVAL_MS = 30000;
    var FIELD = "interrupt_" + TRIAL + "_log";
    var HOST_ORIGIN;
    try { HOST_ORIGIN = new URL(PAGE_URL).origin; }
    catch (err) { console.error('Configure PAGE_URL first', err); return; }
    var alive = true;
    var activePopup = false;
    var pending = null;
    var count = 0;
    var history = [];
    var timerId = null;
    var desktopNotification = null;
    var pane = document.createElement('div');
    pane.style.cssText = 'position:fixed;top:18px;right:18px;z-index:2147483000;width:min(355px,calc(100vw - 36px));background:white;border:1px solid #b8c7d9;border-radius:12px;padding:15px;box-shadow:0 6px 30px #0003;font:14px Arial,sans-serif;display:none';
    document.body.appendChild(pane);
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483001;background:#0009;display:none;align-items:center;justify-content:center;padding:14px';
    var panel = document.createElement('div');
    panel.style.cssText = 'width:min(940px,100%);height:min(750px,95vh);background:white;border-radius:12px;overflow:hidden;display:flex;flex-direction:column';
    var title = document.createElement('div'); title.textContent='Email and calendar — Please respond before returning';
    title.style.cssText = 'padding:12px 16px;border-bottom:1px solid #ddd;font:bold 16px Arial';
    var iframe = document.createElement('iframe');
    iframe.title='Interruption: meeting request and calendar';
    iframe.style.cssText='width:100%;flex:1;border:0';
    panel.appendChild(title);panel.appendChild(iframe);overlay.appendChild(panel);document.body.appendChild(overlay);
    function save(){ Qualtrics.SurveyEngine.setEmbeddedData(FIELD,JSON.stringify(history)); }
    function stamp(){ return new Date().toISOString(); }
    function log(name,more){ history.push(Object.assign({event:name,at:stamp(),trial:TRIAL},more||{}));save(); }
    log('main_task_started');
    function schedule(){
      if(timerId) clearTimeout(timerId);
      if(alive && !activePopup && !pending) timerId=setTimeout(notify,INTERVAL_MS);
    }
    function notify(){
      if(!alive || activePopup || pending) return;
      count++;
      pending={eventId:TRIAL+'-'+count+'-'+Date.now(),createdAt:Date.now()};
      log('notification_shown',{eventId:pending.eventId,sequence:count});
      pane.innerHTML='';
      var header=document.createElement('strong');header.textContent='✉ New email — Meeting request';header.style.cssText='display:block;margin-bottom:8px';
      var details=document.createElement('div');details.textContent='Are you available Monday at 09:00? Open the email and check your calendar.';
      var open=document.createElement('button');open.type='button';open.textContent='Open email';
      open.style.cssText='margin-top:12px;padding:9px 14px;background:#1261cc;color:white;border:0;border-radius:7px;cursor:pointer';
      open.addEventListener('click',openEmail);
      pane.appendChild(header);pane.appendChild(details);pane.appendChild(open);pane.style.display='block';
      try {
        if('Notification' in window && Notification.permission==='granted'){
          desktopNotification=new Notification('New email — Meeting request',{body:'Are you available Monday at 09:00? Check your calendar.'});
          desktopNotification.onclick=function(){window.focus();openEmail();};
        }
      }catch(err){console.warn('Desktop notification unavailable',err);}
    }
    function openEmail(){
      if(!alive || !pending || activePopup) return;
      activePopup=true;
      log('email_opened',{eventId:pending.eventId,latency_ms:Date.now()-pending.createdAt});
      pane.style.display='none';
      if(desktopNotification){try{desktopNotification.close();}catch(e){}desktopNotification=null;}
      iframe.src=PAGE_URL+'?parentOrigin='+encodeURIComponent(window.location.origin)+'&trial='+encodeURIComponent(TRIAL)+'&eventId='+encodeURIComponent(pending.eventId);
      overlay.style.display='flex';
    }
    function receive(event){
      if(!alive || !activePopup || !pending) return;
      if(event.origin!==HOST_ORIGIN || event.source!==iframe.contentWindow) return;
      var data=event.data||{};
      if(data.type!=='DIGIWORK_INTERRUPT_ANSWER'||data.trial!==TRIAL||data.eventId!==pending.eventId) return;
      if(data.answer!=='Yes' && data.answer!=='No') return;
      log('answer_submitted',{eventId:pending.eventId,answer:data.answer,correct:data.answer==='Yes',time_since_notification_ms:Date.now()-pending.createdAt});
      pending=null;activePopup=false;overlay.style.display='none';iframe.src='about:blank';
      log('main_task_resumed');schedule();
    }
    window.addEventListener('message',receive);
    // Desktop notification permission must be requested on a genuine click.
    // The experiment remains usable if permission is not granted.
    var permissionRow=document.createElement('div');
    permissionRow.style.cssText='margin:10px 0;padding:10px;border:1px solid #dce6f2;border-radius:8px;font:13px Arial';
    var permissionButton=document.createElement('button');permissionButton.textContent='Enable desktop email alerts (optional)';
    permissionButton.type='button';permissionButton.style.cssText='padding:9px;background:#eaf1ff;border:1px solid #aabed8;border-radius:6px;cursor:pointer';
    var permissionStatus=document.createElement('span');permissionStatus.style.cssText='display:block;margin-top:7px;color:#666';
    permissionStatus.textContent='In-survey email alerts will appear even without desktop permission.';
    permissionButton.addEventListener('click',function(){
      if(!('Notification' in window)){permissionStatus.textContent='Desktop notifications are unsupported; in-survey alerts remain active.';return;}
      Notification.requestPermission().then(function(result){permissionStatus.textContent='Desktop notifications: '+result+'. In-survey alerts remain active.';}).catch(function(){permissionStatus.textContent='Desktop permission unavailable; in-survey alerts remain active.';});
    });
    permissionRow.appendChild(permissionButton);permissionRow.appendChild(permissionStatus);
    self.questionContainer.insertBefore(permissionRow,self.questionContainer.firstChild);
    self.digiworkInterruptCleanup=function(){
      alive=false;if(timerId)clearTimeout(timerId);
      window.removeEventListener('message',receive);
      if(desktopNotification){try{desktopNotification.close();}catch(e){}}
      if(pending) log('main_task_left_with_pending_notification',{eventId:pending.eventId});
      else log('main_task_left');
      pane.remove();overlay.remove();permissionRow.remove();
    };
    schedule();
});
Qualtrics.SurveyEngine.addOnUnload(function(){
    if(this.digiworkInterruptCleanup)this.digiworkInterruptCleanup();
});
