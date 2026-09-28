// Theme toggle functionality
(function () {
    const themeLightBtn = document.getElementById("themeLightBtn");
    const themeDarkBtn = document.getElementById("themeDarkBtn");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
            if (themeDarkBtn) themeDarkBtn.classList.add("active");
            if (themeLightBtn) themeLightBtn.classList.remove("active");
            try {
                localStorage.setItem("theme", "dark");
            } catch (e) {
                // Ignore localStorage errors
            }
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            if (themeLightBtn) themeLightBtn.classList.add("active");
            if (themeDarkBtn) themeDarkBtn.classList.remove("active");
            try {
                localStorage.setItem("theme", "light");
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }

    // Initialize based on saved theme or system preference
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("theme");
    } catch (e) {
        // Fallback
    }

    if (savedTheme === "dark" || (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        applyTheme("dark");
    } else {
        applyTheme("light");
    }

    if (themeLightBtn) {
        themeLightBtn.addEventListener("click", function () {
            applyTheme("light");
        });
    }

    if (themeDarkBtn) {
        themeDarkBtn.addEventListener("click", function () {
            applyTheme("dark");
        });
    }
})();

const API_URL = "https://sluglist.onrender.com";

const loginTab = document.querySelector("#loginTab");
const signupTab = document.querySelector("#signupTab");

const loginPage = document.querySelector("#loginPage");
const signupPage = document.querySelector("#signupPage");

const goToLogin = document.querySelector("#goToLogin");
const goToSignup = document.querySelector("#goToSignup");

// Show login page

function showLogin() {

    signupPage.classList.add("hidden");
    loginPage.classList.remove("hidden");

    signupTab.classList.remove("active");
    loginTab.classList.add("active");
}


// Show signup page
function showSignup() {

    loginPage.classList.add("hidden");
    signupPage.classList.remove("hidden");

    loginTab.classList.remove("active");
    signupTab.classList.add("active");

}   

// Top tabs
loginTab.addEventListener("click", showLogin);

signupTab.addEventListener("click", showSignup);

// Bottom links
goToLogin.addEventListener("click", showLogin);

goToSignup.addEventListener("click", showSignup);

/* =========================
   sign up section
========================= */

const signupName = document.querySelector("#signupName");
const signupUsername = document.querySelector("#signupUsername");
const signupPassword = document.querySelector("#signupPassword");

const signupButton = document.querySelector("#signupButton");
const signupMessage = document.querySelector("#signupMessage");


signupButton.addEventListener("click", signup);


async function signup() {

    const name = signupName.value;
    const username = signupUsername.value;
    const password = signupPassword.value;

    const userdata = {
        name: name,
        username: username,
        password: password
    };

    try {

        const response = await fetch(`${API_URL}/signup`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(userdata)

        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {

            signupMessage.textContent = data.message;

            showLogin();

        } else {

            signupMessage.textContent = data.message;

        }

    } catch (error) {

        console.error("Signup error:", error);

        signupMessage.textContent =
            "Unable to connect to server.";

    }
}

/* =========================
   Login section
========================= */

const loginusername = document.querySelector("#loginUsername");
const loginpassword = document.querySelector("#loginPassword");

const loginbutton = document.querySelector("#loginButton");
const loginmessage = document.querySelector("#loginMessage");

loginbutton.addEventListener("click", login);

async function login() {
    
    const username = loginusername.value;
    const password = loginpassword.value;

    const logindata = {
        username: username,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/signin`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(logindata)
        });

        const data = await response.json();

        console.log(data);

        if(response.ok) {

            loginmessage.textContent = "Login successful!";
            localStorage.setItem("token", data.token);

            window.location.href = "todo.html";
        } else {

            loginmessage.textContent = data.message;
        }

    }
    catch (err) {
        console.error("LOGIN ERROR:", err);

        loginmessage.textContent = "unable to meet server";
    }
}