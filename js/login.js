// Show / Hide Password
const passwordButtons = document.querySelectorAll(".password-button");

passwordButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const input = document.getElementById(button.dataset.target);
    const showPassword = input.type === "password";

    input.type = showPassword ? "text" : "password";
    button.textContent = showPassword ? "Hide" : "Show";
    button.setAttribute("aria-pressed", showPassword);
  });
});

const message = document.querySelector("#message");

// Sign In
const loginForm = document.querySelector("#login-form");

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.querySelector("#username").value.trim();
    const password = document.querySelector("#password").value;

    message.classList.add("error");

    if (username === "") {
      message.textContent = "Please enter your username or email.";
      return;
    }

    // Hyrja demonstrative e adminit
    if (username === "admin") {
      if (password === "admin") {
        window.location.href = "../html/admin.html";
      } else {
        message.textContent = "Incorrect admin password.";
      }

      return;
    }

    if (password.length < 8) {
      message.textContent =
        "Password must contain at least 8 characters.";
      return;
    }

    // Kalimi demonstrues ne faqen kryesore
    window.location.href = "index.html";
  });

  loginForm.addEventListener("input", clearMessage);
}

// Sign Up
const registerForm = document.querySelector("#register-form");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.querySelector("#first-name");
    const lastName = document.querySelector("#last-name");
    const password = document.querySelector("#password");
    const confirmation = document.querySelector("#confirm-password");

    message.classList.add("error");

    if (firstName.value.trim() === "") {
      message.textContent = "Please enter your first name.";
      firstName.focus();
      return;
    }

    if (lastName.value.trim() === "") {
      message.textContent = "Please enter your last name.";
      lastName.focus();
      return;
    }

    if (password.value.length < 8) {
      message.textContent =
        "Password must contain at least 8 characters.";
      password.focus();
      return;
    }

    if (password.value !== confirmation.value) {
      message.textContent = "Passwords do not match.";
      confirmation.focus();
      return;
    }

    window.location.href = "../html/index.html";
  });

  registerForm.addEventListener("input", clearMessage);
}

// Pastron mesazhin kur korrigjohen te dhenat
function clearMessage() {
  message.textContent = "";
  message.classList.remove("error");
}