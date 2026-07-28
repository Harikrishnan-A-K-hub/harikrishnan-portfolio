# Harikrishnan A K — Portfolio

Personal portfolio for Harikrishnan A K, web designer and developer.

Built by hand in HTML, CSS and JavaScript with no build step and no framework. The site
presents a selection of live projects as an editorial index. Design and front end build
are my own.

## Structure

- `index.html` — the single page and all content
- `css/styles.css` — the editorial design system, light and dark themes
- `js/main.js` — theme toggle, scroll reveal and the work previews

## Run locally

Serve the folder with any static server, for example:

```
npx http-server . -p 8188 -c-1
```

Then open http://localhost:8188.

## Notes

Work previews load live screenshots from thum.io on demand, with a hand built fallback so
the layout is never left blank. Motion is disabled under a reduced motion preference.
