const terminal = document.getElementById("terminal");
const mobileInput = document.getElementById("mobile-input");

const USER_JSON = "/users/meta.json";
const DISCLAIMER_TXT = "/LICENSES/THIRD_PARTY_LICENSES.txt";
const APACHE_LICENSE = "/LICENSES/apache-2.0.txt";

const users = new Map();

let currentInput = "";
let loginStage = "username";
let authed = false;
let inputLine = null;
let user = {
  username: "",
  commands: [],
  // More types can be added here
};

let disclaimer = "";
let apacheLicense = "";

function resetUserState() {
  user = {
    username: "",
    commands: [],
    // More types can be added here
  };
}

function syncFromRealInput() {
  currentInput = mobileInput.value;
  renderInputRow(true);
}

async function fetchLegal() {
  try {
    const [disclaimerRes, apacheRes] = await Promise.all([
      fetch(DISCLAIMER_TXT),
      fetch(APACHE_LICENSE),
    ]);

    disclaimer = await disclaimerRes.text();
    apacheLicense = await apacheRes.text();
  } catch (err) {
    console.error(
      "Could not fetch license files. Check LICENSES directory:",
      err,
    );
  }
}

async function fetchMeta() {
  await fetch(USER_JSON)
    .then((res) => {
      return res.json();
    })
    .then((userList) => {
      for (const user of userList) {
        users.set(user.username, user);
      }
    })
    .catch((err) =>
      printLine(
        "Could not get user list. Try refreshing the console",
        "warning",
      ),
    );
}

async function fetchUser() {
  let userProps = users.get(user.username)?.properties;
  for (const prop of userProps) {
    if (prop?.function === "IMG") {
      user[prop?.command] = {
        callback: () => printPicture(`/users/${user.username}/${prop.file}`),
      };
      user.commands.push(prop?.command);
    } else {
      await fetch(`/users/${user.username}/${prop.file}`)
        .then((res) => res.text())
        .then((text) => {
          user[prop?.command] = {
            callback:
              prop?.function === "HTML"
                ? () => printHTML(text)
                : () => printLine(text),
          };
          user.commands.push(prop?.command);
        })
        .catch((err) => console.log(err));
    }
  }
}

function isMaskedInput() {
  return !authed && loginStage === "password";
}

function getVisibleInput() {
  return isMaskedInput() ? "*".repeat(currentInput.length) : currentInput;
}

function scrollToBottom() {
  terminal.scrollTop = terminal.scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
}

function printLine(text = "", className = "") {
  const line = document.createElement("div");
  line.className = `line ${className}`.trim();
  line.textContent = text;
  terminal.appendChild(line);
  scrollToBottom();
}

function printPicture(path = "", className = "") {
  const pictureWrapper = document.createElement("div");
  pictureWrapper.className = `pic ${className}`.trim();
  const picture = document.createElement("img");
  picture.src = path;
  picture.alt = "N/A";
  pictureWrapper.appendChild(picture);
  terminal.appendChild(pictureWrapper);
  scrollToBottom();
  picture.addEventListener("load", () => {
    scrollToBottom();
  });
}

function printHTML(html = "", className = "") {
  const htmlWrapper = document.createElement("div");
  htmlWrapper.className = `embed ${className}`;
  htmlWrapper.innerHTML = html;
  terminal.appendChild(htmlWrapper);
  scrollToBottom();
}

function removeInputRow() {
  const existing = document.getElementById("input-row");
  if (existing) {
    existing.remove();
  }
  inputLine = null;
}

function renderInputRow(isAppend = true) {
  if (inputLine && !isAppend) {
    removeInputRow();
  }

  if (inputLine && isAppend) {
    inputLine.textContent = getVisibleInput();
    scrollToBottom();
    return;
  }

  const row = document.createElement("div");
  row.className = "line input-row";
  row.id = "input-row";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = "> ";

  inputLine = document.createElement("span");
  inputLine.id = "live-input";
  inputLine.textContent = getVisibleInput();

  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");

  row.append(prompt, inputLine, cursor);
  terminal.appendChild(row);
  scrollToBottom();
}

