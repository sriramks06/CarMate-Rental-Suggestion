# CarMate – Car Rental and Buying Suggestion System (Complete Project)

This repository contains the complete source code for CarMate, a full-stack web application for car rentals and sales recommendations.

## 🚀 Features

* **User Portal**: Browse, filter, and view cars for rent or sale.
* **Recommendation Engine**: Get personalized car buying suggestions based on budget and usage.
* **Rental System**: Users can submit rental requests for specific dates.
* **Reviews & Ratings**: Users can submit reviews for cars.
* **Admin Panel**:
    * Add, Edit, and Delete car listings.
    * View and manage all user rental requests (Approve/Decline).

## 🗂️ Project Structure

This project uses a classic client-server architecture. For it to work correctly, your files **must** be arranged in this structure:



## 🛠️ How to Run This Project

Follow these steps exactly to get the application running on your computer.

**Prerequisites:** You must have **[Node.js](https://nodejs.org/)** installed on your system. This will also install `npm`.

**Step 1: Create the Folder Structure**
On your computer, create a main project folder and name it `CarMate-Project`. Inside that folder, create a sub-folder named `public`.

**Step 2: Save All the Project Files**
Place each of the files provided (`index.html`, `style.css`, `app.js`, `server.js`, `package.json`, `db.json`) into their correct locations as shown in the structure diagram above.
* `index.html`, `style.css`, and `app.js` go inside the `public` folder.
* `server.js`, `package.json`, `README.md` and `db.json` go inside the main `CarMate-Project` folder.

**Step 3: Open a Terminal**
Open your command prompt or terminal (like Terminal on Mac, or Command Prompt/PowerShell on Windows). Navigate into the main `CarMate-Project` folder using the `cd` command. For example:
```bash

cd path/to/your/CarMate-Project

And enter
node server.js
