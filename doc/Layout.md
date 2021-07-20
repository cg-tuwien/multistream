# Layouts
The slides consist of the several containers:

* title_container (next to the logo)
* bottom_container (line on the bottom)
* sidebar_container (on the right side)
* content (main content, depending on slide)

There's a default layout for each scene, set as class in the html file to the body tag ('layout-*layout*`, e.g. 'layout-fullscreen'). The body tag also has a 'data-scene' attribute which declares the scene (and therefore the prefix to use for the templates).

You can override the template for the current scene by setting '*prefix*Layout' either to the program entry or the session. The following layouts are available:
<pre>
layout-full:
 _____________________
|              |      |     # Default layout with smaller content area and additional sidebar 
| Content      | Side |     # Additional logo and title can be displayed above content
|              | Bar  |
|______________|______|
| Bottom Tall         |
|_____________________|

layout-full-content:
 _____________________
|                     |     # Same as layout-full, but without the sidebar
| Content             |
|                     |
|_____________________|
| Bottom Tall         |
|_____________________| 

layout-narrow-border:
 _____________________
|                   |L|     # 95% content, only a small logo on the side and a narrow bottom title
|                   |O|     # Additional logo and title can be displayed above content
| Content           |G|
|                   |O|
|___________________|_|
|_Bottom Narrow_______|

layout-fullscreen:
 _____________________
|                     |     # Displays content over full screen area
|                     |
| Content             |
|                     |
|                     |
|_____________________| 
</pre>  
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

For each session the layout for prologue, break and epilogue can be set in the data.json file.
Additionally, the layout can also be changed on a per-slide level in slideshows such as in the Prologue scene, where the signation is displayed in the 'Fullscreen' layout while the other slides use the 'Full' layout.

   