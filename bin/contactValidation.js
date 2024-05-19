const emailRegex = /^[a-zA-Z0-9._%+-]+@deakin.edu.au$/;
const unitCodeRegex = /^[a-zA-Z]{3}\d{3}$/;
const phoneRegex = /^\d{10}$/;

export const contactValidation = () => {
  event.preventDefault();

  const firstName = document.getElementById("firstNameInput").value;
  const lastName = document.getElementById("lastNameInput").value;
  const email = document.getElementById("emailInput").value;
  const message = document.getElementById("messageInput").value;

  const nameValidation = (name) => !!name || "You did not enter your name";
  const emailValidation = (email) => emailRegex.test(email) || "Must be your Deakin email '@deakin.edu.au'.";
  const messageValidation = (message) =>
    (!!message && message.length <= 100) || "Message cannot be empty or over 100 characters.";

  const validateField = (validateFn, value, spanId) => {
    const spanElement = document.getElementById(spanId);
    const result = validateFn(value);

    if (result === true) {
      spanElement.textContent = "Valid";
      spanElement.className = "form-text text-success";
    } else {
      spanElement.textContent = result;
      spanElement.className = "form-text text-danger";
    }
  };

  validateField(nameValidation, firstName, "firstNameFeedback");
  validateField(nameValidation, lastName, "lastNameFeedback");
  validateField(emailValidation, email, "emailFeedback");
  validateField(messageValidation, message, "messageFeedback");
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", contactValidation);
});
