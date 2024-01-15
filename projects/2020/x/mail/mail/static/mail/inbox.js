document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function removedynamics() {
  dynamics = [...document.getElementsByClassName("dynamic")]
  dynamics.forEach(t => {
    t.remove();
  })
}
function compose_email() {

  // Show compose view and hide other views
  removedynamics();
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';




  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_to_email(id) {
  // Show compose view and hide other views
  removedynamics();
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
  const sliced = email.subject.slice(0,3);
  const subject = sliced == "Re:" ? email.subject :  `Re: ${email.subject}`;
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = `\n On ${email.timestamp}, ${email.sender} wrote: \n ${email.body}`;
});


  // Clear out composition fields
 
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  removedynamics();
  const inbox = mailbox == "inbox" ? true : false;
  const archive = mailbox == "archive" ? true : false;
  const sent = mailbox == "sent" ? true : false;
  const ev = document.querySelector('#emails-view')
  ev.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      if(emails.length == 0){
        ev.innerHTML = `<h4>No items found</h4>`
      }else{
      emails.forEach(element => {
        const nd = document.createElement('div');
        
        nd.setAttribute('class',`relative email-teaser border p-3 rounded dynamic ${inbox && element.read ? 'bg-light': ''} ${!sent ? 'padded':""}`);
        nd.setAttribute('data-id', element.id)
        nd.setAttribute('data-source', mailbox)
        nd.innerHTML = `
        <div class="mail-teasers subject dynamic"><span class="text-secondary">Subject: </span>${element.subject}</div>
        ${inbox || archive ? 
          `<div class="mail-teasers sender dynamic"><span class="text-secondary"> Sender: </span>${ element.sender }</div>
        <div class"mail-teasers timestamp dynamic"><span class="text-secondary"> Date: </span>  ${ element.timestamp }</div>
        `
        
        : 
        `
        <div class="mail-teasers sender dynamic"> Recipient/s: ${ element.recipients }</div>
        <div class"mail-teasers timestamp dynamic"> Sent at  ${ element.timestamp }</div>
        
        `}`
        ev.append(nd);
        if(!sent){
          const arch = document.createElement('btn')
          arch.innerHTML = inbox ? "Archive" : "Unarchive";
          arch.setAttribute('class',`btn btn-primary dynamic btn-sm archiver ml-3`)
          arch.setAttribute('onclick', inbox ? `archive(${element.id})` : `unarchive(${element.id})`)
          ev.append(arch);
        }
        
        
        
        
        


      });
      const item_containers = [...document.getElementsByClassName('email-teaser')]
      item_containers.forEach(element =>{
        element.addEventListener("click", mailclicked)
        // element.addEventListener("click", (element)=> alert(element.dataset[id]))
      })
      }
      // ... do something else with emails ...
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


//send email

function send_email(f){
  f.preventDefault()
  const rec = document.getElementById("compose-recipients").value;
  const sub = document.getElementById("compose-subject").value;
  const bod = document.getElementById("compose-body").value;
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: bod
    })
  })
  .then(response => response.json())
  .then(result => {
      
      if(result.message){
        load_mailbox("sent")
      }else if(result.error){
        show_message(result)
      }
  });
}

function show_message(m){
  const errbox = document.getElementById('errorbox')
  const element = document.createElement('div');
  element.setAttribute('class', `dynamic alert ${m.error ? "alert-danger" : "alert-success"}`)
  element.setAttribute("id", "pagealert")
  element.innerHTML = `${m.error ? m.error : m.message} <button id='xer' type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button> `;
  errbox.append(element)
  const btnx = document.getElementById('xer')
  btnx.addEventListener("click", ()=> document.getElementById("pagealert").remove());

}
function mailclicked(){
  fetch(`/emails/${this.dataset.id}`)
.then(response => response.json())
.then(email => {
    // Print email
    removedynamics();
    console.log(email);
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    const ev = document.querySelector('#email-view');
    const mb = `
    <div class="mailbody p-2 border rounded by-0 dynamic">
      <h5 class="mt-2 mb-0"> <span class="text-secondary">Subject : </span>${email.subject}</h5>
      <div id="m-details" class="dynamic mailelement py-2"><small><span class="maillabel text-secondary">Sender :</span> ${email.sender}</small><br/>
      <small><span class="maillabel text-secondary">Recipients :</span> ${email.recipients}</small><br/>
      <small><span class="maillabel text-secondary">Date : </span>${email.timestamp}</small></div>
    <div id="m-body" class="dynamic mailelement py-2">${email.body}</div>
    ${ this.dataset.source != 'sent' ? `<btn class="btn btn-sm btn-primary" onclick="reply_to_email(${email.id})">Reply</btn> `:""}
    </div>`
    
    ev.innerHTML = mb;
    ev.style.display = 'block';

    if(this.dataset.source != sent && !email.read){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }
    // ... do something else with email ...
});
}

function archive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  }).then(()=>load_mailbox("inbox"))
}
function unarchive(id){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  }).then(()=> load_mailbox("inbox"))
}
