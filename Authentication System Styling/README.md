# Bootstrap 5 Authentication System

A fully responsive authentication system built with HTML5, Bootstrap 5, and custom CSS.
The project includes five pages: Login, Registration, Forgot Password, Reset Password,
and a Dashboard. It is designed with a clean and modern UI, smooth animations, and
works perfectly on all screen sizes.

---

## Live Pages

| Page | File |
|------|------|
| Login | index.html |
| Register | register.html |
| Forgot Password | forgot-password.html |
| Reset Password | reset-password.html |
| Dashboard | dashboard.html |

---

## Features

### General
- Built with Bootstrap 5.3.3
- Bootstrap Icons integrated across all pages
- Google Fonts used — Poppins and Inter
- Fully responsive on Desktop, Laptop, Tablet, and Mobile
- Custom CSS file with consistent styling across all pages
- Animated gradient background on all auth pages
- Smooth hover effects on buttons, links, and cards
- Box shadows on all cards with hover lift effect
- Custom color scheme using CSS variables

### Login Page
- Centered card layout on screen
- Email and password input fields with styled labels
- Password visibility toggle button
- Remember me checkbox
- Forgot password navigation link
- Sign in button with hover and active effects
- Error alert shown for invalid input
- Redirects to dashboard on successful login
- Link to registration page

### Registration Page
- Card layout with max width for readability
- First name and last name fields side by side
- Email address input with validation
- Optional phone number field
- Password field with visibility toggle
- Live password strength meter with color indicator
- Confirm password field with real-time match check
- Terms and conditions checkbox required before submit
- Create Account button with loading state animation
- Button turns green and shows success message after submit
- Auto redirects to login page after 2 seconds
- User data saved to localStorage for demo purposes
- Back to Sign In link below the form

### Forgot Password Page
- Clean card layout
- Email input field with validation
- Submit button with hover effects
- Success message shown after form submission
- Link to go back to login page

### Reset Password Page
- Card layout matching the rest of the app
- New password input with visibility toggle
- Confirm new password input with visibility toggle
- Password match validation
- Update Password button
- Redirects to login after successful reset

### Dashboard Page
- Full Bootstrap navbar with brand logo and icon
- Navigation links in the navbar
- Logout button in the navbar with red hover effect
- Welcome banner with gradient background
- Stat cards showing numbers and icons
- Activity feed section with recent actions
- Fully responsive layout using Bootstrap grid
- Clean and professional dashboard UI

---

## Tech Stack

- HTML5
- Bootstrap 5.3.3
- Bootstrap Icons 1.11.3
- CSS3 with custom properties
- Vanilla JavaScript
- Google Fonts

---

## How to Run

1. Download or clone the repository
2. Open the project folder
3. Open index.html in any modern browser
4. No installation or server required

---

## Demo Login

You do not need to create an account to test the login page.
Any valid email format and a password with at least 6 characters will work.

Example:
- Email: user@example.com
- Password: 123456

To test the full registration flow, go to register.html, fill in the form,
and click Create Account. You will be redirected to the login page automatically.

---

## Folder Structure

