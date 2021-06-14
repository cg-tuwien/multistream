The slides consist of the several containers:

* title_container (next to the logo)
* bottom_container (line on the bottom)
* sidebar_container (on the right side)
* content (main content, depending on slide)

There's a default layout for each scene, set as class in the html file to the body tag ('layout-*layout*`, e.g. 'layout-fullscreen'). The body tag also has a 'data-scene' attribute which declares the scene (and therefore the prefix to use for the templates).

You can override the template for the current scene by setting '*prefix*Layout' either to the program entry or the session. The following layouts are available: 'fullscreen' (only main content visible), 'bottom-title' (only main content and bottom bar), 'full' (with logo, bottom-title and sidebar), 'narrow-border' (narrow borders on the bottom and to the right, 95% content).

If you don't want a template to be rendered in the block, use 'none'.

In template.html, you can set a template for the main content: `templateContentTemplate`.

The default templates are defined in `src/layoutTemplates.json`.

```json
{
  "session": {
    "videoLayout": "fullscreen",
    "program": [
      {
        "videoLayout": "full"
      }
    ]
  }
}
```
