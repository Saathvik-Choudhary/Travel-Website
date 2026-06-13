# Travel Website - Biking Website

A modern, responsive website for a biking adventure company built with React and Vite.

## Features

- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Navigation**: Sticky navigation with dropdown menus and mobile hamburger menu
- **Pages**: 
  - Home/Upcoming Rides with hero section
  - Previous Rides with statistics
  - Contact page with form and company information
- **Modern UI**: Clean design with CSS variables for consistent theming
- **Performance**: Optimized with Vite for fast development and building

## Tech Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Routing**: React Router DOM 7.8.2
- **Styling**: CSS3 with CSS Variables and modern features
- **Responsive**: Mobile-first CSS with media queries

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd biking-website
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   └── Navigation.jsx          # Main navigation component
├── pages/
│   ├── UpcomingRides.jsx       # Home page with hero section
│   ├── PreviousRides.jsx       # Past rides and statistics
│   └── Contact.jsx             # Contact form and company info
├── assets/
│   └── logo.png                # Company logo
├── App.jsx                     # Main app component with routing
├── App.css                     # Main stylesheet
└── main.jsx                    # App entry point
```

## Design System

### Colors
- **Primary**: #ff6b35 (Orange)
- **Secondary**: #1a1a1a (Dark)
- **Accent**: #ffd700 (Gold)
- **Background**: #f8f9fa (Light Gray)

### Typography
- **Font Family**: System fonts with fallbacks
- **Responsive**: Uses clamp() for fluid typography
- **Hierarchy**: Clear heading structure with proper contrast

### Components
- **Cards**: Consistent ride cards with hover effects
- **Buttons**: Primary and secondary button styles
- **Forms**: Clean form inputs with focus states
- **Navigation**: Sticky navigation with mobile support

## Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: ≥ 1200px

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS Grid and Flexbox support required

## Development

### CSS Architecture
- CSS Variables for consistent theming
- Mobile-first responsive design
- BEM-like naming conventions
- Modular component styles

### Component Structure
- Functional components with hooks
- Props for data passing
- Consistent file organization
- Reusable component patterns

## Deployment

The project builds to a `dist/` folder that can be deployed to any static hosting service:

- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any web server

## Contributing

1. Follow the existing code style
2. Test on multiple devices and screen sizes
3. Ensure accessibility standards are met
4. Update documentation as needed

## License

This project is private and proprietary to Travel Website.

## Author

**Saathvik Choudhary** - Website Developer

## Contact

For questions about this project, contact the development team.

---

**Last Updated**: January 2025 - Automated deployment testing in progress.
