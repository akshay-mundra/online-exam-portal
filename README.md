# Online Examination Portal

A backend system for managing online exams, built using Node.js and PostgreSQL. It provides features for administrators to manage exams, questions, and users, and for users to take exams and view results.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)

---

## Features

- **Admin Features**:
  - User and exam management
  - Multiple-choice question creation and bulk upload
  - Configurable negative marking
  - Export exam results to CSV/Excel
- **User Features**:
  - Exam participation
  - Real-time exam results
  - Email reminders before exams
- Password reset via magic link

---

## Technologies Used

- **Node.js**: Backend development
- **Express**: Web application framework
- **PostgreSQL**: Database
- **Sequelize**: ORM for PostgreSQL

---

## Installation

Follow these steps to set up and run the project locally for development:

### Prerequisites

Ensure the following are installed on your system:

- **Node.js**: v20.18.0
- **npm**: Comes with Node.js
- **PostgreSQL**: Installed and running
- **redis**: Installed and running

### Steps

1. Clone the repository:
   ```bash
   git clone git@github.com:akshay-mundra/online-exam-portal.git
   cd online-exam-portal
   ```
2. Install dependencies

```bash
npm install
```

3. Setup environment variables as given in [env.sample](https://github.com/akshay-mundra/online-exam-portal/blob/staging/.env.sample)
4. Start server

```bash
npm run start
```
