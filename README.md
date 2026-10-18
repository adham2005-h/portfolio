# Adham Hashem — Personal Portfolio

A responsive portfolio presenting my Java and Python projects, supporting web, SQL and networking work, and practical AutoCAD 2D drafting experience.

[Visit my portfolio](https://adham2005-h.github.io/portfolio/)

## Design

I built the site with HTML, CSS and JavaScript. The design pairs a dark background with soft green accents, a compact portrait and a grid of project cards.

GSAP and ScrollTrigger bring whole cards and panels into view from the left, right and bottom, with staggered timing. Scrolling back above a panel prepares its entrance for the next downward pass. Titles, project illustrations and SVG connections have their own supporting animations. The navigation follows the current section, and a progress bar shows your position on the page. On supported devices, the portrait and project cards respond to the pointer.

The layout adapts to phones and tablets. Motion follows the device’s reduced-motion preference, and the content and links remain available without JavaScript. Manrope is loaded from Google Fonts, with a system-font fallback.

## Animation library

[GSAP and ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) 3.15.0 are bundled in `vendor/gsap`, with the original notices and licensing links. The site does not need a runtime CDN connection for its animations.

## Projects

Each project links to its GitHub repository. The SQL and networking sections also include supporting documentation.

## Run locally

Open `index.html` in a browser, keeping the stylesheets, scripts, `images` and `vendor` folders alongside it. No build step or package installation is needed.

## Author

[Adham Muayad Hashem](https://github.com/adham2005-h)
