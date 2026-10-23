"use strict";
Promise.all(['head','footer'].map(async name=>{
 const target=document.getElementById(`site-${name==='head'?'header':'footer'}`);
 try{const response=await fetch(`./${name}.html`);if(!response.ok)throw Error(response.status);target.innerHTML=await response.text();if(name==='head')target.querySelector('a[href="./blog.html"]')?.setAttribute('aria-current','page');}
 catch(error){console.error('No se pudo cargar el fragmento',name,error);if(name==='head'){const a=document.createElement('a');a.href='./index.html';a.textContent='ADMINIO · Inicio';target.replaceChildren(a);}}
}));
const search=document.getElementById('blog-search');
if(search){
 let category='Todos';
 const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const cards=[...document.querySelectorAll('.blog-card')];
 function filter(){const words=normalize(search.value).trim().split(/\s+/).filter(Boolean);let count=0;for(const card of cards){card.hidden=!(category==='Todos'||card.dataset.category===category)||!words.every(word=>normalize(card.dataset.search).includes(word));if(!card.hidden)count++;}document.getElementById('result-count').textContent=`${count} ${count===1?'artículo disponible':'artículos disponibles'}`;document.getElementById('empty-results').hidden=count!==0;}
 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filter();}));
 search.addEventListener('input',filter);
 document.getElementById('clear-search').addEventListener('click',()=>{search.value='';document.querySelector('[data-filter="Todos"]').click();search.focus();});
}
document.getElementById('quota-form')?.addEventListener('submit',event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const budget=document.getElementById('budget').valueAsNumber,share=document.getElementById('share').valueAsNumber,individual=document.getElementById('individual').valueAsNumber;
 const output=document.getElementById('quota-output');if(![budget,share,individual].every(Number.isFinite)||budget<0||share<0||share>100||individual<0){output.textContent='Revisa los importes y usa un porcentaje entre 0 y 100.';return;}
 const money=n=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n);
 const common=Math.round((budget*share/100+Number.EPSILON)*100)/100;
 output.textContent=`Cuota estimada: ${money(common+individual)}. Gasto común: ${money(common)} + consumo individual: ${money(individual)}.`;
});
document.getElementById('print-article')?.addEventListener('click',()=>window.print());
