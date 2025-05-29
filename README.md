# Brad Cooley - Personal Portfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive personal portfolio website built with HTML5, CSS3, and vanilla JavaScript.

## Features

- **Responsive Design**: Works on all device sizes
- **Modern UI**: Glassmorphism design with smooth animations
- **Performance Optimized**: Fast loading and efficient code
- **Accessible**: Built with web accessibility in mind

## Project Structure

```
src/
├── components/         # Reusable HTML components
│   ├── sections/       # Section components
│   ├── header.html     # Header component
│   └── navigation.html # Navigation component
├── js/
│   ├── modules/       # JavaScript modules
│   └── main.js         # Main JavaScript file
├── styles/
│   └── modules/      # CSS modules
└── index.html          # Main HTML file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brad-cooley/brad-cooley.github.io.git
   cd brad-cooley.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start a local development server:

```bash
npm run dev
```

This will start a local server at `http://localhost:3000` with live reload.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploying

To deploy to GitHub Pages:

1. Build the project:
   ```bash
   npm run build
   ```

2. Commit and push the `dist` directory to the `gh-pages` branch:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```

## Technologies Used

- HTML5
- CSS3 (with CSS Variables and Custom Properties)
- JavaScript (ES6+)
- PostCSS (for CSS processing)
- npm (for package management)

## Browser Support

The website is tested and works on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- [PostCSS](https://postcss.org/) for CSS processing
