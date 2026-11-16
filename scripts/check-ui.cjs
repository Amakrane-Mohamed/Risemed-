const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const delay=()=>new Promise(resolve=>setTimeout(resolve,25));
(async()=>{
 const errors=[];
 const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost/app.html#/login',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};w.matchMedia=()=>({matches:true,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};
 w.addEventListener('error',e=>errors.push(e.error));
 w.eval(fs.readFileSync('ui-dist/rise-ui.js','utf8'));
 w.eval(['js/store.js','js/sample.js','js/app.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n')+'\nwindow.QA={Store,render,readDraft};');
 const q=s=>w.document.querySelector(s);
 assert(q('.rm-auth'),'New React login mounted');
 assert(q('#password').type==='password');
 q('[aria-label="Show password"]').click();await delay();assert.equal(q('#password').type,'text');
 q('[aria-label="Hide password"]').click();await delay();assert.equal(q('#password').type,'password');
 w.location.hash='#/signup';await delay();assert(q('#name'),'Signup name field mounted');assert(q('.rm-submit').textContent.includes('Create account'));
 const Store=w.QA.Store;
 Store.adopt({id:'test-ui',name:'Test Participant',email:'test@example.invalid',onboarded:false,step:0,role:'',languages:[]});w.QA.render();await delay();
 assert(q('.rm-role-grid'),'New questionnaire mounted');assert(q('.rm-question-actions button[type="submit"]').disabled);
 q('#role-youth').click();await delay();assert.equal(Store.current().role,'youth');assert(!q('.rm-question-actions button[type="submit"]').disabled);
 function submit(){q('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));return delay();}
 await submit();assert(q('#onboard-town'));assert.equal(q('[role="progressbar"]').getAttribute('aria-valuenow'),'25');
 q('#onboard-town').value='Kasserine';q('[data-lang="ar"]').click();q('#stage-idea').click();await delay();await submit();assert(q('#goal'));
 q('#goal').value='Test my idea with five customers';q('#project-name').value='Local Project';q('#project-about').value='A useful local service';await submit();assert(q('.rm-review-card'));assert(q('.rm-review-card').textContent.includes('Local Project'));assert(q('.rm-review-card').textContent.includes('Kasserine'));
 q('[data-act="back-step"]').click();await delay();assert.equal(q('#goal').value,'Test my idea with five customers');await submit();await submit();await delay();
 assert(q('.dashboard-welcome'),'Completed questionnaire opens workspace');assert.equal(Store.current().onboarded,true);
 // Supporter branch also uses the same accessible components and review.
 Store.adopt({id:'test-supporter',name:'Test Supporter',email:'supporter@example.invalid',role:'investor',onboarded:false,step:1,town:'Tunis',languages:['fr']});w.QA.render();await delay();assert(!q('.rm-stage-grid'));await submit();
 assert(q('#focus'));q('[data-help="mentoring"]').click();q('#focus').value='Local food businesses';await submit();assert(q('#before-meeting'));q('#before-meeting').value='A short description of the business idea';await submit();await delay();assert.equal(Store.current().onboarded,true);assert(q('.workspace-bar'));
 // Authentication still calls the existing Supabase adapter; no real network call.
 Store.logout();w.location.hash='#/login';await delay();
 let credentials;
 w.RISE_CONFIG={supabaseUrl:'https://test.invalid',supabaseAnonKey:'test-key'};
 w.supabase={createClient:()=>({auth:{signInWithPassword:async value=>{credentials=value;return {data:{user:{id:'signed-in',email:value.email,user_metadata:{full_name:'Signed In',role:'youth',onboarded:true,languages:['en']}}},error:null}}}})};
 q('#email').value='signin@example.invalid';q('#password').value='example-password';await submit();await delay();
 assert.equal(credentials.email,'signin@example.invalid');assert(q('.dashboard-welcome'));assert.equal(Store.current().id,'signed-in');
 assert.deepEqual(errors,[]);
 console.log('PASS: React login/signup, password visibility, role selection, participant questionnaire, back navigation, saved values, progress, review, supporter questionnaire, workspace handoff.');
 dom.window.close();
})().catch(error=>{console.error(error);process.exitCode=1});
