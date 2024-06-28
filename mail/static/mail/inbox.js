document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document
    .querySelector("#compose")
    .addEventListener("click", () => compose_email());

  // Adding the listener for sending mails only once, even if the form is hidden
  document
    .querySelector("#compose-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      fetch("/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject:
            document
              .querySelector("#compose-subject")
              .value.charAt(0)
              .toUpperCase() +
            document.querySelector("#compose-subject").value.slice(1),
          body: document.querySelector("#compose-body").value,
        }),
      }).then((response) => {
        if (response.ok) {
          load_mailbox("sent");
          console.log("sent");
        }
      });
    });

  // Default loads the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  // emails-view uses a bootstrap class which needs to be modified
  document.querySelector("#emails-view").className = "d-none";
  document.querySelector("#email-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  // emails-view uses a bootstrap class which needs to be modified
  document.querySelector("#emails-view").className = "d-grid gap-2";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      const emailsview = document.querySelector("#emails-view");
      if (mailbox === "sent") {
        emails.forEach((element) => {
          let mailButton = document.createElement("button");
          mailButton.className = "btn btn-outline-dark";
          mailButton.onclick = () => load_email(element.id, false);
          let buttonContent = ` <div class="row align-items-center">
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
          emailsview.appendChild(mailButton);
        });
      } else {
        emails.forEach((element) => {
          let mailButton = document.createElement("button");
          mailButton.className = `btn ${
            element.read ? "btn-secondary" : "btn-outline-dark"
          }`;
          mailButton.onclick = () => load_email(element.id, true);
          let buttonContent = `<div class="row align-items-center">
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
          emailsview.appendChild(mailButton);
        });
      }
    });
}
function load_email(id, isRecipient) {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  // emails-view uses a bootstrap class which needs to be modified
  document.querySelector("#emails-view").className = "d-none";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";

  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      document.querySelector("#email-sender").innerHTML = email.sender;
      document.querySelector("#email-recipients").innerHTML = email.recipients;
      document.querySelector("#email-subject").innerHTML = email.subject;
      let bodySection = document.querySelector("#email-body");
      // Clear any content inside the email-body div
      bodySection.innerHTML = "";
      email.body.split("\n").forEach((line) => {
        let p = document.createElement("p");
        p.innerHTML = line;
        bodySection.appendChild(p);
      });
      if (isRecipient) {
        fetch(`/emails/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        });
        document.querySelector("#recipient-options").style.display = "block";
        document.querySelector("#reply-button").onclick = () =>
          compose_reply(email);
        let archiveButton = document.querySelector("#archive-button");
        if (email.archived) {
          archiveButton.innerHTML = "Unarchive";
          archiveButton.onclick = () => unarchive(id);
        } else {
          archiveButton.innerHTML = "Archive";
          archiveButton.onclick = () => archive(id);
        }
      } else {
        document.querySelector("#email-archive").style.display = "none";
      }
    });
}
function archive(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: true }),
  }).then(response =>load_mailbox("inbox"));
}
function unarchive(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ archived: false }),
  }).then(response =>load_mailbox("inbox"));
  
}
function compose_reply(email) {
  compose_email();
  // Fill composition fields
  document.querySelector("#compose-recipients").value = email.sender;
  document.querySelector("#compose-subject").value =
    email.subject.substring(0, 4) === "Re: "
      ? email.subject
      : `Re: ${email.subject}`;
  document.querySelector(
    "#compose-body"
  ).value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n--------------------------------------`;
}
