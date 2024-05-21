# Overview

For my task 10.4HD submission, I have decided to implement an ecommerce web platform that sells books.
I decided to have the following pages on my website:

- `/` - Home page, with a list of products available, a refined search component hidden with `Offcanvas`, and a search function
- `/product/${ID}` - A product detail page for each individual product
- `/checkout/${ID}` - A cart checkout page, listing each product added to the cart, the total cart cost, and submission + removal features

The top navbar includes category links which are dynamic based on the categories the books are tagged with on the database. Upon clicking one, the home page is reloaded with the `tags` filter in place.

In my implementation, I decided to use ExpressJS for the backend and EJS templates for SSR of the frontend.

The more advanced techniques I implemented include:

- SQLite3 for in-disk storage
- APICache for in-memory caching
- Compression to reduce the size of payloads from the server

On the frontend, I employed the following techniques:

- LocalStorage API to persist user data between sessions
- CustomEvent API and EventTarget API for an event-driven development approach
- Fetch API for XHR requests
- Bootstrap for more advanced UI components

## Possible improvements

There are many features that could be implemented on top of the work that has been done, such as:

- Authentication
- Authorization
- Cart summary on icon hover
- Specifying quantity of items to add/delete to/from cart
- Feedback component on product details page