function commitInputLine() {
  removeInputRow();
  printLine(`> ${getVisibleInput()}`);
}

function resetToLogin(message = "") {
  resetUserState();
  authed = false;
  loginStage = "username";

  if (message) {
    printLine(message);
  }

  printLine("Login required.", "muted");
  printLine("Enter Username Below:");
  renderInputRow(false);
}

function commandHook(line) {
  const normalized = line.trim().toLowerCase();

  switch (normalized) {
    case "help":
      printLine(
        `Available commands: help, clear, whoami, logout, ${user.commands.join(", ")}, disclaimer, apache`,
      );
      break;

    case "whoami":
      printPicture(`/users/${user.username}/pfp.jpg`);
      printLine(`Logged in as ${user.username}`);
      break;

    case "clear":
      terminal.innerHTML = "";
      inputLine = null;
      printLine("Shitass Shell v0.6.2", "muted");
      printLine(`Welcome, ${user.username}. Type 'help' to begin.`, "success");
      break;

    case "logout":
      resetToLogin("Logged out.");
      return;

    case "disclaimer":
      printLine(disclaimer);
      break;

    case "apache":
      printLine(apacheLicense);
      break;

    case "":
      break;

    default:
      if (user.commands.includes(normalized)) {
        user[normalized].callback();
      } else {
        printLine("Invalid command.", "error");
      }
      break;
  }
}

async function handleLoginSubmission() {
  if (loginStage === "username") {
    const username = currentInput;
    commitInputLine();
    currentInput = "";

    if (!users.has(username)) {
      printLine("Invalid username.", "error");
      printLine("Enter Username Below:");
      renderInputRow(false);
      return;
    } else {
      user.username = username;
    }

    loginStage = "password";
    printLine("Enter Password Below:");
    renderInputRow(false);
    return;
  }

  if (loginStage === "password") {
    const pass = currentInput;
    commitInputLine();
    currentInput = "";

    if (pass !== users.get(user.username).password) {
      loginStage = "username";
      printLine("Invalid password", "error");
      printLine("Enter Username Below:");
      renderInputRow(false);
      return;
    }

    authed = true;
    loginStage = "done";
    await fetchUser();
    printLine("Login successful.", "success");
    printLine("Type 'help' to view commands.", "muted");
    renderInputRow(false);
  }
}

function handleCommandSubmission() {
  const submitted = currentInput;
  commitInputLine();
  currentInput = "";
  commandHook(submitted);
  renderInputRow(false);
}

function handleKeydown(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();

    if (!authed) {
      handleLoginSubmission();
    } else {
      handleCommandSubmission();
    }

    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    currentInput = currentInput.slice(0, -1);
    renderInputRow(true);
    return;
  }

  if (event.key.length === 1) {
    event.preventDefault();
    currentInput += event.key;
    renderInputRow(true);
  }
}

async function boot() {
  printLine("Shitass Shell v0.6.2", "muted");
  printLine("Loading licenses and users, please wait...", "warning");
  await fetchLegal();
  await fetchMeta();
  printLine("Login required.", "warning");
  printLine("Enter Username Below:");
  renderInputRow(false);
  terminal.focus();
}

terminal.addEventListener("click", () => terminal.focus());
if (!window.matchMedia("(max-width: 768px)").matches) {
  document.addEventListener("keydown", handleKeydown);
} else {
  terminal.addEventListener("click", () => {
    mobileInput.focus();
  });
  mobileInput.addEventListener("input", syncFromRealInput);
  mobileInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      currentInput = mobileInput.value;
      mobileInput.value = "";

      if (!authed) {
        handleLoginSubmission();
      } else {
        handleCommandSubmission();
      }

      renderInputRow(false);
    }
  });
}
window.addEventListener("resize", scrollToBottom);

boot();
