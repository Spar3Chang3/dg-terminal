# dg-terminal — An Immersive Delta Green Terminal

**dg-terminal** is a small browser-based fake terminal designed for use in **Delta Green** tabletop RPG campaigns.
It simulates a minimal command-line environment where players can log in as different users and uncover narrative clues through commands.

🔗 **Demo:** https://sgterm-d2826.web.app/

👤 **Username:** `demo`

🔑 **Password:** `password`

---

## Overview

dg-terminal is a lightweight interactive terminal built with plain **HTML, CSS, and JavaScript**. It allows a Game Master to present in-world information to players through a stylized command-line interface rather than traditional handouts.

Players authenticate using fictional accounts and can run commands to reveal:

* character-specific files
* emails
* embedded documents
* images
* narrative clues

All user content and commands are defined through simple JSON metadata and text/HTML files, making the system easy to extend without modifying the core script.

---

## Features

* **Fake terminal interface**

  * blinking prompt
  * command history style interaction
  * scroll-following output

* **User login system**

  * per-user content and commands
  * password "masking"

* **Extensible command system**

  * commands defined through `meta.json`
  * dynamic command loading per user

* **Content types**

  * plain text output
  * HTML embeds
  * images

* **Mobile support**

  * desktop keyboard input
  * hidden-input capture for mobile virtual keyboards

* **Narrative-friendly design**

  * ideal for presenting in-world documents during tabletop sessions

---

## Example Command Structure

User commands are defined in `meta.json`:

````json
{
  "command": "email",
  "file": "email.txt",
  "function": "TEXT"
}
````

At runtime the terminal loads these definitions and dynamically registers commands for the logged-in user.

---

## Intended Use

dg-terminal was created as a **storytelling tool for Delta Green campaigns**, allowing GMs to reveal clues through a diegetic interface rather than traditional notes or PDFs.

Examples of use:

* secret agent login terminals
* recovered government systems
* compromised research servers
* hidden archives or case files

---

## License

This project was created for tabletop use and campaign storytelling.
Feel free to adapt or modify it for your own games.
There is no direct license, it's not good enough to need one of those. All I ask is do not attempt to sell any product with code from this git

---

**“The last thing an agent should trust is a terminal that greets them by name.”** - idk bro
