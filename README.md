# markopolo.github.io

Landing page for Marko Polo Research Lab.

The home page features an animated hero section, an about overview and a gallery of our public apps.

This repository hosts the static website built with HTML, CSS and JavaScript. [Three.js](https://threejs.org/) is used to draw and animate the lab's logo and project icons.

You can open `index.html` directly in your browser or serve the site through GitHub Pages.

## Structure

- `index.html` – main page with hero section, about information and a gallery of apps
- `script.js` – initializes Three.js and animates the SVG assets
- `assets/` – fonts and SVG illustrations

## Adding a New App

Each entry in the project gallery consists of an SVG logo, a `<canvas>` element and a call to `initProjectAnimation()` in `script.js`. To add a new app:

1. create a new SVG logo in the `assets/` folder
2. add a project card in `index.html` following existing examples
3. reference the SVG from `script.js`

Vectorizing images or text to SVG can be done using the tools available in the [svg_tools](https://github.com/temirov/svg_tools) repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
