# Release Notes - spark-v4.1

Release spark-v4.1 - Monaco Word Wrap, Hover-Based Execution Gutter Popups & TabBar Controls ⚡️
A developer experience upgrade! Version spark-v4.1 introduces editor wrap configurations, hover-revealed statement gutter popups, and direct query run/cancel controls on the TabBar.

✨ What's New
Word Wrap Configuration: Added word wrap controls in Monaco (Alt+Z / Option+Z) with status bar indicators showing the wrapping state.
Hover gutter context popups: Hovering or clicking statement glyphs opens inline popups for statement Run, Format, and Minify operations.
TabBar Query Actions: Placed Play (Run) and Ban (Cancel) controls directly on the editor TabBar to optimize layout height.

🔧 Technical Details
monaco.KeyMod.Alt | monaco.KeyCode.KeyZ binds word wrap toggle inside SqlEditor.
editor.onMouseDown and editor.onMouseMove handlers capture cursor positions for pixel-accurate hovering of gutter action menu elements.
