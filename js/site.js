(function(){
'use strict';
const menu=document.querySelector('.menu-btn'),nav=document.getElementById('site-nav');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');});
nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.getElementById('year').textContent=new Date().getFullYear();
const heroVideo=document.querySelector('.hero-video');
heroVideo.addEventListener('click',()=>{const frame=heroVideo.querySelector('iframe');frame.src='https://www.youtube-nocookie.com/embed/7slY-PE8sLM?autoplay=1&controls=1&playsinline=1&rel=0';heroVideo.classList.add('has-sound');heroVideo.setAttribute('aria-label','RISE MED video playing with sound');});
const paths={start:{level:'GETTING STARTED / BEGINNER',title:'Develop your first<br>business idea.',description:"Explore social entrepreneurship, understand a local challenge and shape a simple business model. You don't need to have it all figured out.",items:['Find a problem worth solving',"Understand who you're building for",'Sketch your business model'],symbol:'01',label:'START WITH A LOCAL CHALLENGE',color:'#e7eddd'},build:{level:'BUSINESS SKILLS / INTERMEDIATE',title:'Build the skills<br>behind the business.',description:'Make sense of your numbers and learn how to reach the people who need your work. Turn practical knowledge into decisions you can use.',items:['Work out costs and set your prices','Explore digital marketing for local businesses','Use AI tools in your everyday work'],symbol:'02',label:'WORK ON THE BUSINESS BASICS',color:'#e6ece9'},grow:{level:'FUNDING & GROWTH / ADVANCED',title:'Give your project<br>room to grow.',description:'Tell a clear story about your project, prepare your pitch and understand what you need from a mentor or investor.',items:['Build a clear project pitch','Explore funding and investor readiness','Connect with peers and potential supporters'],symbol:'03',label:'PREPARE FOR GROWTH',color:'#f0e8d6'}};
const tabs=[...document.querySelectorAll('[data-path]')];
function selectTab(tab){const data=paths[tab.dataset.path];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});document.getElementById('learning-panel').setAttribute('aria-labelledby',tab.id);document.getElementById('path-level').textContent=data.level;document.getElementById('path-title').innerHTML=data.title;document.getElementById('path-description').textContent=data.description;document.getElementById('path-items').replaceChildren(...data.items.map(item=>{const li=document.createElement('li');li.textContent=item;return li;}));document.querySelector('.path-symbol').textContent=data.symbol;document.querySelector('.path-label').textContent=data.label;document.querySelector('.path-art').style.background=data.color;}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=tabs[(index+1)%tabs.length];if(event.key==='ArrowLeft')next=tabs[(index+tabs.length-1)%tabs.length];if(event.key==='Home')next=tabs[0];if(event.key==='End')next=tabs[tabs.length-1];if(next){event.preventDefault();selectTab(next);next.focus();}});});
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!window.gsap)return;
gsap.from('.hero-copy > *',{y:22,opacity:0,duration:.85,stagger:.09,ease:'power3.out',clearProps:'all'});
gsap.from('.hero-video',{y:35,opacity:0,duration:1.2,ease:'power3.out'});


if(window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:30,duration:.8,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 94%',once:true},clearProps:'transform'}));}
})();
