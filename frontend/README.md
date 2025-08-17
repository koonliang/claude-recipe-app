# MyRecipeBox

A mobile recipe management application built with React Native and Expo.

## Overview

MyRecipeBox is a dark-themed mobile UI application for managing personal recipes. It interfaces with an external Web API to handle authentication, data persistence, and business logic. Users can sign up, log in, and perform full CRUD operations on recipes.

## Features

### Authentication
- User signup and login
- Password reset functionality
- JWT token-based authentication
- Secure logout

### Recipe Management
- Browse recipes with search and category filtering
- View detailed recipe information with ingredients and steps
- Create new recipes with image upload
- Edit and update existing recipes
- Delete recipes with confirmation
- Mark recipes as favorites (optional)
- Pull-to-refresh and infinite scroll

### UI/UX
- Dark mode by default with orange theme
- Responsive design for phones and tablets
- Smooth animations and 60fps scrolling
- Accessibility compliant (WCAG guidelines)
- Loading states and error handling
- Offline support with cached data

## Tech Stack

- **Framework**: React Native with Expo managed workflow
- **State Management**: React Context or Zustand
- **Navigation**: React Navigation v6
- **Networking**: Axios/Fetch with auth interceptors
- **Forms**: react-hook-form + Yup validation
- **Styling**: styled-components/native or NativeWind
- **Testing**: Jest & React Native Testing Library
- **CI/CD**: GitHub Actions

## Performance Requirements

- List load time: ≤ 200ms
- Smooth scrolling: ≥ 60fps
- Touch targets: ≥ 44px
- High contrast support

## Development

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Installation
```bash
npm install
```

### Running the App
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Testing
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

## Project Structure

```
src/
├── components/         # Reusable UI components
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── services/         # API services and networking
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
├── constants/        # App constants and configuration
└── assets/           # Images, fonts, and other assets
```

## API Integration

The app integrates with a RESTful API for:
- User authentication (`/auth/*`)
- Recipe CRUD operations (`/recipes/*`)
- Favorite management (`/recipes/:id/favorite`)

See the requirements document for detailed API contracts and endpoints.

## Contributing

1. Follow the established coding standards
2. Write tests for new features
3. Ensure accessibility compliance
4. Update documentation as needed

## License

[License information]
