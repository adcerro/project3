document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Default loads the inbox
  load_mailbox("inbox");
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
  document.querySelector('#compose-form').addEventListener('submit',async (event)=> {
    event.preventDefault();
    const response = await fetch('/emails',{
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({
        recipients:document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value.charAt(0).toUpperCase() + document.querySelector('#compose-subject').value.slice(1),
        body: document.querySelector('#compose-body').value
      })
    });
    if(response.ok){
      load_mailbox('sent');
    }
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
        let mailButton = document.createElement("button");
        mailButton.className = "btn btn-outline-dark";
        mailButton.onclick = ()=>{console.log("hi");};
        let buttonContent = 
        ` <div class="row mx-1 align-items-center">
            <div class="col">
              <strong>${element.recipients}</strong>
            </div>
            <div class="col-6">
              ${element.subject}
            </div>
            <div class="col text-end">
              ${element.timestamp}
            </div>
          </div>`;
        mailButton.innerHTML = mailButton.innerHTML + buttonContent;
        emailview.appendChild(mailButton);
      });
    }else{
    emails.forEach(element => {
      let mailButton = document.createElement("button");
      mailButton.className = `btn ${element.read?'btn-secondary':'btn-outline-dark'} btn-block`;
      let buttonContent = 
      `<div class="row mx-1 align-items-center">
          <div class="col">
            <strong>${element.sender}</strong>
          </div>
          <div class="col-6">
            ${element.subject}
          </div>
          <div class="col text-end">
            ${element.timestamp}
          </div>
        </div>`;
       mailButton.innerHTML = mailButton.innerHTML + buttonContent;
       emailview.appendChild(mailButton);
    });}
});
}
function load_email(id){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
}