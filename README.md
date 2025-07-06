# CactuSocial | Full-Stack Social Media Application

CactuSocial is a full-stack social media web application built with Python and the Django web framework. Inspired by platforms like Twitter, it allows users to register, create profiles, share text-based posts, and interact with each other through a system of followers, likes, and nested comments.

The application is architected as a server-rendered Django project, enhanced with a dynamic frontend powered by vanilla JavaScript. This hybrid approach provides fast initial page loads while enabling a seamless, single-page application (SPA) feel for user interactions like creating posts, editing content in-line, and engaging with others, all without requiring a full page refresh.

## Features

* **User Authentication:** Secure user registration, login, and logout functionality.
* **User Profiles:** Every user has a public profile page displaying their bio, posts, and follower/following counts.
* **Profile Customization:** Users can edit their bio and upload a custom profile picture.
* **Create & Edit Posts:** Authenticated users can create new posts. Post authors can edit their own posts in-place without a page reload.
* **"All Posts" Feed:** A global feed showing all posts from all users, with server-side pagination.
* **"Following" Feed:** A personalized feed showing posts only from users you follow.
* **Follow System:** Users can follow and unfollow others to customize their content feed.
* **Likes, Comments, and Replies:** Users can like posts and comments, and engage in threaded conversations by replying to comments. All interactions are handled asynchronously.

---

## Technology Stack

* **Backend:** Python, Django
* **Database:** PostgreSQL
* **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
* **Styling:** Bootstrap 4 & Custom CSS (About 5:95 ratio respectively)
* **Image Processing:** Pillow
* **Development Tools**: Git, pip, venv

---

## Key Accomplishments & Technical Skills

- **Backend Architecture (Django)**:

    - Developed a robust backend using Django, leveraging its Model-View-Template (MVT) architecture to create a well-structured and maintainable codebase.

    - Utilized a fragmented template for generating posts coupled with a `post_paginator()` function in order to generate the appropriate posts in a given context.

    - Utilized the **Django ORM** to design and manage the application's database schema, modeling complex relationships for users, profiles, posts, comments, replies, followers, and likes (e.g., `OneToOne`, `ForeignKey`, `ManyToManyField`).

    - Built a **RESTful API** with distinct endpoints to handle all asynchronous actions. These endpoints, secured with decorators like `@login_required`, `@require_POST`, and `@require_http_methods()`, serve JSON responses, allowing the frontend to dynamically update content.

- **Dynamic Frontend (Vanilla JavaScript)**:

    - Engineered a highly interactive user experience using **vanilla JavaScript** and the **Fetch API**. All social interactions (following users, liking posts/comments, posting comments/replies) are handled asynchronously.

    - Implemented an **in-line post editing** feature, where JavaScript dynamically replaces post content with a form, allowing users to edit and save their posts without navigating to a new page.

    - The frontend efficiently manipulates the DOM to reflect real-time changes, such as updating like counts, adding new comments to the page, and toggling the state of follow buttons.

- **User & Profile Management**:

    - Implemented a complete user authentication system (register, login, logout) using Django's built-in `auth` module.

    - Created a `Profile` model linked to each user, allowing for customizable bios and profile picture uploads.

    - Image processing is handled on the backend using the **Pillow** library; uploaded images are automatically resized and optimized to ensure fast load times and consistent dimensions.

- **Noteworthy Features**:

    - **"Following" Feed**: A dedicated page that displays a chronological feed of posts only from users that the current user follows.

    - **AJAX-powered Interactions**: All core social features—likes, comments, replies, and follows—are powered by asynchronous JavaScript calls, providing instant feedback to the user.

    - **Nested Comments**: Users can reply directly to comments, creating threaded conversations.

    - **Pagination**: Implemented efficient server-side pagination for all post feeds using Django's `Paginator` class to ensure the application remains performant as the number of posts grows.

Color scheme inspired by Brittany Chang's Halcyon theme