# Google Maps Integration Setup

This project now includes a comprehensive Google Maps integration for trip planning with the following features:

## Features Implemented

1. **Google Map with Input Fields**
   - "From" and "To" location inputs with autocomplete
   - Departure time picker (now, 15min, 30min, 1hour, custom datetime)
   - Route calculation button

2. **Google Places API Autocomplete**
   - Real-time place suggestions as you type
   - Detailed place information including coordinates
   - Smooth user experience with loading states

3. **Google Routes API Integration**
   - Multiple route options (fastest, avoids tolls, avoids highways)
   - Real-time traffic information
   - Distance, duration, and estimated cost calculations
   - Detailed turn-by-turn directions

4. **Interactive UI**
   - Route selection with visual feedback
   - Expandable route details
   - Real-time map updates based on selected route
   - Responsive design for mobile and desktop

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables

Update your `.env.local` file with your Google Maps API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

The required packages are already installed:
- `@googlemaps/js-api-loader`
- `@googlemaps/google-maps-services-js`

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000/trip-planner` to see the trip planner in action.

## File Structure

```
src/
├── components/
│   ├── GoogleMap.tsx          # Main map component
│   ├── PlaceAutocomplete.tsx  # Autocomplete input component
│   ├── DateTimePicker.tsx     # Date/time picker component
│   └── RouteOptions.tsx       # Route display and selection
├── lib/
│   └── google-maps/
│       ├── config.ts          # Google Maps configuration
│       ├── places.ts          # Places API service
│       └── routes.ts          # Routes API service
└── app/
    └── trip-planner/
        └── page.tsx           # Main trip planner page
```

## Usage

1. **Enter Locations**: Type in the "From" and "To" fields. Autocomplete will suggest places as you type.
2. **Select Departure Time**: Choose from preset options or select a custom date/time.
3. **Calculate Routes**: Click "Plan Trip" to get multiple route options.
4. **View Routes**: See route details including duration, distance, and estimated cost.
5. **Select Route**: Click on any route option to see it highlighted on the map.
6. **View Details**: Click "Show Details" to see turn-by-turn directions.

## API Costs

- **Places API**: ~$0.017 per request
- **Directions API**: ~$0.005 per request
- **Maps JavaScript API**: Free for most usage (up to 28,000 loads per month)

## Security Notes

- Always restrict your API key to specific domains
- Consider implementing rate limiting for production use
- Monitor API usage in the Google Cloud Console

## Troubleshooting

1. **Map not loading**: Check if your API key is correctly set in `.env.local`
2. **Autocomplete not working**: Ensure Places API is enabled in Google Cloud Console
3. **Routes not calculating**: Verify Directions API is enabled and has proper permissions
4. **CORS errors**: Make sure your domain is added to the API key restrictions

## Customization

You can customize the map appearance, route options, and UI components by modifying:
- `src/lib/google-maps/config.ts` for API configuration
- `src/components/GoogleMap.tsx` for map styling
- `src/components/RouteOptions.tsx` for route display options
