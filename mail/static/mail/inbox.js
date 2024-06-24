document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  document.querySelector('#compose-form').addEventListener('submit',async ()=> {
    await fetch('/emails',{
      method:'POST',
      body:JSON.stringify({
        recipients:document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value.charAt(0).toUpperCase() + document.querySelector('#compose-subject').value.slice(1),
        body: document.querySelector('#compose-body').value
      })
    }).then(response => load_mailbox('sent'));
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`).then(response => response.json()).then(emails => {
    const emailview = document.querySelector('#emails-view');
    if(mailbox==='sent'){
      emails.forEach(element => {
        let card = 
        `<div class="card my-1">
          <div class="row mx-1">
            <div class="col">
              <strong>${element.recipients}</strong>
            </div>
            <div class="col">
              ${element.subject}
            </div>
            <div class="col ml-auto">
              ${element.timestamp}
            </div>
            <a href="emails/${element.id}" class="stretched-link"></a>
          </div>
         </div>`;
        emailview.innerHTML = emailview.innerHTML + card;
      });
    }else{
    emails.forEach(element => {
      let card = 
      `<div class="card my-1 ${element.read?'bg-secondary':''}">
        <div class="row mx-1">
          <div class="col">
            <strong>${element.sender}</strong>
          </div>
          <div class="col">
            ${element.subject}
          </div>
          <div class="col ml-auto">
            ${element.timestamp}
          </div>
          <a href="emails/${element.id}" class="stretched-link"></a>
        </div>
       </div>`;
      emailview.innerHTML = emailview.innerHTML + card;
    });}
});
}
function load_email(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
}