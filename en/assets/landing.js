(() => {
  const toggle=document.querySelector('[data-menu-toggle]'), nav=document.querySelector('.nav');
  const setOpen=open=>{nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu')};
  toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  window.addEventListener('resize',()=>{if(innerWidth>760)setOpen(false)});
  const form=document.querySelector('[data-lead-form]'),status=document.querySelector('[data-form-status]');
  form.addEventListener('submit',e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));if(data.company)return;
    const body=`Name: ${data.name}\nReply to: ${data.contact}\n\nProject and growth goals:\n${data.project}`;
    const mailto='mailto:my@srmtnkv.ru?subject='+encodeURIComponent('Growth plan enquiry')+'&body='+encodeURIComponent(body);
    status.replaceChildren(document.createTextNode('Your draft is ready. Review and send it in your email app. '));
    const open=document.createElement('a');open.href=mailto;open.textContent='Open email draft';status.append(open);
    const copy=document.createElement('button');copy.type='button';copy.className='copy-enquiry';copy.textContent='Copy enquiry instead';
    copy.addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText('To: my@srmtnkv.ru\nSubject: Growth plan enquiry\n\n'+body);copy.textContent='Copied — paste into your email';}
      catch{const area=document.createElement('textarea');area.value='To: my@srmtnkv.ru\nSubject: Growth plan enquiry\n\n'+body;area.setAttribute('aria-label','Enquiry to copy');area.readOnly=true;status.append(area);area.select();copy.textContent='Select and copy the text below';}
    });
    status.append(copy);window.location.href=mailto;
  });
})();
