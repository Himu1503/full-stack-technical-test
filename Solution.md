# PulseEvents - Modern Events Management Platform

Project Live Link: https://full-stack-technical-test-3dib.vercel.app/

<div align="center">

![PulseEvents Logo](./public/favicon.svg)

**A modern, full-stack events management platform built with React, TypeScript, and TailwindCSS**

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.12-646cff.svg)](https://vitejs.dev/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Content Management](#content-management)
- [Analytics & Audit Logs](#analytics--audit-logs)
- [API Integration](#api-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

PulseEvents is a comprehensive events management platform that enables users to discover, explore, and register for events seamlessly. Built with modern web technologies, it provides an intuitive user experience with powerful admin features for analytics and content management.

### Key Highlights

- **Modern UI/UX**: Beautiful, responsive design with mobile-first approach
- **Performance Optimized**: Efficient data fetching, caching, and debounced search
- **Content Management**: Non-technical staff can manage categories and marketing content
- **Analytics Dashboard**: Comprehensive insights with category-based analytics
- **Audit Logging**: Complete tracking of user interactions and registrations
- **Email Integration**: Automated confirmation emails via EmailJS

## ✨ Features

### Core Features

#### 🏠 Landing Page
- Information about the product

#### 📅 Event Discovery
- **Event Listing**: Browse all available events with search and filtering
- **Advanced Search**: Debounced search with real-time results
- **Category Filtering**: Filter events by category (Technology, Business, Design, etc.)
- **Type Filtering**: Filter by event type (Online/In-Person)
- **Smart Sorting**: Events sorted by category, type, and title
- **Visual Grouping**: Events grouped by category and type for better organization

#### 📄 Event Details
- Comprehensive event information display
- Interactive maps for physical event locations (using Leaflet)
- Real-time seat availability tracking
- Registration directly from detail page
- Price display with free event indicators

#### ✅ Event Registration
- Streamlined registration modal
- Form validation with Zod and React Hook Form
- Required field validation
- Email confirmation via EmailJS
- Success/error toast notifications
- Registration tracking in audit logs

### Admin Features

#### 📊 Analytics Dashboard
- **Category-Based Analytics**: View performance metrics organized by category
- **Interactive Charts**: Bar charts, doughnut charts using Chart.js
- **Category Statistics**: 
  - Views per category
  - Registrations per category
  - Event counts per category
  - Top events in each category
- **Comparison Charts**: Side-by-side views vs registrations
- **Popular Events**: Track most viewed and registered events
- **Search Analytics**: Top search terms analysis

#### 📝 Audit Logs
- **Registration Tracking**: Detailed logs of all event registrations
- **User Activity Tracking**: Views, searches, filters, clicks
- **Search & Filter**: Advanced filtering by action type and search terms
- **Export Options**: 
  - Export all logs as JSON
  - Export all logs as CSV
  - Export registrations only as CSV
- **Statistics Dashboard**: Quick stats on registrations, views, and events

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **TypeScript 5.9.3** - Type safety
- **Vite 7.1.12** - Build tool and dev server
- **React Router DOM 7.9.5** - Client-side routing
- **TanStack Query 5.90.6** - Server state management
- **TailwindCSS 3.4.18** - Utility-first CSS
- **Shadcn UI** - Component library
- **Radix UI** - Accessible component primitives

### UI Components
- **React Hook Form 7.66.0** - Form management
- **Zod 4.1.12** - Schema validation
- **Lucide React** - Icon library
- **React Leaflet 5.0.0** - Interactive maps
- **Chart.js + React-ChartJS-2** - Data visualization

### Email & Integration
- **EmailJS 4.4.1** - Email sending service
- **use-debounce 10.0.6** - Search debouncing

### Testing
- **Jest 30.2.0** - Testing framework
- **React Testing Library 16.3.0** - Component testing
- **TS-Jest 29.4.5** - TypeScript support for Jest

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes


## 📁 Project Structure

```
full-stack-technical-test/
├── public/
│   ├── content/              # Content management files
│   │   ├── categories.json   # Category configurations
│   │   └── marketing.json    # Marketing banners & content
│   └── favicon.svg          # Site favicon
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   ├── EventCard.tsx   # Event display card
│   │   ├── EventMap.tsx     # Interactive map component
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Site footer
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── EventsPage.tsx  # Events listing page
│   │   ├── EventDetailPage.tsx # Event detail page
│   │   ├── AnalyticsPage.tsx   # Analytics dashboard
│   │   ├── AuditLogsPage.tsx  # Audit logs page
│   │   └── AdminPage.tsx      # Admin layout
│   ├── hooks/              # Custom React hooks
│   │   ├── useEvents.ts    # Events data fetching
│   │   ├── useEventRegistration.ts # Registration logic
│   │   └── ...
│   ├── lib/                # Utility libraries
│   │   ├── api/            # API client
│   │   │   └── events.ts   # Events API functions
│   │   ├── api.ts          # Base API client
│   │   ├── analytics.ts    # Analytics & audit logging
│   │   ├── content.ts      # Content management
│   │   ├── emailjs.ts      # EmailJS integration
│   │   └── constants.ts    # Environment constants
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Application entry point
├── .env                    # Environment variables (gitignored)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # TailwindCSS configuration
├── vite.config.ts         # Vite configuration
└── vercel.json            # Vercel deployment config
```


### Managing Categories

Edit `public/content/categories.json`:

```json
[
  {
    "id": "technology",
    "name": "Technology",
    "description": "Cutting-edge tech events",
    "icon": "💻",
    "color": "#3B82F6",
    "backgroundColor": "rgba(59, 130, 246, 0.1)",
    "textColor": "#3B82F6"
  }
]
```

### Managing Marketing Content

Edit `public/content/marketing.json`:

```json
{
  "banners": [
    {
      "id": "hero-banner",
      "title": "Discover Amazing Events",
      "subtitle": "Connect, Learn, and Grow",
      "ctaText": "Explore Events",
      "ctaLink": "/events",
      "backgroundColor": "linear-gradient(...)",
      "textColor": "#FFFFFF",
      "enabled": true,
      "priority": 1
    }
  ],
  "promotionalContent": {
    "headline": "Why Choose PulseEvents?",
    "features": [...]
  }
}
```

Changes take effect immediately after saving (refresh browser to see updates).

## 📊 Analytics & Audit Logs

### Analytics Dashboard

Access via `/admin/analytics`:

- **Category Performance**: Views and registrations by category
- **Interactive Charts**: Bar charts, doughnut charts
- **Event Popularity**: Most viewed and registered events
- **Search Analytics**: Top search terms
- **Time Range**: Last 30 days of data

### Audit Logs

Access via `/admin/audit-logs`:

- **Registration Tracking**: Complete registration history
- **Activity Logs**: All user interactions (views, searches, clicks)
- **Search & Filter**: Find specific logs quickly
- **Export Options**: JSON and CSV export formats
- **Statistics**: Quick stats on registrations and events

### Data Storage

- Analytics data stored in browser localStorage
- Maximum 1000 log entries (older logs auto-removed)
- Data persists across sessions
- Export functionality for data backup

## 🔌 API Integration

### API Client

The application includes a robust API client with:

- **Error Handling**: Custom error classes with detailed messages
- **Request Cancellation**: AbortSignal support for canceling requests
- **Type Safety**: Full TypeScript support
- **Response Validation**: JSON response validation
- **Retry Logic**: Automatic retry on failure

### Data Transformation

Events are transformed from API format to application format:

```typescript
interface ApiEvent {
  category?: { name: string; id: string };
  capacity?: { max: number; registered: number };
  pricing?: { individual: number };
  location?: { type: 'online' | 'physical'; address?: string };
}
```

## 🧪 Testing

### Test Setup

- **Jest** for unit testing
- **React Testing Library** for component testing
- **Test Utilities** with React Query and Router providers


## 🎨 Design Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface
- Optimized for all screen sizes

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Semantic HTML structure
- Screen reader friendly

### Performance
- Code splitting with React.lazy
- Debounced search (500ms)
- React Query caching (2-5 minutes)
- Optimized images and assets
- Lazy loading for maps

## 📈 Features in Detail

### Search & Filtering

- **Debounced Search**: Reduces API calls while typing
- **Category Filtering**: Filter by dynamic categories
- **Type Filtering**: Online vs In-Person events
- **Combined Filters**: Multiple filters work together
- **Real-time Updates**: Instant results as filters change

### Event Registration Flow

1. User clicks "Register" on event card or detail page
2. Registration modal opens
3. User fills form (name, email, phone optional)
4. Form validation with real-time feedback
5. POST request to API
6. Success: Email confirmation sent via EmailJS
7. Toast notification with registration details
8. Event capacity updated in real-time

### Email Integration

- **EmailJS Service**: Automated email sending
- **Template Variables**: Dynamic content in emails
- **Confirmation Emails**: Sent after successful registration
- **Error Handling**: Graceful fallback if email fails
- **Rich Content**: Event details, price, date in email

### Map Integration

- **Leaflet Maps**: Interactive maps for physical events
- **Geocoding**: Automatic address to coordinates conversion
- **Google Maps Link**: Direct link to Google Maps
- **Marker Popups**: Event information on map
- **Responsive**: Works on mobile and desktop

## 🔒 Security

- **Environment Variables**: Sensitive data never in code
- **API Key Protection**: Keys stored securely
- **Input Validation**: Zod schemas for all forms
- **Error Handling**: No sensitive data in error messages
- **HTTPS**: Recommended for production