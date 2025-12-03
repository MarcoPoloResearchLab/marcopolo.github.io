# LoopAware subscribe plan

- Load the hosted LoopAware subscribe widget (`subscribe.js`) so the site can post email submissions against the production service.
- Update flippable cards to host a subscribe mount (starting with LoopAware) and restyle the widget so it blends into the existing beta/alpha back face.
- Wait for the widget to render, move it into the card mount, and extend the Playwright suite to assert the mount exists.
