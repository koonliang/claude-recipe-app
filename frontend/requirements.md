**MyRecipeBox Requirements Document**

---

## 1. Overview

**MyRecipeBox** is a mobile **UI** application for managing personal recipes. It interfaces with an external Web API (built in a separate technology stack) to handle authentication, data persistence, and business logic. Users can sign up, log in and perform full CRUD operations on recipes via the Web API.
It will be dark mode by default with an Orange theme.

### 1.1 Purpose of Document

- Define detailed **UI-driven** functional and non-functional requirements for MyRecipeBox.
- Serve as a single source of truth for frontend developers and designers.

### 1.2 Scope

- User authentication flows (signup, login, password reset)
- Recipe management UI (create, read, update, delete)
- Data fetching and error handling against RESTful API endpoints

## 2. User Roles & Permissions

| Role                 | Permissions                          |
| -------------------- | ------------------------------------ |
| Unauthenticated User | - Access onboarding screens          |
|                      | - Use signup and login flows         |
| Authenticated User   | - All UI features                    |
|                      | - Manage own recipes and preferences |

## 3. Functional Requirements

### 3.1 Authentication UI

1. **Login Screen**

   - Inputs: Email, password
   - Validation: Empty fields, incorrect credentials handling
   - Flow: Call `POST /auth/signin` → on success store JWT and navigate

2. **Signup Screen**

   - Inputs: Full name, email, password
   - Validation: Email format, password strength feedback
   - Flow: Call `POST /auth/signup` → on success navigate to Home

3. **Password Reset Flow**

   - "Forgot Password" link on Login
   - Input: Email → call `POST /auth/forgot-password`
   - Reset form (opened via link): Input new password → call `POST /auth/reset-password`

4. **Logout**

   - UI action triggers JWT removal and redirect to Login

### 3.2 Recipe Management UI

1. **Recipe List Screen**

   - Fetch `GET /recipes?category&search`
   - Display cards with title, thumbnail, category badge
   - Pull-to-refresh and infinite scroll

2. **Recipe Detail Screen**

   - Fetch `GET /recipes/:id`
   - Show full image, ingredients list, and steps
   - Actions: Edit, Delete, (Optional) Favorite toggle
   - Delete: Confirm dialog then call `DELETE /recipes/:id`

3. **Recipe Form Screen**

   - Used for Create (`POST /recipes`) and Update (`PUT /recipes/:id`)
   - Sections:
     - Basic Info: title, description, category, image picker
     - Ingredients: dynamic list of name, quantity, unit
     - Steps: dynamic list of step order and instruction
   - Validation: required fields, image size/type
   - Submit: Show loading, handle success/error

4. **Favorites (Optional)**

   - Favorite icon in Detail calls `POST /recipes/:id/favorite` or `DELETE /recipes/:id/favorite`
   - In List, toggle showing only favorited recipes

## 4. Data Contracts

Define the JSON shapes the UI expects from each endpoint.

```jsonc
// POST /auth/signup & /auth/signin response
{
  "token": "<JWT>",
  "user": {
    "id": "<uuid>",
    "full_name": "...",
    "email": "..."
  }
}

// Recipe object (as returned by GET /recipes and GET /recipes/:id)
{
  "id": "<uuid>",
  "title": "...",
  "description": "...",
  "category": "...",
  "photo_url": "...",
  "ingredients": [
    { "id": "<uuid>", "name": "...", "quantity": "...", "unit": "..." }
  ],
  "steps": [
    { "id": "<uuid>", "step_number": 1, "instruction_text": "..." }
  ],
  "is_favorite": boolean,
  "created_at": "<ISO timestamp>",
  "createdByUserId": "<uuid>"
}
```

## 5. API Endpoints (UI Integration)

| Method | Endpoint               | UI Action                    | Payload / Query                                        |
| ------ | ---------------------- | ---------------------------- | ------------------------------------------------------ |
| POST   | /auth/signup           | Signup submission            | `{ name, email, password }`                            |
| POST   | /auth/login            | Login submission             | `{ email, password }`                                  |
| POST   | /auth/forgot-password  | Request password reset email | `{ email }`                                            |
| POST   | /auth/reset-password   | Submit new password          | `{ token, newPassword }`                               |
| GET    | /recipes               | Load recipe list             | `?category&search`                                     |
| POST   | /recipes               | Submit new recipe            | `{ title, desc, category, photo, ingredients, steps }` |
| GET    | /recipes/\:id          | Load recipe detail           | (Auth header)                                          |
| PUT    | /recipes/\:id          | Save edited recipe           | Partial recipe payload                                 |
| DELETE | /recipes/\:id          | Delete recipe                | (Auth header)                                          |
| POST   | /recipes/\:id/favorite | Mark as favorite             | (Auth header)                                          |
| DELETE | /recipes/\:id/favorite | Unmark favorite              | (Auth header)                                          |

## 6. UI Screens & Behavior

1. **Onboarding**: Splash, Login, Signup, and Forgot Password flows
2. **Home / Recipe List**: Search bar, category filters, recipe cards, FAB to add
3. **Recipe Detail**: Image header, sections for Ingredients, Steps, action buttons
4. **Recipe Form**: Multi‑section form with validation & image picker
5. **Error States**: Network errors, validation errors, empty states, loading indicators

## 7. Non-Functional Requirements

- **Responsiveness**: Layout adapts to phones and tablets
- **Performance**: List load ≤ 200 ms, smooth scroll ≥ 60 fps
- **Offline Support**: Show cached data and queue requests when offline
- **Accessibility**: Proper labels, touch targets ≥ 44 px, high contrast
- **Theming**: Consistent look in light/dark, support system preference
- **Testing**: Unit tests for components, integration tests for screen flows (Jest, RTL)

## 8. Development & Tooling

- **Framework**: React Native (Expo Go managed workflow)
- **State Management**: React Context or Zustand
- **Networking**: Axios or Fetch with interceptors for auth
- **Forms**: react-hook-form + Yup for validation
- **Theming**: styled-components/native or Nativewind
- **Navigation**: React Navigation v6
- **Testing**: Jest & React Native Testing Library
- **CI**: GitHub Actions with lint, tests, build checks

---

*End of Requirements Document*

