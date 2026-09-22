window.addEventListener('beforeunload',e=>{
  if(session?.status==='active'){
    saveSession();
    e.preventDefault();
    e.returnValue='';
  }
});