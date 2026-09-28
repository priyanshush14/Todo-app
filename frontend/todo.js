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

console.log("Todo page loaded");

const API_URL = "https://sluglist.onrender.com";

let todos = [];

// authentication  verification & get todo
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

const todoList = document.querySelector("#todoList");

async function gettodo() {
    try {
        const response = await fetch(`${API_URL}/retrive_todo`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                token: token
            }
        });

        const data = await response.json();

        if (response.ok) {
            todos = data.todos;
            renderTodos(todos);
        } else {
            console.log(data.message);
        }

    } catch (err) {
        console.error("fetching error:", err);
    }
}

function renderTodos(todos) {

    const todoCount = document.getElementById("todoCount");
    if (todoCount) {
        todoCount.textContent = todos ? todos.length : 0;
    }

    todoList.innerHTML = "";

    todos.forEach(todo => {

        const todoItem = document.createElement("div");
        todoItem.className = "todo-item";

        const todoTitle = document.createElement("span");
        todoTitle.className = "todo-title";
        todoTitle.textContent = todo.title;

        if (todo.done) {
            todoItem.classList.add("completed");
            todoTitle.classList.add("completed");
        }

        const todoActions = document.createElement("div");
        todoActions.className = "todo-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "todo-btn todo-btn-edit";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => updatetodo(todo, todoItem, todoTitle, editButton, deleteButton));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "todo-btn todo-btn-delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => { deleteTodo(todo);});

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "todo-checkbox";
        checkbox.checked = !!todo.done;

        checkbox.addEventListener("change", () => toggleTodoStatus(todo, checkbox, todoItem, todoTitle));

        todoItem.appendChild(todoTitle);
        todoActions.appendChild(editButton);
        todoActions.appendChild(deleteButton);
        todoItem.appendChild(todoActions);
        todoItem.appendChild(checkbox);

        todoList.appendChild(todoItem);
    });
}

// create todo.
const todoInput = document.querySelector("#todoInput");
const addTodoButton = document.querySelector("#addTodoButton");

addTodoButton.addEventListener("click", createtodo);

async function createtodo() {
    const title = todoInput.value;

    const tododata = {
        title: title
    }

    try {
        const response = await fetch(`${API_URL}/create_todo`, {
            method: "POST",

            headers: {
                "content-type": "application/json",
                token: token
            },

            body: JSON.stringify(tododata)
        });

        const data = await response.json();

        console.log(data);

        if(response.ok) {
            todos.push(data.todo);
            renderTodos(todos);
        } else {
            console.log(data.message);
        }

    }
    catch (err) {
        console.log("creation error:", err);
    }
}

gettodo();
getProfile();

// Sign Out / Logout
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

// Fetch authenticated user profile
async function getProfile() {
    try {
        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                token: token
            }
        });

        const data = await response.json();

        if (response.ok) {
            const profileName = document.getElementById("profileName");
            const profileAvatar = document.getElementById("profileAvatar");
            const profileUsername = document.getElementById("profileUsername");

            if (profileName) {
                profileName.textContent = data.name || "";
            }

            if (profileAvatar) {
                const match = (data.name || "").match(/[a-zA-Z]/);
                profileAvatar.textContent = match ? match[0].toUpperCase() : "";
            }

            if (profileUsername && data.username) {
                profileUsername.textContent = `@${data.username}`;
            }
        } else {
            console.log(data.message);
        }
    } catch (err) {
        console.error("Profile fetch error:", err);
    }
}

// toggle completion status
async function toggleTodoStatus(todo, checkbox, todoItem, todoTitle) {
    const isChecked = checkbox.checked;

    try {
        const response = await fetch(`${API_URL}/update_todo_status/${todo._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                token: token
            },
            body: JSON.stringify({
                done: isChecked
            })
        });

        const data = await response.json();

        if (response.ok) {
            todo.done = isChecked;
            const target = todos.find(t => t._id === todo._id);
            if (target) {
                target.done = isChecked;
            }
            if (isChecked) {
                todoItem.classList.add("completed");
                todoTitle.classList.add("completed");
            } else {
                todoItem.classList.remove("completed");
                todoTitle.classList.remove("completed");
            }
        } else {
            console.error("Status update error:", data.message);
            checkbox.checked = !isChecked;
            alert(data.message || "Failed to update todo status.");
        }
    } catch (err) {
        console.error("Status update error:", err);
        checkbox.checked = !isChecked;
        alert("Unable to connect to server.");
    }
}

// delete functionality
async function deleteTodo(todo) {
    try {
    const response = await fetch(`${API_URL}/delete_todo/${todo._id}`, {
        method: "DELETE",

        headers: {
            "Content-Type": "application/json",
            token: token
        }
    });

    const data = await response.json();

    console.log(data);

    if (response.ok) {
        todos = todos.filter(t => t._id !== todo._id);
        renderTodos(todos);
    } else {
        console.log(data.message);
    }

} catch (err) {
    console.log("deletion error:", err);
}
}

// update todos
function updatetodo(todo, todoItem, todoTitle, editButton, deleteButton) {
    if (todoItem.querySelector(".todo-edit-input")) {
        return;
    }

    const todoActions = todoItem.querySelector(".todo-actions");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-edit-input";
    input.value = todo.title;

    todoItem.replaceChild(input, todoTitle);

    todoActions.innerHTML = "";

    const doneButton = document.createElement("button");
    doneButton.type = "button";
    doneButton.className = "todo-btn todo-btn-done";
    doneButton.textContent = "Done";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "todo-btn todo-btn-cancel";
    cancelButton.textContent = "Cancel";

    todoActions.appendChild(doneButton);
    todoActions.appendChild(cancelButton);

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    function cancelEdit() {
        todoItem.replaceChild(todoTitle, input);
        todoActions.innerHTML = "";
        todoActions.appendChild(editButton);
        todoActions.appendChild(deleteButton);
    }

    async function saveEdit() {
        const newtitle = input.value.trim();

        if (!newtitle) {
            alert("Todo title cannot be empty.");
            input.focus();
            return;
        }

        if (newtitle.length < 2) {
            alert("Todo title must be between 2 and 300 characters.");
            input.focus();
            return;
        }

        if (newtitle.length > 300) {
            alert("Todo title must be between 2 and 300 characters.");
            input.focus();
            return;
        }

        try {
            doneButton.disabled = true;
            cancelButton.disabled = true;

            const response = await fetch(`${API_URL}/update_todo/${todo._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    token: token
                },
                body: JSON.stringify({
                    newtitle: newtitle
                })
            });

            const data = await response.json();

            if (response.ok) {
                todo.title = newtitle;
                const target = todos.find(t => t._id === todo._id);
                if (target) {
                    target.title = newtitle;
                }
                renderTodos(todos);
            } else {
                alert(data.message || "Failed to update todo.");
                doneButton.disabled = false;
                cancelButton.disabled = false;
                input.focus();
            }
        } catch (err) {
            console.error("Update error:", err);
            alert("Unable to connect to server.");
            doneButton.disabled = false;
            cancelButton.disabled = false;
        }
    }

    doneButton.addEventListener("click", saveEdit);
    cancelButton.addEventListener("click", cancelEdit);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveEdit();
        } else if (e.key === "Escape") {
            cancelEdit();
        }
    });
}