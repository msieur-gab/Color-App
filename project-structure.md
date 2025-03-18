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
└── lib/
    └── dexie.min.js             # Dexie.js library
