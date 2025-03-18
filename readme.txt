# Color Palette Generator

A vanilla JavaScript web application for creating harmonious color palettes, similar to Adobe Color. This lightweight, mobile-friendly app uses web components and stores palettes locally using IndexedDB (via Dexie.js).

## Features

- **Color Harmony Generation**: Create palettes using multiple harmony types:
  - Analogous (colors adjacent on the color wheel)
  - Monochromatic (variations of the same color)
  - Complementary (colors opposite on the color wheel)
  - Triadic (three colors equally spaced on the color wheel)
  - Square (four colors equally spaced on the color wheel)
  - Shades (variations of lightness)

- **Flexible Color Count**: Adjust the number of colors in your palette (3-10 colors)
- **Custom Naming**: Give meaningful names to your saved palettes
- **Save & Manage Palettes**: Store palettes locally in your browser
- **Export Options**: Export palettes as JSON, CSS, SCSS, or Tailwind config
- **Mobile Friendly**: Responsive design works on all devices
- **Offline Support**: Works offline as a Progressive Web App (PWA)
- **No Dependencies**: Uses vanilla JavaScript, HTML and CSS only (with Dexie.js for storage)

## Project Structure

```
color-palette-app/
├── index.html                  # Main HTML file
├── css/
│   ├── styles.css              # Global styles
│   ├── palette-generator.css   # Styles for generator component
│   └── saved-palettes.css      # Styles for saved palettes component
├── js/
│   ├── app.js                  # Main application logic
│   ├── components/
│   │   ├── palette-generator.js  # Palette generator web component
│   │   └── saved-palettes.js     # Saved palettes web component
│   ├── utils/
│   │   ├── color-converter.js    # Color conversion utilities
│   │   └── harmony-generator.js  # Color harmony logic
│   └── services/
│       └── storage-service.js    # Dexie.js database service
├── lib/
│   └── dexie.min.js             # Dexie.js library
├── service-worker.js            # Service worker for offline support
└── manifest.json                # Web app manifest for PWA support
```

## Implementation Details

This app uses several modern web technologies:

1. **Web Components**: Custom elements for encapsulating functionality
2. **IndexedDB**: For client-side storage (via Dexie.js)
3. **Service Worker**: For offline support and PWA capabilities
4. **CSS Custom Properties**: For theming and consistent styling
5. **Responsive Design**: Mobile-first approach for all screen sizes

## How to Use

1. **Pick a Base Color**: Use the color picker or enter a hex code
2. **Choose a Harmony Type**: Select from the dropdown menu
3. **Adjust Color Count**: Use the + and - buttons to set how many colors you want (3-10)
4. **Name Your Palette**: Give your palette a descriptive name
5. **Generate Palette**: Click "Generate" to create a new palette
6. **Save Palette**: Click "Save" to store the palette locally
7. **Manage Palettes**: View, load, export, or delete saved palettes
8. **Export**: Export individual colors by clicking on them, or full palettes using the export buttons

## Installation

Simply clone the repository and open `index.html` in a web browser. No build steps or server required!

```bash
git clone https://github.com/username/color-palette-generator.git
cd color-palette-generator
# Open index.html in your browser
```

Alternatively, you can use a simple local server:

```bash
# Using Python
python -m http.server

# Using Node.js and npx
npx serve
```

## Browser Support

This app supports all modern browsers that implement the following features:
- Custom Elements
- IndexedDB
- Service Workers
- CSS Custom Properties
- ES6+ JavaScript

## License

MIT License
