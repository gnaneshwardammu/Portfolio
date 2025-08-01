document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#contact form").addEventListener("submit", function (event) {
        event.preventDefault();
        
        let name = document.querySelector("input[name='name']").value;
        let email = document.querySelector("input[name='email']").value;
        let recipient = document.querySelector("input[name='recipient']").value;
        let message = document.querySelector("textarea[name='message']").value;
        
        let mailtoLink = `mailto:${recipient}?subject=Message from ${name}&body=From: ${name} (${email})%0D%0A%0D%0A${message}`;
        
        window.location.href = mailtoLink;
    });
});
