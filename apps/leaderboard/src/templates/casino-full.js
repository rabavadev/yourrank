// Full-page, structurally distinct composers for the attached design pack.
// Each composer returns its own header/hero/list/footer markup; no shared skeleton.

const ARCADE_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-2 {
  left: -0.5rem;
}

.-right-3 {
  right: -0.75rem;
}

.-top-2 {
  top: -0.5rem;
}

.-top-3 {
  top: -0.75rem;
}

.z-0 {
  z-index: 0;
}

.z-10 {
  z-index: 10;
}

.z-50 {
  z-index: 50;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-16 {
  margin-top: 4rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.inline-block {
  display: inline-block;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.h-6 {
  height: 1.5rem;
}

.h-8 {
  height: 2rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-10 {
  width: 2.5rem;
}

.w-12 {
  width: 3rem;
}

.w-16 {
  width: 4rem;
}

.w-4 {
  width: 1rem;
}

.w-8 {
  width: 2rem;
}

.w-\\[30\\%\\] {
  width: 30%;
}

.w-\\[38\\%\\] {
  width: 38%;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.flex-wrap {
  flex-wrap: wrap;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-\\[4px\\] {
  border-width: 4px;
}

.border-x-\\[4px\\] {
  border-left-width: 4px;
  border-right-width: 4px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-b-4 {
  border-bottom-width: 4px;
}

.border-b-\\[4px\\] {
  border-bottom-width: 4px;
}

.border-l-\\[6px\\] {
  border-left-width: 6px;
}

.border-r-2 {
  border-right-width: 2px;
}

.border-t-2 {
  border-top-width: 2px;
}

.border-t-8 {
  border-top-width: 8px;
}

.border-\\[\\#000000\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity, 1));
}

.border-\\[\\#003366\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 51 102 / var(--tw-border-opacity, 1));
}

.border-\\[\\#004400\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 68 0 / var(--tw-border-opacity, 1));
}

.border-\\[\\#00BFFF\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 191 255 / var(--tw-border-opacity, 1));
}

.border-\\[\\#00BFFF\\]\\/50 {
  border-color: rgb(0 191 255 / 0.5);
}

.border-\\[\\#39FF14\\] {
  --tw-border-opacity: 1;
  border-color: rgb(57 255 20 / var(--tw-border-opacity, 1));
}

.border-\\[\\#4D004D\\] {
  --tw-border-opacity: 1;
  border-color: rgb(77 0 77 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FF00FF\\] {
  --tw-border-opacity: 1;
  border-color: rgb(255 0 255 / var(--tw-border-opacity, 1));
}

.border-white\\/20 {
  border-color: rgb(255 255 255 / 0.2);
}

.border-b-\\[\\#39FF14\\]\\/30 {
  border-bottom-color: rgb(57 255 20 / 0.3);
}

.bg-\\[\\#000000\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#0D0D1A\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(13 13 26 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#1A1A2E\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(26 26 46 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#39FF14\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(57 255 20 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF00FF\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 0 255 / var(--tw-bg-opacity, 1));
}

.bg-black {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
}

.bg-transparent {
  background-color: transparent;
}

.bg-\\[linear-gradient\\(rgba\\(255\\2c 255\\2c 255\\2c 0\\.1\\)_1px\\2c transparent_1px\\)\\2c linear-gradient\\(90deg\\2c rgba\\(255\\2c 255\\2c 255\\2c 0\\.1\\)_1px\\2c transparent_1px\\)\\] {
  background-image: linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px);
}

.bg-\\[repeating-linear-gradient\\(0deg\\2c rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\2c rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)_2px\\2c transparent_2px\\2c transparent_4px\\)\\] {
  background-image: repeating-linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.8) 2px,transparent 2px,transparent 4px);
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-\\[\\#005580\\] {
  --tw-gradient-from: #005580 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 85 128 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#006600\\] {
  --tw-gradient-from: #006600 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 102 0 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#00BFFF\\] {
  --tw-gradient-from: #00BFFF var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 191 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#39FF14\\] {
  --tw-gradient-from: #39FF14 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(57 255 20 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#800080\\] {
  --tw-gradient-from: #800080 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(128 0 128 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF00FF\\] {
  --tw-gradient-from: #FF00FF var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 0 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#001133\\] {
  --tw-gradient-to: #001133 var(--tw-gradient-to-position);
}

.to-\\[\\#002200\\] {
  --tw-gradient-to: #002200 var(--tw-gradient-to-position);
}

.to-\\[\\#005580\\] {
  --tw-gradient-to: #005580 var(--tw-gradient-to-position);
}

.to-\\[\\#006600\\] {
  --tw-gradient-to: #006600 var(--tw-gradient-to-position);
}

.to-\\[\\#330033\\] {
  --tw-gradient-to: #330033 var(--tw-gradient-to-position);
}

.to-\\[\\#800080\\] {
  --tw-gradient-to: #800080 var(--tw-gradient-to-position);
}

.bg-\\[size\\:20px_20px\\] {
  background-size: 20px 20px;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.text-center {
  text-align: center;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-\\[12px\\] {
  font-size: 12px;
}

.text-\\[7px\\] {
  font-size: 7px;
}

.text-\\[8px\\] {
  font-size: 8px;
}

.text-\\[9px\\] {
  font-size: 9px;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#00BFFF\\] {
  --tw-text-opacity: 1;
  color: rgb(0 191 255 / var(--tw-text-opacity, 1));
}

.text-\\[\\#39FF14\\] {
  --tw-text-opacity: 1;
  color: rgb(57 255 20 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FF00FF\\] {
  --tw-text-opacity: 1;
  color: rgb(255 0 255 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFD700\\] {
  --tw-text-opacity: 1;
  color: rgb(255 215 0 / var(--tw-text-opacity, 1));
}

.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-white\\/70 {
  color: rgb(255 255 255 / 0.7);
}

.text-white\\/90 {
  color: rgb(255 255 255 / 0.9);
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-30 {
  opacity: 0.3;
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-90 {
  opacity: 0.9;
}

.opacity-\\[0\\.05\\] {
  opacity: 0.05;
}

.shadow-\\[0_0_10px_\\#FF00FF\\] {
  --tw-shadow: 0 0 10px #FF00FF;
  --tw-shadow-colored: 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_10px_rgba\\(57\\2c 255\\2c 20\\2c 0\\.6\\)\\] {
  --tw-shadow: 0 0 10px rgba(57,255,20,0.6);
  --tw-shadow-colored: 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(0\\2c 191\\2c 255\\2c 0\\.5\\)\\2c inset_0_0_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 0 15px rgba(0,191,255,0.5),inset 0 0 10px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color), inset 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(57\\2c 255\\2c 20\\2c 0\\.5\\)\\2c inset_0_0_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 0 15px rgba(57,255,20,0.5),inset 0 0 10px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color), inset 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_rgba\\(57\\2c 255\\2c 20\\2c 0\\.2\\)\\] {
  --tw-shadow: 0 0 20px rgba(57,255,20,0.2);
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_25px_rgba\\(255\\2c 0\\2c 255\\2c 0\\.6\\)\\2c inset_0_0_15px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 0 25px rgba(255,0,255,0.6),inset 0 0 15px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 0 25px var(--tw-shadow-color), inset 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_0_\\#000000\\] {
  --tw-shadow: 0 10px 0 #000000;
  --tw-shadow-colored: 0 10px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[4px_4px_0_\\#000000\\] {
  --tw-shadow: 4px 4px 0 #000000;
  --tw-shadow-colored: 4px 4px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_0_10px_rgba\\(0\\2c 191\\2c 255\\2c 0\\.3\\)\\] {
  --tw-shadow: inset 0 0 10px rgba(0,191,255,0.3);
  --tw-shadow-colored: inset 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur-\\[40px\\] {
  --tw-blur: blur(40px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_rgba\\(57\\2c 255\\2c 20\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px rgba(57,255,20,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_5px_\\#00BFFF\\] {
  --tw-drop-shadow: drop-shadow(0 0 5px #00BFFF);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_5px_\\#39FF14\\] {
  --tw-drop-shadow: drop-shadow(0 0 5px #39FF14);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_5px_\\#FFD700\\] {
  --tw-drop-shadow: drop-shadow(0 0 5px #FFD700);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_\\#FF00FF\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px #FF00FF);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_rgba\\(255\\2c 0\\2c 255\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px rgba(255,0,255,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_rgba\\(57\\2c 255\\2c 20\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px rgba(57,255,20,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-duration\\:2s\\] {
  animation-duration: 2s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[font-family\\:\\'Press_Start_2P\\'\\2c _system-ui\\] {
  font-family: 'Press Start 2P', system-ui;
}

.\\[line-height\\:1\\.5\\] {
  line-height: 1.5;
}

.\\[line-height\\:1\\.8\\] {
  line-height: 1.8;
}

.selection\\:bg-\\[\\#FF00FF\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 0 255 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#FF00FF\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 0 255 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#FF00FF\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 0 255 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#FF00FF\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 0 255 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:-translate-y-1:hover {
  --tw-translate-y: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:-translate-y-2:hover {
  --tw-translate-y: -0.5rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:border-white\\/50:hover {
  border-color: rgb(255 255 255 / 0.5);
}

.hover\\:text-white:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:shadow-\\[6px_6px_0_\\#000000\\]:hover {
  --tw-shadow: 6px 6px 0 #000000;
  --tw-shadow-colored: 6px 6px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-16 {
    margin-top: 4rem;
  }

  .md\\:h-10 {
    height: 2.5rem;
  }

  .md\\:h-14 {
    height: 3.5rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-8 {
    height: 2rem;
  }

  .md\\:w-10 {
    width: 2.5rem;
  }

  .md\\:w-14 {
    width: 3.5rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-6 {
    width: 1.5rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-\\[10px\\] {
    font-size: 10px;
  }

  .md\\:text-\\[11px\\] {
    font-size: 11px;
  }

  .md\\:text-\\[12px\\] {
    font-size: 12px;
  }

  .md\\:text-\\[9px\\] {
    font-size: 9px;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .md\\:text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}
`;
export function composeArcade(_p) { return `<div class="min-h-screen bg-[#0D0D1A] text-white overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#FF00FF] selection:text-white relative"><div class="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.8)_2px,transparent_2px,transparent_4px)]"></div><div class="fixed inset-0 pointer-events-none z-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div><div class="w-full relative bg-[#0D0D1A] border-t-8 border-[#39FF14] border-b-4 border-b-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.2)]"><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center justify-center flex-wrap gap-2 md:gap-4 mb-4"><span class="text-3xl md:text-5xl animate-bounce">👾</span><h1 class="text-2xl md:text-4xl text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] flex items-center [font-family:'Press_Start_2P',_system-ui] [line-height:1.5]">HIGH SCORES<span class="animate-ping inline-block w-4 h-6 md:w-6 md:h-8 bg-[#39FF14] ml-2"></span></h1><span class="text-3xl md:text-5xl animate-bounce [animation-delay:0.2s]">🕹️</span></div><p class="text-[#FF00FF] text-[10px] md:text-xs tracking-widest mt-2 mb-8 drop-shadow-[0_0_8px_rgba(255,0,255,0.8)] animate-pulse [font-family:'Press_Start_2P',_system-ui]">INSERT COIN TO PLAY</p><div class="flex flex-wrap justify-center gap-3 p-2 border-2 border-[#00BFFF]/50 bg-[#000000] shadow-[inset_0_0_10px_rgba(0,191,255,0.3)]"><button class="px-4 py-2 text-[8px] md:text-[10px] transition-all border-2 bg-transparent text-white/70 border-white/20 hover:text-white hover:border-white/50 [font-family:'Press_Start_2P',_system-ui]">HOURLY</button><button class="px-4 py-2 text-[8px] md:text-[10px] transition-all border-2 bg-[#39FF14] text-black border-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.6)] [font-family:'Press_Start_2P',_system-ui]">TODAY</button><button class="px-4 py-2 text-[8px] md:text-[10px] transition-all border-2 bg-transparent text-white/70 border-white/20 hover:text-white hover:border-white/50 [font-family:'Press_Start_2P',_system-ui]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-12 md:mt-16 flex flex-col items-center relative z-10"><div data-top3=""></div><div data-rows=""></div><div class="mt-16 mb-8 text-center"><p class="text-[#39FF14] text-[10px] md:text-[12px] animate-pulse drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] [font-family:'Press_Start_2P',_system-ui] [line-height:1.8]">🎮 GAME ON · KEEP PLAYING 🎮</p></div></div></div>`; }
const CANDY_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-3 {
  left: -0.75rem;
}

.-left-6 {
  left: -1.5rem;
}

.-right-4 {
  right: -1rem;
}

.-right-6 {
  right: -1.5rem;
}

.-right-8 {
  right: -2rem;
}

.-top-10 {
  top: -2.5rem;
}

.-top-14 {
  top: -3.5rem;
}

.-top-2 {
  top: -0.5rem;
}

.-top-4 {
  top: -1rem;
}

.-top-8 {
  top: -2rem;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.z-\\[-1\\] {
  z-index: -1;
}

.z-\\[0\\] {
  z-index: 0;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.-mt-6 {
  margin-top: -1.5rem;
}

.-mt-8 {
  margin-top: -2rem;
}

.mb-10 {
  margin-bottom: 2.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-16 {
  margin-top: 4rem;
}

.mt-20 {
  margin-top: 5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-10 {
  width: 2.5rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-20 {
  width: 5rem;
}

.w-\\[30\\%\\] {
  width: 30%;
}

.w-\\[38\\%\\] {
  width: 38%;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-1 {
  --tw-translate-y: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.-translate-y-6 {
  --tw-translate-y: -1.5rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-\\[1\\.5rem\\] {
  border-radius: 1.5rem;
}

.rounded-\\[2\\.5rem\\] {
  border-radius: 2.5rem;
}

.rounded-\\[2rem\\] {
  border-radius: 2rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-b-\\[2\\.5rem\\] {
  border-bottom-right-radius: 2.5rem;
  border-bottom-left-radius: 2.5rem;
}

.rounded-b-\\[2rem\\] {
  border-bottom-right-radius: 2rem;
  border-bottom-left-radius: 2rem;
}

.border-4 {
  border-width: 4px;
}

.border-\\[5px\\] {
  border-width: 5px;
}

.border-x-4 {
  border-left-width: 4px;
  border-right-width: 4px;
}

.border-x-\\[5px\\] {
  border-left-width: 5px;
  border-right-width: 5px;
}

.border-y-4 {
  border-top-width: 4px;
  border-bottom-width: 4px;
}

.border-b-4 {
  border-bottom-width: 4px;
}

.border-b-\\[5px\\] {
  border-bottom-width: 5px;
}

.border-b-\\[6px\\] {
  border-bottom-width: 6px;
}

.border-l-\\[12px\\] {
  border-left-width: 12px;
}

.border-r-4 {
  border-right-width: 4px;
}

.border-\\[\\#00E676\\]\\/30 {
  border-color: rgb(0 230 118 / 0.3);
}

.border-\\[\\#FF1493\\] {
  --tw-border-opacity: 1;
  border-color: rgb(255 20 147 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FF1493\\]\\/30 {
  border-color: rgb(255 20 147 / 0.3);
}

.border-\\[\\#FFE500\\]\\/50 {
  border-color: rgb(255 229 0 / 0.5);
}

.border-white {
  --tw-border-opacity: 1;
  border-color: rgb(255 255 255 / var(--tw-border-opacity, 1));
}

.border-white\\/50 {
  border-color: rgb(255 255 255 / 0.5);
}

.border-y-transparent {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.border-r-transparent {
  border-right-color: transparent;
}

.bg-\\[\\#00994D\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 153 77 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#00E676\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 230 118 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#00E676\\]\\/20 {
  background-color: rgb(0 230 118 / 0.2);
}

.bg-\\[\\#AD1457\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(173 20 87 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF1493\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 20 147 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF85B3\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 133 179 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF9100\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 145 0 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FFE500\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 229 0 / var(--tw-bg-opacity, 1));
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-white\\/30 {
  background-color: rgb(255 255 255 / 0.3);
}

.bg-white\\/80 {
  background-color: rgb(255 255 255 / 0.8);
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-\\[\\#00E676\\] {
  --tw-gradient-from: #00E676 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 230 118 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF1493\\] {
  --tw-gradient-from: #FF1493 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 20 147 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF85B3\\] {
  --tw-gradient-from: #FF85B3 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 133 179 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FFE500\\] {
  --tw-gradient-from: #FFE500 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 229 0 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#00B25A\\] {
  --tw-gradient-to: #00B25A var(--tw-gradient-to-position);
}

.to-\\[\\#C084FC\\] {
  --tw-gradient-to: #C084FC var(--tw-gradient-to-position);
}

.to-\\[\\#D81B60\\] {
  --tw-gradient-to: #D81B60 var(--tw-gradient-to-position);
}

.to-\\[\\#FFC400\\] {
  --tw-gradient-to: #FFC400 var(--tw-gradient-to-position);
}

.p-1 {
  padding: 0.25rem;
}

.p-2\\.5 {
  padding: 0.625rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.p-5 {
  padding: 1.25rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-2\\.5 {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.pt-6 {
  padding-top: 1.5rem;
}

.pt-8 {
  padding-top: 2rem;
}

.text-center {
  text-align: center;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-6xl {
  font-size: 3.75rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.text-\\[\\#00E676\\] {
  --tw-text-opacity: 1;
  color: rgb(0 230 118 / var(--tw-text-opacity, 1));
}

.text-\\[\\#D81B60\\] {
  --tw-text-opacity: 1;
  color: rgb(216 27 96 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FF1493\\] {
  --tw-text-opacity: 1;
  color: rgb(255 20 147 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFC400\\] {
  --tw-text-opacity: 1;
  color: rgb(255 196 0 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFE500\\] {
  --tw-text-opacity: 1;
  color: rgb(255 229 0 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.opacity-100 {
  opacity: 1;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow-\\[0_10px_30px_rgba\\(255\\2c 20\\2c 147\\2c 0\\.3\\)\\] {
  --tw-shadow: 0 10px 30px rgba(255,20,147,0.3);
  --tw-shadow-colored: 0 10px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_15px_30px_rgba\\(0\\2c 230\\2c 118\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 15px 30px rgba(0,230,118,0.4);
  --tw-shadow-colored: 0 15px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_15px_30px_rgba\\(255\\2c 20\\2c 147\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 15px 30px rgba(255,20,147,0.4);
  --tw-shadow-colored: 0 15px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_20px_40px_rgba\\(255\\2c 229\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 20px 40px rgba(255,229,0,0.5);
  --tw-shadow-colored: 0 20px 40px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_6px_0_\\#00B25A\\] {
  --tw-shadow: 0 6px 0 #00B25A;
  --tw-shadow-colored: 0 6px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_6px_0_\\#C51162\\] {
  --tw-shadow: 0 6px 0 #C51162;
  --tw-shadow-colored: 0 6px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_6px_0_rgba\\(255\\2c 133\\2c 179\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 6px 0 rgba(255,133,179,0.4);
  --tw-shadow-colored: 0 6px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_2px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.1\\)\\] {
  --tw-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  --tw-shadow-colored: inset 0 2px 4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.1\\)\\] {
  --tw-shadow: inset 0 4px 10px rgba(0,0,0,0.1);
  --tw-shadow-colored: inset 0 4px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_8px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.1\\)\\] {
  --tw-shadow: inset 0 4px 8px rgba(0,0,0,0.1);
  --tw-shadow-colored: inset 0 4px 8px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_5px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.1\\)\\] {
  --tw-shadow: inset 0 5px 10px rgba(0,0,0,0.1);
  --tw-shadow-colored: inset 0 5px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-xl {
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur-\\[50px\\] {
  --tw-blur: blur(50px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_2px_rgba\\(216\\2c 27\\2c 96\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 2px rgba(216,27,96,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_3px_0_\\#FF9100\\] {
  --tw-drop-shadow: drop-shadow(0 3px 0 #FF9100);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_4px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.2\\)\\] {
  --tw-drop-shadow: drop-shadow(0 4px 4px rgba(0,0,0,0.2));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-lg {
  --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-md {
  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-sm {
  --tw-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-duration\\:2\\.2s\\] {
  animation-duration: 2.2s;
}

.\\[animation-duration\\:2\\.5s\\] {
  animation-duration: 2.5s;
}

.\\[animation-duration\\:2s\\] {
  animation-duration: 2s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4s\\] {
  animation-duration: 4s;
}

.\\[background-image\\:repeating-linear-gradient\\(45deg\\2c _transparent\\2c _transparent_15px\\2c _rgba\\(255\\2c 255\\2c 255\\2c 0\\.15\\)_15px\\2c _rgba\\(255\\2c 255\\2c 255\\2c 0\\.15\\)_30px\\)\\] {
  background-image: repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.15) 15px, rgba(255,255,255,0.15) 30px);
}

.\\[font-family\\:\\'Fredoka_One\\'\\2c _cursive\\] {
  font-family: 'Fredoka One', cursive;
}

.\\[text-shadow\\:0_2px_0_\\#00994D\\] {
  text-shadow: 0 2px 0 #00994D;
}

.\\[text-shadow\\:0_2px_0_\\#AD1457\\] {
  text-shadow: 0 2px 0 #AD1457;
}

.\\[text-shadow\\:0_4px_0_\\#C084FC\\] {
  text-shadow: 0 4px 0 #C084FC;
}

.\\[text-shadow\\:0_6px_0_\\#D81B60\\2c _0_10px_15px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.3\\)\\] {
  text-shadow: 0 6px 0 #D81B60, 0 10px 15px rgba(0,0,0,0.3);
}

.selection\\:bg-\\[\\#FF1493\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 20 147 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#FF1493\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 20 147 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#FF1493\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 20 147 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#FF1493\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(255 20 147 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:-translate-y-0\\.5:hover {
  --tw-translate-y: -0.125rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:-translate-y-1:hover {
  --tw-translate-y: -0.25rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:border-y-white:hover {
  --tw-border-opacity: 1;
  border-top-color: rgb(255 255 255 / var(--tw-border-opacity, 1));
  border-bottom-color: rgb(255 255 255 / var(--tw-border-opacity, 1));
}

.hover\\:border-r-white:hover {
  --tw-border-opacity: 1;
  border-right-color: rgb(255 255 255 / var(--tw-border-opacity, 1));
}

.hover\\:shadow-\\[0_8px_0_\\#00B25A\\]:hover {
  --tw-shadow: 0 8px 0 #00B25A;
  --tw-shadow-colored: 0 8px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.hover\\:shadow-\\[0_8px_0_rgba\\(255\\2c 133\\2c 179\\2c 0\\.5\\)\\]:hover {
  --tw-shadow: 0 8px 0 rgba(255,133,179,0.5);
  --tw-shadow-colored: 0 8px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 768px) {
  .md\\:ml-6 {
    margin-left: 1.5rem;
  }

  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-24 {
    margin-top: 6rem;
  }

  .md\\:h-14 {
    height: 3.5rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-28 {
    height: 7rem;
  }

  .md\\:w-14 {
    width: 3.5rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-28 {
    width: 7rem;
  }

  .md\\:-translate-y-10 {
    --tw-translate-y: -2.5rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-5 {
    padding: 1.25rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }

  .md\\:text-8xl {
    font-size: 6rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
`;
export function composeCandy(_p) { return `<div class="min-h-screen bg-gradient-to-b from-[#FF85B3] to-[#C084FC] text-white font-sans overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#FF1493] selection:text-white"><div class="w-full relative bg-[#FF1493] shadow-[0_10px_30px_rgba(255,20,147,0.3)] border-b-[6px] border-white z-20"><div class="absolute inset-0 opacity-100 pointer-events-none [background-image:repeating-linear-gradient(45deg,_transparent,_transparent_15px,_rgba(255,255,255,0.15)_15px,_rgba(255,255,255,0.15)_30px)]"></div><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-6xl animate-bounce [animation-duration:2s]">🍭</span><h1 class="text-5xl md:text-7xl tracking-wide text-[#FFE500] [font-family:'Fredoka_One',_cursive] [text-shadow:0_6px_0_#D81B60,_0_10px_15px_rgba(0,0,0,0.3)]">SWEET JACKPOT</h1><span class="text-4xl md:text-6xl animate-bounce [animation-duration:2s] [animation-delay:0.2s]">🍭</span></div><p class="text-white text-xl md:text-2xl font-bold tracking-wider mt-4 mb-10 drop-shadow-[0_2px_2px_rgba(216,27,96,0.8)] [font-family:'Fredoka_One',_cursive]">🍬 The sweetest winners on the floor! 🍬</p><div class="flex gap-3 bg-white/30 p-2.5 rounded-full border-4 border-white/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)] backdrop-blur-md"><button class="px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all border-4 bg-[#00E676] text-white shadow-[0_6px_0_#00B25A] border-white hover:-translate-y-0.5 hover:shadow-[0_8px_0_#00B25A] [font-family:'Fredoka_One',_cursive]">HOURLY</button><button class="px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all border-4 bg-[#FF1493] text-white shadow-[0_6px_0_#C51162] border-white scale-105 -translate-y-1 [font-family:'Fredoka_One',_cursive]">TODAY</button><button class="px-6 py-2.5 rounded-full font-bold text-sm md:text-base transition-all border-4 bg-[#00E676] text-white shadow-[0_6px_0_#00B25A] border-white hover:-translate-y-0.5 hover:shadow-[0_8px_0_#00B25A] [font-family:'Fredoka_One',_cursive]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-16 md:mt-24 flex flex-col items-center"><div data-top3=""></div><div data-rows=""></div><div class="mt-20 mb-10 text-center flex flex-col items-center gap-4"><div class="text-5xl animate-bounce [animation-duration:2s]">🧁</div><p class="text-white text-2xl md:text-4xl tracking-wide drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] [font-family:'Fredoka_One',_cursive] [text-shadow:0_4px_0_#C084FC]">🍰 Keep Playing, Sweet Winner! 🍰</p></div></div></div>`; }
const FUN_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-2 {
  left: -0.5rem;
}

.-right-3 {
  right: -0.75rem;
}

.-top-2 {
  top: -0.5rem;
}

.-top-3 {
  top: -0.75rem;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-1\\/3 {
  width: 33.333333%;
}

.w-10 {
  width: 2.5rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-20 {
  width: 5rem;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-b-lg {
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.rounded-b-xl {
  border-bottom-right-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}

.rounded-t-2xl {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.border-2 {
  border-width: 2px;
}

.border-4 {
  border-width: 4px;
}

.border-x-4 {
  border-left-width: 4px;
  border-right-width: 4px;
}

.border-b-4 {
  border-bottom-width: 4px;
}

.border-b-\\[6px\\] {
  border-bottom-width: 6px;
}

.border-\\[\\#9A3412\\] {
  --tw-border-opacity: 1;
  border-color: rgb(154 52 18 / var(--tw-border-opacity, 1));
}

.border-\\[\\#9D174D\\] {
  --tw-border-opacity: 1;
  border-color: rgb(157 23 77 / var(--tw-border-opacity, 1));
}

.border-\\[\\#B45309\\] {
  --tw-border-opacity: 1;
  border-color: rgb(180 83 9 / var(--tw-border-opacity, 1));
}

.border-\\[\\#D97706\\] {
  --tw-border-opacity: 1;
  border-color: rgb(217 119 6 / var(--tw-border-opacity, 1));
}

.border-\\[\\#F472B6\\] {
  --tw-border-opacity: 1;
  border-color: rgb(244 114 182 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FBBF24\\] {
  --tw-border-opacity: 1;
  border-color: rgb(251 191 36 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FBBF24\\]\\/30 {
  border-color: rgb(251 191 36 / 0.3);
}

.border-\\[\\#FDBA74\\] {
  --tw-border-opacity: 1;
  border-color: rgb(253 186 116 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FEF08A\\] {
  --tw-border-opacity: 1;
  border-color: rgb(254 240 138 / var(--tw-border-opacity, 1));
}

.border-black\\/20 {
  border-color: rgb(0 0 0 / 0.2);
}

.border-white\\/20 {
  border-color: rgb(255 255 255 / 0.2);
}

.border-white\\/40 {
  border-color: rgb(255 255 255 / 0.4);
}

.bg-\\[\\#4C1D95\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(76 29 149 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#581C87\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(88 28 135 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#6B21A8\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(107 33 168 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FBBF24\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(251 191 36 / var(--tw-bg-opacity, 1));
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-\\[repeating-linear-gradient\\(45deg\\2c \\#000\\2c \\#000_15px\\2c transparent_15px\\2c transparent_30px\\)\\] {
  background-image: repeating-linear-gradient(45deg,#000,#000 15px,transparent 15px,transparent 30px);
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-\\[\\#BE185D\\] {
  --tw-gradient-from: #BE185D var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(190 24 93 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#C2410C\\] {
  --tw-gradient-from: #C2410C var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(194 65 12 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#D97706\\] {
  --tw-gradient-from: #D97706 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(217 119 6 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#EC4899\\] {
  --tw-gradient-from: #EC4899 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(236 72 153 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#F97316\\] {
  --tw-gradient-from: #F97316 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(249 115 22 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FBBF24\\] {
  --tw-gradient-from: #FBBF24 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(251 191 36 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#7C2D12\\] {
  --tw-gradient-to: #7C2D12 var(--tw-gradient-to-position);
}

.to-\\[\\#831843\\] {
  --tw-gradient-to: #831843 var(--tw-gradient-to-position);
}

.to-\\[\\#92400E\\] {
  --tw-gradient-to: #92400E var(--tw-gradient-to-position);
}

.to-\\[\\#BE185D\\] {
  --tw-gradient-to: #BE185D var(--tw-gradient-to-position);
}

.to-\\[\\#EA580C\\] {
  --tw-gradient-to: #EA580C var(--tw-gradient-to-position);
}

.to-\\[\\#F59E0B\\] {
  --tw-gradient-to: #F59E0B var(--tw-gradient-to-position);
}

.p-1\\.5 {
  padding: 0.375rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.text-center {
  text-align: center;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.text-\\[\\#BE185D\\] {
  --tw-text-opacity: 1;
  color: rgb(190 24 93 / var(--tw-text-opacity, 1));
}

.text-\\[\\#C2410C\\] {
  --tw-text-opacity: 1;
  color: rgb(194 65 12 / var(--tw-text-opacity, 1));
}

.text-\\[\\#D97706\\] {
  --tw-text-opacity: 1;
  color: rgb(217 119 6 / var(--tw-text-opacity, 1));
}

.text-\\[\\#EC4899\\] {
  --tw-text-opacity: 1;
  color: rgb(236 72 153 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F472B6\\] {
  --tw-text-opacity: 1;
  color: rgb(244 114 182 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FBBF24\\] {
  --tw-text-opacity: 1;
  color: rgb(251 191 36 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FDBA74\\] {
  --tw-text-opacity: 1;
  color: rgb(253 186 116 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FEF08A\\] {
  --tw-text-opacity: 1;
  color: rgb(254 240 138 / var(--tw-text-opacity, 1));
}

.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-white\\/80 {
  color: rgb(255 255 255 / 0.8);
}

.text-white\\/90 {
  color: rgb(255 255 255 / 0.9);
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-40 {
  opacity: 0.4;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-70 {
  opacity: 0.7;
}

.shadow-2xl {
  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(251\\2c 191\\2c 36\\2c 0\\.6\\)\\] {
  --tw-shadow: 0 0 15px rgba(251,191,36,0.6);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_20px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 10px 20px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 10px 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_15px_30px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.6\\)\\] {
  --tw-shadow: 0 15px 30px rgba(0,0,0,0.6);
  --tw-shadow-colored: 0 15px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_2px_4px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.6\\)\\] {
  --tw-shadow: inset 0 2px 4px rgba(255,255,255,0.6);
  --tw-shadow-colored: inset 0 2px 4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.2\\)\\] {
  --tw-shadow: inset 0 4px 10px rgba(0,0,0,0.2);
  --tw-shadow-colored: inset 0 4px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-inner {
  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-black\\/50 {
  --tw-shadow-color: rgb(0 0 0 / 0.5);
  --tw-shadow: var(--tw-shadow-colored);
}

.blur-\\[40px\\] {
  --tw-blur: blur(40px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_2px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 2px rgba(0,0,0,0.5));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_2px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 2px rgba(0,0,0,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_4px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 4px 4px rgba(0,0,0,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-lg {
  --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-md {
  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4s\\] {
  animation-duration: 4s;
}

.\\[font-family\\:\\'Fredoka_One\\'\\2c _cursive\\] {
  font-family: 'Fredoka One', cursive;
}

.selection\\:bg-\\[\\#EC4899\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(236 72 153 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#EC4899\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(236 72 153 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#EC4899\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(236 72 153 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#EC4899\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(236 72 153 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-\\[1\\.01\\]:hover {
  --tw-scale-x: 1.01;
  --tw-scale-y: 1.01;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:bg-white\\/10:hover {
  background-color: rgb(255 255 255 / 0.1);
}

.hover\\:text-white:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-16 {
    margin-top: 4rem;
  }

  .md\\:h-12 {
    height: 3rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-28 {
    height: 7rem;
  }

  .md\\:w-12 {
    width: 3rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-28 {
    width: 7rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
`;
export function composeFun(_p) { return `<div class="min-h-screen bg-[#6B21A8] text-white font-sans overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#EC4899] selection:text-white"><div class="w-full relative bg-[#4C1D95] shadow-2xl shadow-black/50 border-b-[6px] border-[#FBBF24]"><div class="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_15px,transparent_15px,transparent_30px)] pointer-events-none"></div><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-6xl animate-bounce">🎰</span><h1 class="text-5xl md:text-7xl tracking-wide text-[#FBBF24] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] [font-family:'Fredoka_One',_cursive]">TOP WINNERS</h1><span class="text-4xl md:text-6xl animate-bounce [animation-delay:0.2s]">🎰</span></div><p class="text-[#EC4899] text-xl md:text-2xl font-bold tracking-wider mt-2 mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Drop coins. Climb the board. 🪙✨</p><div class="flex gap-2 bg-[#581C87] p-1.5 rounded-full border-2 border-[#FBBF24]/30 shadow-inner"><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/80 hover:text-white hover:bg-white/10 [font-family:'Fredoka_One',_cursive]">HOURLY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all bg-[#FBBF24] text-black shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 [font-family:'Fredoka_One',_cursive]">TODAY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/80 hover:text-white hover:bg-white/10 [font-family:'Fredoka_One',_cursive]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-12 md:mt-16 flex flex-col items-center"><div data-top3=""></div><div data-rows=""></div><div class="mt-12 mb-8 text-center"><p class="text-[#FBBF24] text-xl md:text-2xl tracking-wide animate-pulse [font-family:'Fredoka_One',_cursive]">🎉 Updated Live · Play More to Climb! 🎉</p></div></div></div>`; }
const SPACE_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.inset-\\[-10px\\] {
  inset: -10px;
}

.inset-\\[-18px\\] {
  inset: -18px;
}

.bottom-0 {
  bottom: 0px;
}

.left-0 {
  left: 0px;
}

.top-0 {
  top: 0px;
}

.z-0 {
  z-index: 0;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-16 {
  margin-top: 4rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-8 {
  margin-top: 2rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-8 {
  height: 2rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-1 {
  width: 0.25rem;
}

.w-1\\/3 {
  width: 33.333333%;
}

.w-12 {
  width: 3rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-8 {
  width: 2rem;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-\\[pulse_2s_ease-in-out_infinite\\] {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-\\[pulse_3s_ease-in-out_infinite\\] {
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-\\[pulse_4s_ease-in-out_infinite\\] {
  animation: pulse 4s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-\\[spin_4s_linear_infinite\\] {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-\\[spin_6s_linear_infinite_reverse\\] {
  animation: spin 6s linear infinite reverse;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-b-lg {
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.rounded-b-md {
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.rounded-t-xl {
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-x-2 {
  border-left-width: 2px;
  border-right-width: 2px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-\\[\\#22D3EE\\] {
  --tw-border-opacity: 1;
  border-color: rgb(34 211 238 / var(--tw-border-opacity, 1));
}

.border-\\[\\#22D3EE\\]\\/50 {
  border-color: rgb(34 211 238 / 0.5);
}

.border-\\[\\#8B5CF6\\] {
  --tw-border-opacity: 1;
  border-color: rgb(139 92 246 / var(--tw-border-opacity, 1));
}

.border-\\[\\#8B5CF6\\]\\/30 {
  border-color: rgb(139 92 246 / 0.3);
}

.border-\\[\\#8B5CF6\\]\\/50 {
  border-color: rgb(139 92 246 / 0.5);
}

.border-\\[\\#FFFBEB\\] {
  --tw-border-opacity: 1;
  border-color: rgb(255 251 235 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FFFBEB\\]\\/30 {
  border-color: rgb(255 251 235 / 0.3);
}

.border-\\[\\#FFFBEB\\]\\/50 {
  border-color: rgb(255 251 235 / 0.5);
}

.border-white\\/5 {
  border-color: rgb(255 255 255 / 0.05);
}

.border-b-transparent {
  border-bottom-color: transparent;
}

.border-t-transparent {
  border-top-color: transparent;
}

.bg-\\[\\#080B1A\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(8 11 26 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#0F172A\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#1E1B4B\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(30 27 75 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#1E1B4B\\]\\/80 {
  background-color: rgb(30 27 75 / 0.8);
}

.bg-\\[\\#2E285C\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(46 40 92 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#8B5CF6\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(139 92 246 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#8B5CF6\\]\\/30 {
  background-color: rgb(139 92 246 / 0.3);
}

.bg-\\[\\#FFFBEB\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 251 235 / var(--tw-bg-opacity, 1));
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-\\[\\#22D3EE\\]\\/20 {
  --tw-gradient-from: rgb(34 211 238 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(34 211 238 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#8B5CF6\\]\\/20 {
  --tw-gradient-from: rgb(139 92 246 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(139 92 246 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FFFBEB\\]\\/20 {
  --tw-gradient-from: rgb(255 251 235 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 251 235 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-transparent {
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
}

.p-1\\.5 {
  padding: 0.375rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.text-center {
  text-align: center;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-\\[11px\\] {
  font-size: 11px;
}

.text-\\[12px\\] {
  font-size: 12px;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#22D3EE\\] {
  --tw-text-opacity: 1;
  color: rgb(34 211 238 / var(--tw-text-opacity, 1));
}

.text-\\[\\#8B5CF6\\] {
  --tw-text-opacity: 1;
  color: rgb(139 92 246 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F472B6\\] {
  --tw-text-opacity: 1;
  color: rgb(244 114 182 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFFBEB\\] {
  --tw-text-opacity: 1;
  color: rgb(255 251 235 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-white\\/70 {
  color: rgb(255 255 255 / 0.7);
}

.text-white\\/80 {
  color: rgb(255 255 255 / 0.8);
}

.text-white\\/90 {
  color: rgb(255 255 255 / 0.9);
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-60 {
  opacity: 0.6;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow-\\[0_0_15px_\\#22D3EE\\] {
  --tw-shadow: 0 0 15px #22D3EE;
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_\\#8B5CF6\\] {
  --tw-shadow: 0 0 15px #8B5CF6;
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(139\\2c 92\\2c 246\\2c 0\\.3\\)\\] {
  --tw-shadow: 0 0 15px rgba(139,92,246,0.3);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_\\#22D3EE\\] {
  --tw-shadow: 0 0 20px #22D3EE;
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_\\#8B5CF6\\] {
  --tw-shadow: 0 0 20px #8B5CF6;
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_\\#FFFBEB\\] {
  --tw-shadow: 0 0 20px #FFFBEB;
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_30px_\\#FFFBEB\\] {
  --tw-shadow: 0 0 30px #FFFBEB;
  --tw-shadow-colored: 0 0 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur-\\[60px\\] {
  --tw-blur: blur(60px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_\\#FFFBEB\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px #FFFBEB);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_\\#22D3EE\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px #22D3EE);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_\\#8B5CF6\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px #8B5CF6);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_20px_\\#FFFBEB\\] {
  --tw-drop-shadow: drop-shadow(0 0 20px #FFFBEB);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_\\#FFFBEB\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px #FFFBEB);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_2px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 2px rgba(0,0,0,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-md {
  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.delay-500 {
  transition-delay: 500ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.\\[animation-delay\\:0\\.02080349732882536s\\] {
  animation-delay: 0.02080349732882536s;
}

.\\[animation-delay\\:0\\.040565941707361386s\\] {
  animation-delay: 0.040565941707361386s;
}

.\\[animation-delay\\:0\\.063473204328099s\\] {
  animation-delay: 0.063473204328099s;
}

.\\[animation-delay\\:0\\.07742737694003532s\\] {
  animation-delay: 0.07742737694003532s;
}

.\\[animation-delay\\:0\\.09174502144417773s\\] {
  animation-delay: 0.09174502144417773s;
}

.\\[animation-delay\\:0\\.09741460865256824s\\] {
  animation-delay: 0.09741460865256824s;
}

.\\[animation-delay\\:0\\.10076492901488199s\\] {
  animation-delay: 0.10076492901488199s;
}

.\\[animation-delay\\:0\\.16124639318606193s\\] {
  animation-delay: 0.16124639318606193s;
}

.\\[animation-delay\\:0\\.2556013528345924s\\] {
  animation-delay: 0.2556013528345924s;
}

.\\[animation-delay\\:0\\.322205129824102s\\] {
  animation-delay: 0.322205129824102s;
}

.\\[animation-delay\\:0\\.428667463010461s\\] {
  animation-delay: 0.428667463010461s;
}

.\\[animation-delay\\:0\\.45482177158345793s\\] {
  animation-delay: 0.45482177158345793s;
}

.\\[animation-delay\\:0\\.4575469389283331s\\] {
  animation-delay: 0.4575469389283331s;
}

.\\[animation-delay\\:0\\.532901660848911s\\] {
  animation-delay: 0.532901660848911s;
}

.\\[animation-delay\\:0\\.5338038027251353s\\] {
  animation-delay: 0.5338038027251353s;
}

.\\[animation-delay\\:0\\.5451548823490009s\\] {
  animation-delay: 0.5451548823490009s;
}

.\\[animation-delay\\:0\\.7346105877154399s\\] {
  animation-delay: 0.7346105877154399s;
}

.\\[animation-delay\\:0\\.754368435621376s\\] {
  animation-delay: 0.754368435621376s;
}

.\\[animation-delay\\:0\\.7812345341962339s\\] {
  animation-delay: 0.7812345341962339s;
}

.\\[animation-delay\\:0\\.7830216632148388s\\] {
  animation-delay: 0.7830216632148388s;
}

.\\[animation-delay\\:0\\.8278656255180776s\\] {
  animation-delay: 0.8278656255180776s;
}

.\\[animation-delay\\:0\\.8570026135585078s\\] {
  animation-delay: 0.8570026135585078s;
}

.\\[animation-delay\\:0\\.8680270525187141s\\] {
  animation-delay: 0.8680270525187141s;
}

.\\[animation-delay\\:0\\.9878747276866111s\\] {
  animation-delay: 0.9878747276866111s;
}

.\\[animation-delay\\:1\\.036654517932085s\\] {
  animation-delay: 1.036654517932085s;
}

.\\[animation-delay\\:1\\.0402086340698768s\\] {
  animation-delay: 1.0402086340698768s;
}

.\\[animation-delay\\:1\\.0888581522285397s\\] {
  animation-delay: 1.0888581522285397s;
}

.\\[animation-delay\\:1\\.1007520567660467s\\] {
  animation-delay: 1.1007520567660467s;
}

.\\[animation-delay\\:1\\.1596498855105424s\\] {
  animation-delay: 1.1596498855105424s;
}

.\\[animation-delay\\:1\\.175381682468653s\\] {
  animation-delay: 1.175381682468653s;
}

.\\[animation-delay\\:1\\.2133059420666856s\\] {
  animation-delay: 1.2133059420666856s;
}

.\\[animation-delay\\:1\\.239927972724928s\\] {
  animation-delay: 1.239927972724928s;
}

.\\[animation-delay\\:1\\.2994965059132182s\\] {
  animation-delay: 1.2994965059132182s;
}

.\\[animation-delay\\:1\\.3131427671473526s\\] {
  animation-delay: 1.3131427671473526s;
}

.\\[animation-delay\\:1\\.3332149524844052s\\] {
  animation-delay: 1.3332149524844052s;
}

.\\[animation-delay\\:1\\.3339363288461048s\\] {
  animation-delay: 1.3339363288461048s;
}

.\\[animation-delay\\:1\\.401722546118761s\\] {
  animation-delay: 1.401722546118761s;
}

.\\[animation-delay\\:1\\.4077913864340301s\\] {
  animation-delay: 1.4077913864340301s;
}

.\\[animation-delay\\:1\\.407861708751476s\\] {
  animation-delay: 1.407861708751476s;
}

.\\[animation-delay\\:1\\.4410314404709352s\\] {
  animation-delay: 1.4410314404709352s;
}

.\\[animation-delay\\:1\\.4641116601925013s\\] {
  animation-delay: 1.4641116601925013s;
}

.\\[animation-delay\\:1\\.539630393008044s\\] {
  animation-delay: 1.539630393008044s;
}

.\\[animation-delay\\:1\\.5518389492863274s\\] {
  animation-delay: 1.5518389492863274s;
}

.\\[animation-delay\\:1\\.556015848961388s\\] {
  animation-delay: 1.556015848961388s;
}

.\\[animation-delay\\:1\\.5750516973644038s\\] {
  animation-delay: 1.5750516973644038s;
}

.\\[animation-delay\\:1\\.5975805752815528s\\] {
  animation-delay: 1.5975805752815528s;
}

.\\[animation-delay\\:1\\.5s\\] {
  animation-delay: 1.5s;
}

.\\[animation-delay\\:1\\.654587603323824s\\] {
  animation-delay: 1.654587603323824s;
}

.\\[animation-delay\\:1\\.661418163105197s\\] {
  animation-delay: 1.661418163105197s;
}

.\\[animation-delay\\:1\\.672516553703558s\\] {
  animation-delay: 1.672516553703558s;
}

.\\[animation-delay\\:1\\.6740923960462948s\\] {
  animation-delay: 1.6740923960462948s;
}

.\\[animation-delay\\:1\\.6872212424292345s\\] {
  animation-delay: 1.6872212424292345s;
}

.\\[animation-delay\\:1\\.7336202080062622s\\] {
  animation-delay: 1.7336202080062622s;
}

.\\[animation-delay\\:1\\.7499954621117977s\\] {
  animation-delay: 1.7499954621117977s;
}

.\\[animation-delay\\:1\\.8342183603192275s\\] {
  animation-delay: 1.8342183603192275s;
}

.\\[animation-delay\\:1\\.8381186049567182s\\] {
  animation-delay: 1.8381186049567182s;
}

.\\[animation-delay\\:1\\.8586622263556993s\\] {
  animation-delay: 1.8586622263556993s;
}

.\\[animation-delay\\:1\\.9141389281275483s\\] {
  animation-delay: 1.9141389281275483s;
}

.\\[animation-delay\\:1\\.9254805799419603s\\] {
  animation-delay: 1.9254805799419603s;
}

.\\[animation-delay\\:1\\.9723543978478715s\\] {
  animation-delay: 1.9723543978478715s;
}

.\\[animation-delay\\:1\\.984430022971915s\\] {
  animation-delay: 1.984430022971915s;
}

.\\[animation-duration\\:2\\.0658575272985726s\\] {
  animation-duration: 2.0658575272985726s;
}

.\\[animation-duration\\:2\\.117949021513481s\\] {
  animation-duration: 2.117949021513481s;
}

.\\[animation-duration\\:2\\.1543018961863103s\\] {
  animation-duration: 2.1543018961863103s;
}

.\\[animation-duration\\:2\\.195370808571487s\\] {
  animation-duration: 2.195370808571487s;
}

.\\[animation-duration\\:2\\.241224358177143s\\] {
  animation-duration: 2.241224358177143s;
}

.\\[animation-duration\\:2\\.3106990523877133s\\] {
  animation-duration: 2.3106990523877133s;
}

.\\[animation-duration\\:2\\.338945841183303s\\] {
  animation-duration: 2.338945841183303s;
}

.\\[animation-duration\\:2\\.448525573929836s\\] {
  animation-duration: 2.448525573929836s;
}

.\\[animation-duration\\:2\\.5873636570595266s\\] {
  animation-duration: 2.5873636570595266s;
}

.\\[animation-duration\\:2\\.6131220938041992s\\] {
  animation-duration: 2.6131220938041992s;
}

.\\[animation-duration\\:2\\.623485604242766s\\] {
  animation-duration: 2.623485604242766s;
}

.\\[animation-duration\\:2\\.6361546814838666s\\] {
  animation-duration: 2.6361546814838666s;
}

.\\[animation-duration\\:2\\.6575371356699726s\\] {
  animation-duration: 2.6575371356699726s;
}

.\\[animation-duration\\:2\\.734713576697604s\\] {
  animation-duration: 2.734713576697604s;
}

.\\[animation-duration\\:2\\.7532720186697515s\\] {
  animation-duration: 2.7532720186697515s;
}

.\\[animation-duration\\:2\\.7547198843819487s\\] {
  animation-duration: 2.7547198843819487s;
}

.\\[animation-duration\\:2\\.7941182186821782s\\] {
  animation-duration: 2.7941182186821782s;
}

.\\[animation-duration\\:2\\.859492705930293s\\] {
  animation-duration: 2.859492705930293s;
}

.\\[animation-duration\\:2\\.884271502224121s\\] {
  animation-duration: 2.884271502224121s;
}

.\\[animation-duration\\:2\\.8843244953873066s\\] {
  animation-duration: 2.8843244953873066s;
}

.\\[animation-duration\\:2\\.966721570494186s\\] {
  animation-duration: 2.966721570494186s;
}

.\\[animation-duration\\:2\\.9813339897868296s\\] {
  animation-duration: 2.9813339897868296s;
}

.\\[animation-duration\\:3\\.032736676075613s\\] {
  animation-duration: 3.032736676075613s;
}

.\\[animation-duration\\:3\\.0575526717095975s\\] {
  animation-duration: 3.0575526717095975s;
}

.\\[animation-duration\\:3\\.09382554130711s\\] {
  animation-duration: 3.09382554130711s;
}

.\\[animation-duration\\:3\\.1428790481625968s\\] {
  animation-duration: 3.1428790481625968s;
}

.\\[animation-duration\\:3\\.1445912600084522s\\] {
  animation-duration: 3.1445912600084522s;
}

.\\[animation-duration\\:3\\.1626816168153673s\\] {
  animation-duration: 3.1626816168153673s;
}

.\\[animation-duration\\:3\\.3649112487105883s\\] {
  animation-duration: 3.3649112487105883s;
}

.\\[animation-duration\\:3\\.458014113581469s\\] {
  animation-duration: 3.458014113581469s;
}

.\\[animation-duration\\:3\\.515395318351259s\\] {
  animation-duration: 3.515395318351259s;
}

.\\[animation-duration\\:3\\.528268900348272s\\] {
  animation-duration: 3.528268900348272s;
}

.\\[animation-duration\\:3\\.6113508446953926s\\] {
  animation-duration: 3.6113508446953926s;
}

.\\[animation-duration\\:3\\.673715864640929s\\] {
  animation-duration: 3.673715864640929s;
}

.\\[animation-duration\\:3\\.6938117478785557s\\] {
  animation-duration: 3.6938117478785557s;
}

.\\[animation-duration\\:3\\.6993856195881163s\\] {
  animation-duration: 3.6993856195881163s;
}

.\\[animation-duration\\:3\\.761260747957285s\\] {
  animation-duration: 3.761260747957285s;
}

.\\[animation-duration\\:3\\.7619445019054423s\\] {
  animation-duration: 3.7619445019054423s;
}

.\\[animation-duration\\:3\\.7839345254227137s\\] {
  animation-duration: 3.7839345254227137s;
}

.\\[animation-duration\\:3\\.8510780821023025s\\] {
  animation-duration: 3.8510780821023025s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4\\.013053488286674s\\] {
  animation-duration: 4.013053488286674s;
}

.\\[animation-duration\\:4\\.034661623283027s\\] {
  animation-duration: 4.034661623283027s;
}

.\\[animation-duration\\:4\\.091859962284925s\\] {
  animation-duration: 4.091859962284925s;
}

.\\[animation-duration\\:4\\.232536331843289s\\] {
  animation-duration: 4.232536331843289s;
}

.\\[animation-duration\\:4\\.2478579061251684s\\] {
  animation-duration: 4.2478579061251684s;
}

.\\[animation-duration\\:4\\.271530705993455s\\] {
  animation-duration: 4.271530705993455s;
}

.\\[animation-duration\\:4\\.27170208314226s\\] {
  animation-duration: 4.27170208314226s;
}

.\\[animation-duration\\:4\\.3008072337306364s\\] {
  animation-duration: 4.3008072337306364s;
}

.\\[animation-duration\\:4\\.325610801874662s\\] {
  animation-duration: 4.325610801874662s;
}

.\\[animation-duration\\:4\\.3550117106966795s\\] {
  animation-duration: 4.3550117106966795s;
}

.\\[animation-duration\\:4\\.446346142750217s\\] {
  animation-duration: 4.446346142750217s;
}

.\\[animation-duration\\:4\\.466430252751696s\\] {
  animation-duration: 4.466430252751696s;
}

.\\[animation-duration\\:4\\.505062288000989s\\] {
  animation-duration: 4.505062288000989s;
}

.\\[animation-duration\\:4\\.610357442521332s\\] {
  animation-duration: 4.610357442521332s;
}

.\\[animation-duration\\:4\\.648247009004947s\\] {
  animation-duration: 4.648247009004947s;
}

.\\[animation-duration\\:4\\.654675779924882s\\] {
  animation-duration: 4.654675779924882s;
}

.\\[animation-duration\\:4\\.704636289230879s\\] {
  animation-duration: 4.704636289230879s;
}

.\\[animation-duration\\:4\\.736197877051587s\\] {
  animation-duration: 4.736197877051587s;
}

.\\[animation-duration\\:4\\.797479340811473s\\] {
  animation-duration: 4.797479340811473s;
}

.\\[animation-duration\\:4\\.99030975785458s\\] {
  animation-duration: 4.99030975785458s;
}

.\\[font-family\\:\\'Inter\\'\\2c _sans-serif\\] {
  font-family: 'Inter', sans-serif;
}

.\\[font-family\\:\\'Orbitron\\'\\2c _sans-serif\\] {
  font-family: 'Orbitron', sans-serif;
}

.\\[font-weight\\:700\\] {
  font-weight: 700;
}

.\\[font-weight\\:900\\] {
  font-weight: 900;
}

.\\[height\\:1\\.0015781902153043px\\] {
  height: 1.0015781902153043px;
}

.\\[height\\:1\\.079080600709315px\\] {
  height: 1.079080600709315px;
}

.\\[height\\:1\\.102646135495219px\\] {
  height: 1.102646135495219px;
}

.\\[height\\:1\\.240060353863717px\\] {
  height: 1.240060353863717px;
}

.\\[height\\:1\\.262015800019347px\\] {
  height: 1.262015800019347px;
}

.\\[height\\:1\\.3126274101817599px\\] {
  height: 1.3126274101817599px;
}

.\\[height\\:1\\.3972915710883775px\\] {
  height: 1.3972915710883775px;
}

.\\[height\\:1\\.4044644682922836px\\] {
  height: 1.4044644682922836px;
}

.\\[height\\:1\\.4184345652845691px\\] {
  height: 1.4184345652845691px;
}

.\\[height\\:1\\.4782636084978291px\\] {
  height: 1.4782636084978291px;
}

.\\[height\\:1\\.5267745863672177px\\] {
  height: 1.5267745863672177px;
}

.\\[height\\:1\\.6795958362843255px\\] {
  height: 1.6795958362843255px;
}

.\\[height\\:1\\.7166558454033156px\\] {
  height: 1.7166558454033156px;
}

.\\[height\\:1\\.7570812402219418px\\] {
  height: 1.7570812402219418px;
}

.\\[height\\:1\\.8411650392173189px\\] {
  height: 1.8411650392173189px;
}

.\\[height\\:1\\.8495615969321892px\\] {
  height: 1.8495615969321892px;
}

.\\[height\\:1\\.86920332154809px\\] {
  height: 1.86920332154809px;
}

.\\[height\\:1\\.9128281442580906px\\] {
  height: 1.9128281442580906px;
}

.\\[height\\:1\\.9178692975922096px\\] {
  height: 1.9178692975922096px;
}

.\\[height\\:1\\.927304841208438px\\] {
  height: 1.927304841208438px;
}

.\\[height\\:2\\.1289254848794767px\\] {
  height: 2.1289254848794767px;
}

.\\[height\\:2\\.3572060349200106px\\] {
  height: 2.3572060349200106px;
}

.\\[height\\:2\\.361457209724242px\\] {
  height: 2.361457209724242px;
}

.\\[height\\:2\\.366565646381078px\\] {
  height: 2.366565646381078px;
}

.\\[height\\:2\\.4608581748211864px\\] {
  height: 2.4608581748211864px;
}

.\\[height\\:2\\.471258582077497px\\] {
  height: 2.471258582077497px;
}

.\\[height\\:2\\.4780574680677407px\\] {
  height: 2.4780574680677407px;
}

.\\[height\\:2\\.634481852064157px\\] {
  height: 2.634481852064157px;
}

.\\[height\\:2\\.6821780529159787px\\] {
  height: 2.6821780529159787px;
}

.\\[height\\:2\\.729813991316699px\\] {
  height: 2.729813991316699px;
}

.\\[height\\:2\\.7750975769920947px\\] {
  height: 2.7750975769920947px;
}

.\\[height\\:2\\.7973192093482524px\\] {
  height: 2.7973192093482524px;
}

.\\[height\\:2\\.823174228526658px\\] {
  height: 2.823174228526658px;
}

.\\[height\\:2\\.8459268192939393px\\] {
  height: 2.8459268192939393px;
}

.\\[height\\:2\\.871351396613689px\\] {
  height: 2.871351396613689px;
}

.\\[height\\:2\\.8852846865583506px\\] {
  height: 2.8852846865583506px;
}

.\\[height\\:2\\.911956793725009px\\] {
  height: 2.911956793725009px;
}

.\\[height\\:3\\.0196638808766427px\\] {
  height: 3.0196638808766427px;
}

.\\[height\\:3\\.12648567910069px\\] {
  height: 3.12648567910069px;
}

.\\[height\\:3\\.142036144118796px\\] {
  height: 3.142036144118796px;
}

.\\[height\\:3\\.229042887755779px\\] {
  height: 3.229042887755779px;
}

.\\[height\\:3\\.243756005816792px\\] {
  height: 3.243756005816792px;
}

.\\[height\\:3\\.2832070048924664px\\] {
  height: 3.2832070048924664px;
}

.\\[height\\:3\\.285327889659557px\\] {
  height: 3.285327889659557px;
}

.\\[height\\:3\\.313174213773374px\\] {
  height: 3.313174213773374px;
}

.\\[height\\:3\\.378235380142824px\\] {
  height: 3.378235380142824px;
}

.\\[height\\:3\\.3904896766591346px\\] {
  height: 3.3904896766591346px;
}

.\\[height\\:3\\.4062811578419323px\\] {
  height: 3.4062811578419323px;
}

.\\[height\\:3\\.4203447540385485px\\] {
  height: 3.4203447540385485px;
}

.\\[height\\:3\\.5201091978216317px\\] {
  height: 3.5201091978216317px;
}

.\\[height\\:3\\.5217498303689903px\\] {
  height: 3.5217498303689903px;
}

.\\[height\\:3\\.5297821031441683px\\] {
  height: 3.5297821031441683px;
}

.\\[height\\:3\\.594414686072395px\\] {
  height: 3.594414686072395px;
}

.\\[height\\:3\\.62743069910472px\\] {
  height: 3.62743069910472px;
}

.\\[height\\:3\\.6525561278223506px\\] {
  height: 3.6525561278223506px;
}

.\\[height\\:3\\.806653452010974px\\] {
  height: 3.806653452010974px;
}

.\\[height\\:3\\.828156131103351px\\] {
  height: 3.828156131103351px;
}

.\\[height\\:3\\.835962111759816px\\] {
  height: 3.835962111759816px;
}

.\\[height\\:3\\.916042601131659px\\] {
  height: 3.916042601131659px;
}

.\\[height\\:3\\.9878992960784982px\\] {
  height: 3.9878992960784982px;
}

.\\[left\\:0\\.10923652452090593\\%\\] {
  left: 0.10923652452090593%;
}

.\\[left\\:1\\.0902575487316324\\%\\] {
  left: 1.0902575487316324%;
}

.\\[left\\:1\\.6094166089509643\\%\\] {
  left: 1.6094166089509643%;
}

.\\[left\\:10\\.998185138986106\\%\\] {
  left: 10.998185138986106%;
}

.\\[left\\:11\\.134173935956248\\%\\] {
  left: 11.134173935956248%;
}

.\\[left\\:13\\.09307939920683\\%\\] {
  left: 13.09307939920683%;
}

.\\[left\\:13\\.115207899075799\\%\\] {
  left: 13.115207899075799%;
}

.\\[left\\:15\\.654996677575783\\%\\] {
  left: 15.654996677575783%;
}

.\\[left\\:17\\.409933723314307\\%\\] {
  left: 17.409933723314307%;
}

.\\[left\\:18\\.83947244528963\\%\\] {
  left: 18.83947244528963%;
}

.\\[left\\:20\\.49713909731059\\%\\] {
  left: 20.49713909731059%;
}

.\\[left\\:20\\.500970069932535\\%\\] {
  left: 20.500970069932535%;
}

.\\[left\\:20\\.83335451034979\\%\\] {
  left: 20.83335451034979%;
}

.\\[left\\:24\\.403160367808553\\%\\] {
  left: 24.403160367808553%;
}

.\\[left\\:24\\.803737613415567\\%\\] {
  left: 24.803737613415567%;
}

.\\[left\\:25\\.171820426653657\\%\\] {
  left: 25.171820426653657%;
}

.\\[left\\:26\\.77189737652953\\%\\] {
  left: 26.77189737652953%;
}

.\\[left\\:28\\.118490578694498\\%\\] {
  left: 28.118490578694498%;
}

.\\[left\\:28\\.4472414237673\\%\\] {
  left: 28.4472414237673%;
}

.\\[left\\:28\\.562157529080256\\%\\] {
  left: 28.562157529080256%;
}

.\\[left\\:34\\.004700565197886\\%\\] {
  left: 34.004700565197886%;
}

.\\[left\\:34\\.578323046676815\\%\\] {
  left: 34.578323046676815%;
}

.\\[left\\:34\\.69634543349643\\%\\] {
  left: 34.69634543349643%;
}

.\\[left\\:35\\.222398136508396\\%\\] {
  left: 35.222398136508396%;
}

.\\[left\\:36\\.15060168899515\\%\\] {
  left: 36.15060168899515%;
}

.\\[left\\:36\\.36327491252354\\%\\] {
  left: 36.36327491252354%;
}

.\\[left\\:36\\.76895233063604\\%\\] {
  left: 36.76895233063604%;
}

.\\[left\\:39\\.19005292657367\\%\\] {
  left: 39.19005292657367%;
}

.\\[left\\:39\\.73233172501719\\%\\] {
  left: 39.73233172501719%;
}

.\\[left\\:4\\.313747420503489\\%\\] {
  left: 4.313747420503489%;
}

.\\[left\\:4\\.672705834793767\\%\\] {
  left: 4.672705834793767%;
}

.\\[left\\:4\\.974996124715991\\%\\] {
  left: 4.974996124715991%;
}

.\\[left\\:40\\.14584926331679\\%\\] {
  left: 40.14584926331679%;
}

.\\[left\\:41\\.68839714656718\\%\\] {
  left: 41.68839714656718%;
}

.\\[left\\:43\\.43654070794424\\%\\] {
  left: 43.43654070794424%;
}

.\\[left\\:49\\.36832594981123\\%\\] {
  left: 49.36832594981123%;
}

.\\[left\\:5\\.481948985758811\\%\\] {
  left: 5.481948985758811%;
}

.\\[left\\:52\\.31268367219997\\%\\] {
  left: 52.31268367219997%;
}

.\\[left\\:55\\.43501186921686\\%\\] {
  left: 55.43501186921686%;
}

.\\[left\\:56\\.894414975630326\\%\\] {
  left: 56.894414975630326%;
}

.\\[left\\:6\\.338799414520624\\%\\] {
  left: 6.338799414520624%;
}

.\\[left\\:60\\.31803663171812\\%\\] {
  left: 60.31803663171812%;
}

.\\[left\\:61\\.47245750050568\\%\\] {
  left: 61.47245750050568%;
}

.\\[left\\:64\\.9195448341581\\%\\] {
  left: 64.9195448341581%;
}

.\\[left\\:69\\.88040290183619\\%\\] {
  left: 69.88040290183619%;
}

.\\[left\\:7\\.637654955111984\\%\\] {
  left: 7.637654955111984%;
}

.\\[left\\:70\\.74159949218195\\%\\] {
  left: 70.74159949218195%;
}

.\\[left\\:71\\.058723361569\\%\\] {
  left: 71.058723361569%;
}

.\\[left\\:78\\.3787428765926\\%\\] {
  left: 78.3787428765926%;
}

.\\[left\\:80\\.73123470497056\\%\\] {
  left: 80.73123470497056%;
}

.\\[left\\:81\\.02997031289102\\%\\] {
  left: 81.02997031289102%;
}

.\\[left\\:81\\.91577338968511\\%\\] {
  left: 81.91577338968511%;
}

.\\[left\\:82\\.45254831635035\\%\\] {
  left: 82.45254831635035%;
}

.\\[left\\:82\\.97997557164213\\%\\] {
  left: 82.97997557164213%;
}

.\\[left\\:84\\.89782336871728\\%\\] {
  left: 84.89782336871728%;
}

.\\[left\\:85\\.12464682986588\\%\\] {
  left: 85.12464682986588%;
}

.\\[left\\:86\\.08494018981749\\%\\] {
  left: 86.08494018981749%;
}

.\\[left\\:87\\.71450067103864\\%\\] {
  left: 87.71450067103864%;
}

.\\[left\\:88\\.45997341233746\\%\\] {
  left: 88.45997341233746%;
}

.\\[left\\:96\\.12266538054797\\%\\] {
  left: 96.12266538054797%;
}

.\\[text-shadow\\:0_0_20px_\\#8B5CF6\\] {
  text-shadow: 0 0 20px #8B5CF6;
}

.\\[top\\:11\\.302805725872467\\%\\] {
  top: 11.302805725872467%;
}

.\\[top\\:12\\.434964027936058\\%\\] {
  top: 12.434964027936058%;
}

.\\[top\\:15\\.366212112429778\\%\\] {
  top: 15.366212112429778%;
}

.\\[top\\:16\\.699149677150547\\%\\] {
  top: 16.699149677150547%;
}

.\\[top\\:17\\.504072083643006\\%\\] {
  top: 17.504072083643006%;
}

.\\[top\\:18\\.036114436708818\\%\\] {
  top: 18.036114436708818%;
}

.\\[top\\:20\\.673625752078063\\%\\] {
  top: 20.673625752078063%;
}

.\\[top\\:21\\.71244548243062\\%\\] {
  top: 21.71244548243062%;
}

.\\[top\\:24\\.154244812913394\\%\\] {
  top: 24.154244812913394%;
}

.\\[top\\:26\\.54003618875267\\%\\] {
  top: 26.54003618875267%;
}

.\\[top\\:27\\.41375294320293\\%\\] {
  top: 27.41375294320293%;
}

.\\[top\\:29\\.078380834749307\\%\\] {
  top: 29.078380834749307%;
}

.\\[top\\:33\\.44923077313734\\%\\] {
  top: 33.44923077313734%;
}

.\\[top\\:35\\.15520760393015\\%\\] {
  top: 35.15520760393015%;
}

.\\[top\\:35\\.24359249906044\\%\\] {
  top: 35.24359249906044%;
}

.\\[top\\:35\\.786636606592445\\%\\] {
  top: 35.786636606592445%;
}

.\\[top\\:38\\.088469888444955\\%\\] {
  top: 38.088469888444955%;
}

.\\[top\\:39\\.39564561353498\\%\\] {
  top: 39.39564561353498%;
}

.\\[top\\:4\\.9406557766681125\\%\\] {
  top: 4.9406557766681125%;
}

.\\[top\\:40\\.47130930718593\\%\\] {
  top: 40.47130930718593%;
}

.\\[top\\:45\\.52479678239904\\%\\] {
  top: 45.52479678239904%;
}

.\\[top\\:46\\.21520520741236\\%\\] {
  top: 46.21520520741236%;
}

.\\[top\\:47\\.324022496170734\\%\\] {
  top: 47.324022496170734%;
}

.\\[top\\:47\\.81378354732413\\%\\] {
  top: 47.81378354732413%;
}

.\\[top\\:48\\.30119405646285\\%\\] {
  top: 48.30119405646285%;
}

.\\[top\\:49\\.02547389391538\\%\\] {
  top: 49.02547389391538%;
}

.\\[top\\:49\\.06323689147629\\%\\] {
  top: 49.06323689147629%;
}

.\\[top\\:49\\.63799056956743\\%\\] {
  top: 49.63799056956743%;
}

.\\[top\\:5\\.866116238578223\\%\\] {
  top: 5.866116238578223%;
}

.\\[top\\:51\\.12007701030752\\%\\] {
  top: 51.12007701030752%;
}

.\\[top\\:51\\.300426694129\\%\\] {
  top: 51.300426694129%;
}

.\\[top\\:54\\.12106696054034\\%\\] {
  top: 54.12106696054034%;
}

.\\[top\\:54\\.31663796000446\\%\\] {
  top: 54.31663796000446%;
}

.\\[top\\:54\\.49620132097364\\%\\] {
  top: 54.49620132097364%;
}

.\\[top\\:59\\.37673323478169\\%\\] {
  top: 59.37673323478169%;
}

.\\[top\\:63\\.94964787234228\\%\\] {
  top: 63.94964787234228%;
}

.\\[top\\:63\\.9694773976856\\%\\] {
  top: 63.9694773976856%;
}

.\\[top\\:66\\.95598242079882\\%\\] {
  top: 66.95598242079882%;
}

.\\[top\\:67\\.29927279967961\\%\\] {
  top: 67.29927279967961%;
}

.\\[top\\:67\\.5594389427379\\%\\] {
  top: 67.5594389427379%;
}

.\\[top\\:67\\.88059219163269\\%\\] {
  top: 67.88059219163269%;
}

.\\[top\\:67\\.95771853670013\\%\\] {
  top: 67.95771853670013%;
}

.\\[top\\:72\\.07596833455682\\%\\] {
  top: 72.07596833455682%;
}

.\\[top\\:73\\.17439682737049\\%\\] {
  top: 73.17439682737049%;
}

.\\[top\\:73\\.36203922419139\\%\\] {
  top: 73.36203922419139%;
}

.\\[top\\:74\\.49611837726286\\%\\] {
  top: 74.49611837726286%;
}

.\\[top\\:75\\.02497440424645\\%\\] {
  top: 75.02497440424645%;
}

.\\[top\\:75\\.46227099814581\\%\\] {
  top: 75.46227099814581%;
}

.\\[top\\:75\\.76971264219114\\%\\] {
  top: 75.76971264219114%;
}

.\\[top\\:78\\.80580918347243\\%\\] {
  top: 78.80580918347243%;
}

.\\[top\\:79\\.95839993260765\\%\\] {
  top: 79.95839993260765%;
}

.\\[top\\:81\\.54701629834793\\%\\] {
  top: 81.54701629834793%;
}

.\\[top\\:83\\.27114385067219\\%\\] {
  top: 83.27114385067219%;
}

.\\[top\\:84\\.54376327473442\\%\\] {
  top: 84.54376327473442%;
}

.\\[top\\:85\\.63706709775757\\%\\] {
  top: 85.63706709775757%;
}

.\\[top\\:86\\.933388268342\\%\\] {
  top: 86.933388268342%;
}

.\\[top\\:92\\.18726201675358\\%\\] {
  top: 92.18726201675358%;
}

.\\[top\\:92\\.98440989249893\\%\\] {
  top: 92.98440989249893%;
}

.\\[top\\:97\\.26154460321686\\%\\] {
  top: 97.26154460321686%;
}

.\\[top\\:99\\.1620137240954\\%\\] {
  top: 99.1620137240954%;
}

.\\[width\\:1\\.0311956021043072px\\] {
  width: 1.0311956021043072px;
}

.\\[width\\:1\\.1217626836539702px\\] {
  width: 1.1217626836539702px;
}

.\\[width\\:1\\.1338978325942262px\\] {
  width: 1.1338978325942262px;
}

.\\[width\\:1\\.2010657478766296px\\] {
  width: 1.2010657478766296px;
}

.\\[width\\:1\\.2286434431766562px\\] {
  width: 1.2286434431766562px;
}

.\\[width\\:1\\.2567754171041334px\\] {
  width: 1.2567754171041334px;
}

.\\[width\\:1\\.3567733310497792px\\] {
  width: 1.3567733310497792px;
}

.\\[width\\:1\\.409540290241924px\\] {
  width: 1.409540290241924px;
}

.\\[width\\:1\\.4213803310765096px\\] {
  width: 1.4213803310765096px;
}

.\\[width\\:1\\.4431180534751822px\\] {
  width: 1.4431180534751822px;
}

.\\[width\\:1\\.4870504916479952px\\] {
  width: 1.4870504916479952px;
}

.\\[width\\:1\\.5075992816512924px\\] {
  width: 1.5075992816512924px;
}

.\\[width\\:1\\.5124673473142187px\\] {
  width: 1.5124673473142187px;
}

.\\[width\\:1\\.5138457794913722px\\] {
  width: 1.5138457794913722px;
}

.\\[width\\:1\\.588370393222241px\\] {
  width: 1.588370393222241px;
}

.\\[width\\:1\\.612936406576241px\\] {
  width: 1.612936406576241px;
}

.\\[width\\:1\\.6332444213703603px\\] {
  width: 1.6332444213703603px;
}

.\\[width\\:1\\.7394959962939192px\\] {
  width: 1.7394959962939192px;
}

.\\[width\\:1\\.7655770739705758px\\] {
  width: 1.7655770739705758px;
}

.\\[width\\:1\\.803850611251749px\\] {
  width: 1.803850611251749px;
}

.\\[width\\:1\\.8619342025352763px\\] {
  width: 1.8619342025352763px;
}

.\\[width\\:1\\.874529117088461px\\] {
  width: 1.874529117088461px;
}

.\\[width\\:1\\.923987278990169px\\] {
  width: 1.923987278990169px;
}

.\\[width\\:1\\.9831649847978832px\\] {
  width: 1.9831649847978832px;
}

.\\[width\\:2\\.0155610018679173px\\] {
  width: 2.0155610018679173px;
}

.\\[width\\:2\\.106238097111836px\\] {
  width: 2.106238097111836px;
}

.\\[width\\:2\\.1834809884235886px\\] {
  width: 2.1834809884235886px;
}

.\\[width\\:2\\.2089924027238794px\\] {
  width: 2.2089924027238794px;
}

.\\[width\\:2\\.2620521440102137px\\] {
  width: 2.2620521440102137px;
}

.\\[width\\:2\\.2913266281169533px\\] {
  width: 2.2913266281169533px;
}

.\\[width\\:2\\.320200352869293px\\] {
  width: 2.320200352869293px;
}

.\\[width\\:2\\.3205833411709413px\\] {
  width: 2.3205833411709413px;
}

.\\[width\\:2\\.363126138471153px\\] {
  width: 2.363126138471153px;
}

.\\[width\\:2\\.3867765555278844px\\] {
  width: 2.3867765555278844px;
}

.\\[width\\:2\\.4427157651097717px\\] {
  width: 2.4427157651097717px;
}

.\\[width\\:2\\.5592295873036357px\\] {
  width: 2.5592295873036357px;
}

.\\[width\\:2\\.671540832635498px\\] {
  width: 2.671540832635498px;
}

.\\[width\\:2\\.684232116134324px\\] {
  width: 2.684232116134324px;
}

.\\[width\\:2\\.7214954670514184px\\] {
  width: 2.7214954670514184px;
}

.\\[width\\:2\\.8167207241849628px\\] {
  width: 2.8167207241849628px;
}

.\\[width\\:2\\.8520596052416676px\\] {
  width: 2.8520596052416676px;
}

.\\[width\\:2\\.985817410803156px\\] {
  width: 2.985817410803156px;
}

.\\[width\\:2\\.9983926696075365px\\] {
  width: 2.9983926696075365px;
}

.\\[width\\:3\\.1199305515925015px\\] {
  width: 3.1199305515925015px;
}

.\\[width\\:3\\.130289881190324px\\] {
  width: 3.130289881190324px;
}

.\\[width\\:3\\.376573872120715px\\] {
  width: 3.376573872120715px;
}

.\\[width\\:3\\.3881191139672637px\\] {
  width: 3.3881191139672637px;
}

.\\[width\\:3\\.412443957247938px\\] {
  width: 3.412443957247938px;
}

.\\[width\\:3\\.42511056386294px\\] {
  width: 3.42511056386294px;
}

.\\[width\\:3\\.425159230815037px\\] {
  width: 3.425159230815037px;
}

.\\[width\\:3\\.450905300179886px\\] {
  width: 3.450905300179886px;
}

.\\[width\\:3\\.472655855745105px\\] {
  width: 3.472655855745105px;
}

.\\[width\\:3\\.5072043704670834px\\] {
  width: 3.5072043704670834px;
}

.\\[width\\:3\\.5520745606646056px\\] {
  width: 3.5520745606646056px;
}

.\\[width\\:3\\.583729150206776px\\] {
  width: 3.583729150206776px;
}

.\\[width\\:3\\.626758514843437px\\] {
  width: 3.626758514843437px;
}

.\\[width\\:3\\.646956014814709px\\] {
  width: 3.646956014814709px;
}

.\\[width\\:3\\.8367463570454508px\\] {
  width: 3.8367463570454508px;
}

.\\[width\\:3\\.9354291328489097px\\] {
  width: 3.9354291328489097px;
}

.\\[width\\:3\\.9748344390577035px\\] {
  width: 3.9748344390577035px;
}

.selection\\:bg-\\[\\#F472B6\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(244 114 182 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#F472B6\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(244 114 182 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#F472B6\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(244 114 182 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#F472B6\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(244 114 182 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:-translate-y-10:hover {
  --tw-translate-y: -2.5rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:-translate-y-2:hover {
  --tw-translate-y: -0.5rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-\\[1\\.01\\]:hover {
  --tw-scale-x: 1.01;
  --tw-scale-y: 1.01;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:border-\\[\\#8B5CF6\\]\\/50:hover {
  border-color: rgb(139 92 246 / 0.5);
}

.hover\\:bg-white\\/10:hover {
  background-color: rgb(255 255 255 / 0.1);
}

.hover\\:text-white:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:shadow-\\[0_0_15px_rgba\\(139\\2c 92\\2c 246\\2c 0\\.2\\)\\]:hover {
  --tw-shadow: 0 0 15px rgba(139,92,246,0.2);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.group:hover .group-hover\\:border-\\[\\#8B5CF6\\] {
  --tw-border-opacity: 1;
  border-color: rgb(139 92 246 / var(--tw-border-opacity, 1));
}

.group:hover .group-hover\\:bg-\\[\\#8B5CF6\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(139 92 246 / var(--tw-bg-opacity, 1));
}

.group:hover .group-hover\\:from-\\[\\#22D3EE\\]\\/40 {
  --tw-gradient-from: rgb(34 211 238 / 0.4) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(34 211 238 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.group:hover .group-hover\\:from-\\[\\#8B5CF6\\]\\/40 {
  --tw-gradient-from: rgb(139 92 246 / 0.4) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(139 92 246 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.group:hover .group-hover\\:from-\\[\\#FFFBEB\\]\\/40 {
  --tw-gradient-from: rgb(255 251 235 / 0.4) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 251 235 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.group:hover .group-hover\\:text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\\:shadow-\\[0_0_10px_\\#8B5CF6\\] {
  --tw-shadow: 0 0 10px #8B5CF6;
  --tw-shadow-colored: 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.group:hover .group-hover\\:shadow-\\[0_0_8px_\\#8B5CF6\\] {
  --tw-shadow: 0 0 8px #8B5CF6;
  --tw-shadow-colored: 0 0 8px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-12 {
    margin-top: 3rem;
  }

  .md\\:h-10 {
    height: 2.5rem;
  }

  .md\\:h-14 {
    height: 3.5rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:w-10 {
    width: 2.5rem;
  }

  .md\\:w-14 {
    width: 3.5rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-\\[13px\\] {
    font-size: 13px;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .md\\:text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}
`;
export function composeSpace(_p) { return `<div class="min-h-screen bg-[#080B1A] text-white font-sans overflow-x-hidden flex flex-col items-center pb-20 relative selection:bg-[#F472B6] selection:text-white"><div class="absolute inset-0 overflow-hidden pointer-events-none"><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.3881191139672637px] [height:2.871351396613689px] [top:79.95839993260765%] [left:80.73123470497056%] [animation-duration:4.325610801874662s] [animation-delay:1.556015848961388s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.3567733310497792px] [height:3.5217498303689903px] [top:48.30119405646285%] [left:6.338799414520624%] [animation-duration:4.654675779924882s] [animation-delay:1.5750516973644038s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.2089924027238794px] [height:1.6795958362843255px] [top:54.31663796000446%] [left:49.36832594981123%] [animation-duration:2.338945841183303s] [animation-delay:0.428667463010461s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.583729150206776px] [height:1.9178692975922096px] [top:73.36203922419139%] [left:88.45997341233746%] [animation-duration:3.528268900348272s] [animation-delay:0.4575469389283331s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.4870504916479952px] [height:1.3126274101817599px] [top:83.27114385067219%] [left:56.894414975630326%] [animation-duration:4.610357442521332s] [animation-delay:1.6872212424292345s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.3867765555278844px] [height:3.0196638808766427px] [top:51.300426694129%] [left:36.36327491252354%] [animation-duration:3.6113508446953926s] [animation-delay:1.3131427671473526s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.985817410803156px] [height:3.5201091978216317px] [top:11.302805725872467%] [left:20.83335451034979%] [animation-duration:2.117949021513481s] [animation-delay:0.5338038027251353s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.5520745606646056px] [height:1.102646135495219px] [top:54.49620132097364%] [left:15.654996677575783%] [animation-duration:4.013053488286674s] [animation-delay:1.7499954621117977s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.9983926696075365px] [height:3.285327889659557px] [top:18.036114436708818%] [left:36.15060168899515%] [animation-duration:2.734713576697604s] [animation-delay:1.175381682468653s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.5075992816512924px] [height:1.927304841208438px] [top:74.49611837726286%] [left:71.058723361569%] [animation-duration:3.1445912600084522s] [animation-delay:1.8586622263556993s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.2913266281169533px] [height:3.916042601131659px] [top:51.12007701030752%] [left:39.73233172501719%] [animation-duration:2.7532720186697515s] [animation-delay:0.8278656255180776s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.1834809884235886px] [height:1.240060353863717px] [top:38.088469888444955%] [left:70.74159949218195%] [animation-duration:4.271530705993455s] [animation-delay:1.0402086340698768s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.9354291328489097px] [height:1.7570812402219418px] [top:99.1620137240954%] [left:20.49713909731059%] [animation-duration:3.032736676075613s] [animation-delay:0.09741460865256824s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.412443957247938px] [height:1.8495615969321892px] [top:67.95771853670013%] [left:61.47245750050568%] [animation-duration:3.673715864640929s] [animation-delay:0.8570026135585078s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.130289881190324px] [height:3.313174213773374px] [top:29.078380834749307%] [left:0.10923652452090593%] [animation-duration:2.966721570494186s] [animation-delay:0.7812345341962339s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.9748344390577035px] [height:2.4608581748211864px] [top:47.324022496170734%] [left:52.31268367219997%] [animation-duration:2.9813339897868296s] [animation-delay:1.672516553703558s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.874529117088461px] [height:2.7750975769920947px] [top:45.52479678239904%] [left:20.500970069932535%] [animation-duration:3.515395318351259s] [animation-delay:0.5451548823490009s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.2620521440102137px] [height:2.1289254848794767px] [top:63.94964787234228%] [left:78.3787428765926%] [animation-duration:2.8843244953873066s] [animation-delay:0.040565941707361386s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.7394959962939192px] [height:3.4203447540385485px] [top:24.154244812913394%] [left:96.12266538054797%] [animation-duration:4.704636289230879s] [animation-delay:1.1007520567660467s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.3205833411709413px] [height:2.911956793725009px] [top:78.80580918347243%] [left:86.08494018981749%] [animation-duration:3.09382554130711s] [animation-delay:1.0888581522285397s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.7214954670514184px] [height:1.262015800019347px] [top:16.699149677150547%] [left:36.76895233063604%] [animation-duration:2.859492705930293s] [animation-delay:0.322205129824102s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.4213803310765096px] [height:3.243756005816792px] [top:81.54701629834793%] [left:55.43501186921686%] [animation-duration:2.6131220938041992s] [animation-delay:1.7336202080062622s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.8619342025352763px] [height:3.142036144118796px] [top:39.39564561353498%] [left:85.12464682986588%] [animation-duration:4.232536331843289s] [animation-delay:1.661418163105197s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.588370393222241px] [height:1.8411650392173189px] [top:21.71244548243062%] [left:11.134173935956248%] [animation-duration:4.091859962284925s] [animation-delay:1.8342183603192275s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.425159230815037px] [height:1.7166558454033156px] [top:27.41375294320293%] [left:7.637654955111984%] [animation-duration:3.6938117478785557s] [animation-delay:0.8680270525187141s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.450905300179886px] [height:1.9128281442580906px] [top:4.9406557766681125%] [left:24.403160367808553%] [animation-duration:3.3649112487105883s] [animation-delay:1.5975805752815528s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.472655855745105px] [height:1.4044644682922836px] [top:20.673625752078063%] [left:69.88040290183619%] [animation-duration:4.736197877051587s] [animation-delay:0.532901660848911s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.4431180534751822px] [height:2.3572060349200106px] [top:17.504072083643006%] [left:84.89782336871728%] [animation-duration:4.034661623283027s] [animation-delay:1.4410314404709352s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.0155610018679173px] [height:2.6821780529159787px] [top:85.63706709775757%] [left:4.672705834793767%] [animation-duration:3.8510780821023025s] [animation-delay:1.2133059420666856s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.363126138471153px] [height:3.6525561278223506px] [top:49.02547389391538%] [left:13.09307939920683%] [animation-duration:4.466430252751696s] [animation-delay:1.4077913864340301s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.8167207241849628px] [height:3.594414686072395px] [top:67.88059219163269%] [left:4.313747420503489%] [animation-duration:3.7839345254227137s] [animation-delay:1.8381186049567182s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.42511056386294px] [height:2.634481852064157px] [top:35.15520760393015%] [left:26.77189737652953%] [animation-duration:3.0575526717095975s] [animation-delay:1.239927972724928s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.646956014814709px] [height:1.4782636084978291px] [top:75.46227099814581%] [left:60.31803663171812%] [animation-duration:2.0658575272985726s] [animation-delay:1.654587603323824s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.376573872120715px] [height:2.471258582077497px] [top:49.06323689147629%] [left:81.91577338968511%] [animation-duration:4.797479340811473s] [animation-delay:1.984430022971915s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.626758514843437px] [height:2.7973192093482524px] [top:86.933388268342%] [left:1.6094166089509643%] [animation-duration:2.195370808571487s] [animation-delay:0.7830216632148388s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.1199305515925015px] [height:2.366565646381078px] [top:15.366212112429778%] [left:24.803737613415567%] [animation-duration:2.884271502224121s] [animation-delay:0.45482177158345793s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.803850611251749px] [height:3.3904896766591346px] [top:75.02497440424645%] [left:34.69634543349643%] [animation-duration:3.761260747957285s] [animation-delay:1.2994965059132182s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.2010657478766296px] [height:1.079080600709315px] [top:54.12106696054034%] [left:13.115207899075799%] [animation-duration:2.5873636570595266s] [animation-delay:1.401722546118761s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.671540832635498px] [height:1.86920332154809px] [top:67.5594389427379%] [left:4.974996124715991%] [animation-duration:4.648247009004947s] [animation-delay:1.3339363288461048s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.5124673473142187px] [height:3.9878992960784982px] [top:26.54003618875267%] [left:25.171820426653657%] [animation-duration:3.1428790481625968s] [animation-delay:1.5518389492863274s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.5072043704670834px] [height:3.229042887755779px] [top:35.786636606592445%] [left:28.562157529080256%] [animation-duration:4.2478579061251684s] [animation-delay:0.063473204328099s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.0311956021043072px] [height:3.62743069910472px] [top:59.37673323478169%] [left:43.43654070794424%] [animation-duration:2.6575371356699726s] [animation-delay:1.3332149524844052s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.4427157651097717px] [height:1.0015781902153043px] [top:84.54376327473442%] [left:28.118490578694498%] [animation-duration:2.3106990523877133s] [animation-delay:1.539630393008044s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.6332444213703603px] [height:1.4184345652845691px] [top:66.95598242079882%] [left:39.19005292657367%] [animation-duration:3.6993856195881163s] [animation-delay:0.2556013528345924s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.612936406576241px] [height:3.378235380142824px] [top:75.76971264219114%] [left:82.97997557164213%] [animation-duration:2.7547198843819487s] [animation-delay:0.09174502144417773s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.1338978325942262px] [height:2.4780574680677407px] [top:92.18726201675358%] [left:17.409933723314307%] [animation-duration:2.1543018961863103s] [animation-delay:1.9254805799419603s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.684232116134324px] [height:3.12648567910069px] [top:40.47130930718593%] [left:64.9195448341581%] [animation-duration:4.3008072337306364s] [animation-delay:1.9723543978478715s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.1217626836539702px] [height:1.3972915710883775px] [top:67.29927279967961%] [left:40.14584926331679%] [animation-duration:4.3550117106966795s] [animation-delay:0.02080349732882536s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.7655770739705758px] [height:2.729813991316699px] [top:47.81378354732413%] [left:35.222398136508396%] [animation-duration:2.623485604242766s] [animation-delay:1.036654517932085s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.5138457794913722px] [height:3.5297821031441683px] [top:73.17439682737049%] [left:34.578323046676815%] [animation-duration:4.446346142750217s] [animation-delay:0.7346105877154399s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:3.8367463570454508px] [height:2.361457209724242px] [top:72.07596833455682%] [left:41.68839714656718%] [animation-duration:2.448525573929836s] [animation-delay:1.9141389281275483s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.9831649847978832px] [height:3.4062811578419323px] [top:92.98440989249893%] [left:34.004700565197886%] [animation-duration:2.241224358177143s] [animation-delay:1.407861708751476s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.923987278990169px] [height:2.8459268192939393px] [top:12.434964027936058%] [left:1.0902575487316324%] [animation-duration:3.458014113581469s] [animation-delay:0.10076492901488199s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.5592295873036357px] [height:3.2832070048924664px] [top:35.24359249906044%] [left:10.998185138986106%] [animation-duration:2.6361546814838666s] [animation-delay:1.4641116601925013s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.320200352869293px] [height:1.5267745863672177px] [top:97.26154460321686%] [left:28.4472414237673%] [animation-duration:3.7619445019054423s] [animation-delay:1.6740923960462948s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.409540290241924px] [height:2.823174228526658px] [top:5.866116238578223%] [left:5.481948985758811%] [animation-duration:3.1626816168153673s] [animation-delay:0.07742737694003532s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.2567754171041334px] [height:3.806653452010974px] [top:63.9694773976856%] [left:81.02997031289102%] [animation-duration:4.505062288000989s] [animation-delay:1.1596498855105424s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:1.2286434431766562px] [height:2.8852846865583506px] [top:46.21520520741236%] [left:87.71450067103864%] [animation-duration:4.99030975785458s] [animation-delay:0.9878747276866111s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.106238097111836px] [height:3.828156131103351px] [top:49.63799056956743%] [left:82.45254831635035%] [animation-duration:2.7941182186821782s] [animation-delay:0.754368435621376s]"></div><div class="absolute bg-white rounded-full opacity-60 animate-pulse [width:2.8520596052416676px] [height:3.835962111759816px] [top:33.44923077313734%] [left:18.83947244528963%] [animation-duration:4.27170208314226s] [animation-delay:0.16124639318606193s]"></div></div><div class="relative z-10 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-5xl animate-pulse [animation-duration:3s]">🌌</span><h1 class="text-4xl md:text-6xl text-white font-black tracking-widest drop-shadow-md [font-family:'Orbitron',_sans-serif] [text-shadow:0_0_20px_#8B5CF6]">GALACTIC RANKINGS</h1><span class="text-4xl md:text-5xl animate-pulse [animation-duration:3s] [animation-delay:1.5s]">🌌</span></div><p class="text-[#F472B6] text-xl md:text-2xl font-bold tracking-wider mt-2 mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [font-family:'Orbitron',_sans-serif]">🚀 Shoot for the stars!</p><div class="flex gap-2 bg-[#1E1B4B]/80 p-1.5 rounded-full border border-[#8B5CF6]/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-sm"><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/70 hover:text-white hover:bg-white/10 [font-family:'Orbitron',_sans-serif]">HOURLY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all bg-[#8B5CF6] text-white shadow-[0_0_15px_#8B5CF6] scale-105 [font-family:'Orbitron',_sans-serif]">TODAY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/70 hover:text-white hover:bg-white/10 [font-family:'Orbitron',_sans-serif]">ALL TIME</button></div></div><div class="max-w-4xl w-full px-4 mt-8 md:mt-12 flex flex-col items-center relative z-10"><div data-top3=""></div><div data-rows=""></div><div class="mt-16 mb-8 flex flex-col items-center gap-3"><div class="text-[#8B5CF6] animate-[pulse_2s_ease-in-out_infinite] text-2xl">✨</div><p class="text-[#8B5CF6] text-sm md:text-base tracking-widest text-center [font-family:'Orbitron',_sans-serif]">🌌 Live from the Galaxy · Keep Playing! 🌌</p><div class="text-[#8B5CF6] animate-[pulse_2s_ease-in-out_infinite] text-2xl delay-500">✨</div></div></div></div>`; }
const TROPICAL_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-2 {
  left: -0.5rem;
}

.-left-3 {
  left: -0.75rem;
}

.-right-2 {
  right: -0.5rem;
}

.-right-3 {
  right: -0.75rem;
}

.-top-2 {
  top: -0.5rem;
}

.-top-3 {
  top: -0.75rem;
}

.-top-4 {
  top: -1rem;
}

.z-0 {
  z-index: 0;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.z-\\[-1\\] {
  z-index: -1;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.-mt-3 {
  margin-top: -0.75rem;
}

.-mt-4 {
  margin-top: -1rem;
}

.-mt-6 {
  margin-top: -1.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-1\\/3 {
  width: 33.333333%;
}

.w-10 {
  width: 2.5rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-20 {
  width: 5rem;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-\\[spin_4s_linear_infinite\\] {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-\\[spin_4s_linear_infinite_reverse\\] {
  animation: spin 4s linear infinite reverse;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-b-2xl {
  border-bottom-right-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

.rounded-b-3xl {
  border-bottom-right-radius: 1.5rem;
  border-bottom-left-radius: 1.5rem;
}

.rounded-b-\\[16px\\] {
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 16px;
}

.rounded-b-\\[20px\\] {
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
}

.rounded-b-\\[24px\\] {
  border-bottom-right-radius: 24px;
  border-bottom-left-radius: 24px;
}

.rounded-t-full {
  border-top-left-radius: 9999px;
  border-top-right-radius: 9999px;
}

.border-2 {
  border-width: 2px;
}

.border-4 {
  border-width: 4px;
}

.border-x-4 {
  border-left-width: 4px;
  border-right-width: 4px;
}

.border-b-4 {
  border-bottom-width: 4px;
}

.border-l-4 {
  border-left-width: 4px;
}

.border-\\[\\#00D4AA\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 212 170 / var(--tw-border-opacity, 1));
}

.border-\\[\\#00D4AA\\]\\/50 {
  border-color: rgb(0 212 170 / 0.5);
}

.border-\\[\\#134E4A\\] {
  --tw-border-opacity: 1;
  border-color: rgb(19 78 74 / var(--tw-border-opacity, 1));
}

.border-\\[\\#881337\\] {
  --tw-border-opacity: 1;
  border-color: rgb(136 19 55 / var(--tw-border-opacity, 1));
}

.border-\\[\\#B45309\\] {
  --tw-border-opacity: 1;
  border-color: rgb(180 83 9 / var(--tw-border-opacity, 1));
}

.border-\\[\\#E11D48\\] {
  --tw-border-opacity: 1;
  border-color: rgb(225 29 72 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FF6B6B\\] {
  --tw-border-opacity: 1;
  border-color: rgb(255 107 107 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FF6B6B\\]\\/50 {
  border-color: rgb(255 107 107 / 0.5);
}

.border-\\[\\#FFE66D\\]\\/80 {
  border-color: rgb(255 230 109 / 0.8);
}

.border-white\\/20 {
  border-color: rgb(255 255 255 / 0.2);
}

.border-white\\/40 {
  border-color: rgb(255 255 255 / 0.4);
}

.bg-\\[\\#00D4AA\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 212 170 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF6B6B\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 107 107 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF6B6B\\]\\/40 {
  background-color: rgb(255 107 107 / 0.4);
}

.bg-\\[\\#FFE66D\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 230 109 / var(--tw-bg-opacity, 1));
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-white\\/20 {
  background-color: rgb(255 255 255 / 0.2);
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.from-\\[\\#00D4AA\\] {
  --tw-gradient-from: #00D4AA var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 212 170 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#0D9488\\] {
  --tw-gradient-from: #0D9488 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(13 148 136 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#E11D48\\] {
  --tw-gradient-from: #E11D48 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(225 29 72 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#F59E0B\\] {
  --tw-gradient-from: #F59E0B var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(245 158 11 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF6B35\\] {
  --tw-gradient-from: #FF6B35 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 107 53 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF6B35\\]\\/80 {
  --tw-gradient-from: rgb(255 107 53 / 0.8) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 107 53 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF6B6B\\] {
  --tw-gradient-from: #FF6B6B var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 107 107 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FFE66D\\] {
  --tw-gradient-from: #FFE66D var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 230 109 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#0D7377\\] {
  --tw-gradient-to: #0D7377 var(--tw-gradient-to-position);
}

.to-\\[\\#0D9488\\] {
  --tw-gradient-to: #0D9488 var(--tw-gradient-to-position);
}

.to-\\[\\#115E59\\] {
  --tw-gradient-to: #115E59 var(--tw-gradient-to-position);
}

.to-\\[\\#9F1239\\] {
  --tw-gradient-to: #9F1239 var(--tw-gradient-to-position);
}

.to-\\[\\#D97706\\] {
  --tw-gradient-to: #D97706 var(--tw-gradient-to-position);
}

.to-\\[\\#E11D48\\] {
  --tw-gradient-to: #E11D48 var(--tw-gradient-to-position);
}

.to-\\[\\#FBBF24\\] {
  --tw-gradient-to: #FBBF24 var(--tw-gradient-to-position);
}

.to-\\[\\#FF6B6B\\]\\/80 {
  --tw-gradient-to: rgb(255 107 107 / 0.8) var(--tw-gradient-to-position);
}

.bg-repeat {
  background-repeat: repeat;
}

.p-1\\.5 {
  padding: 0.375rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.pt-3 {
  padding-top: 0.75rem;
}

.pt-4 {
  padding-top: 1rem;
}

.pt-6 {
  padding-top: 1.5rem;
}

.text-center {
  text-align: center;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.text-\\[\\#00D4AA\\] {
  --tw-text-opacity: 1;
  color: rgb(0 212 170 / var(--tw-text-opacity, 1));
}

.text-\\[\\#0D9488\\] {
  --tw-text-opacity: 1;
  color: rgb(13 148 136 / var(--tw-text-opacity, 1));
}

.text-\\[\\#92400E\\] {
  --tw-text-opacity: 1;
  color: rgb(146 64 14 / var(--tw-text-opacity, 1));
}

.text-\\[\\#D97706\\] {
  --tw-text-opacity: 1;
  color: rgb(217 119 6 / var(--tw-text-opacity, 1));
}

.text-\\[\\#E11D48\\] {
  --tw-text-opacity: 1;
  color: rgb(225 29 72 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FEF08A\\] {
  --tw-text-opacity: 1;
  color: rgb(254 240 138 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFB4B4\\] {
  --tw-text-opacity: 1;
  color: rgb(255 180 180 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FFE66D\\] {
  --tw-text-opacity: 1;
  color: rgb(255 230 109 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-white\\/80 {
  color: rgb(255 255 255 / 0.8);
}

.text-white\\/90 {
  color: rgb(255 255 255 / 0.9);
}

.opacity-10 {
  opacity: 0.1;
}

.opacity-40 {
  opacity: 0.4;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow-2xl {
  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(0\\2c 212\\2c 170\\2c 0\\.6\\)\\] {
  --tw-shadow: 0 0 15px rgba(0,212,170,0.6);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_20px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.3\\)\\] {
  --tw-shadow: 0 10px 20px rgba(0,0,0,0.3);
  --tw-shadow-colored: 0 10px 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_15px_30px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 15px 30px rgba(0,0,0,0.4);
  --tw-shadow-colored: 0 15px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_2px_4px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.4\\)\\] {
  --tw-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
  --tw-shadow-colored: inset 0 2px 4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.1\\)\\] {
  --tw-shadow: inset 0 4px 10px rgba(0,0,0,0.1);
  --tw-shadow-colored: inset 0 4px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-inner {
  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-md {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-black\\/30 {
  --tw-shadow-color: rgb(0 0 0 / 0.3);
  --tw-shadow: var(--tw-shadow-colored);
}

.blur-\\[40px\\] {
  --tw-blur: blur(40px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_2px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.3\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-lg {
  --tw-drop-shadow: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-md {
  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4s\\] {
  animation-duration: 4s;
}

.\\[background-image\\:url\\(\\'data\\:image\\/svg\\+xml\\;base64\\2c PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI\\+PHBhdGggZD0iTTAgMjBxMTAgMTAgMjAgMHExMC0xMCAyMCAwaDB2MjBIMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4\\=\\'\\)\\] {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBxMTAgMTAgMjAgMHExMC0xMCAyMCAwaDB2MjBIMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=');
}

.\\[font-family\\:\\'Inter\\'\\2c _sans-serif\\] {
  font-family: 'Inter', sans-serif;
}

.\\[font-family\\:\\'Pacifico\\'\\2c _cursive\\] {
  font-family: 'Pacifico', cursive;
}

.\\[text-shadow\\:3px_3px_0_\\#FF6B6B\\] {
  text-shadow: 3px 3px 0 #FF6B6B;
}

.selection\\:bg-\\[\\#00D4AA\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 212 170 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#00D4AA\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 212 170 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#00D4AA\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 212 170 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#00D4AA\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 212 170 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-\\[1\\.01\\]:hover {
  --tw-scale-x: 1.01;
  --tw-scale-y: 1.01;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:bg-white\\/20:hover {
  background-color: rgb(255 255 255 / 0.2);
}

.hover\\:text-white:hover {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-16 {
    margin-top: 4rem;
  }

  .md\\:h-12 {
    height: 3rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-28 {
    height: 7rem;
  }

  .md\\:w-12 {
    width: 3rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-28 {
    width: 7rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
`;
export function composeTropical(_p) { return `<div class="min-h-screen bg-gradient-to-b from-[#FF6B35] to-[#0D7377] text-white font-sans overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#00D4AA] selection:text-white"><div class="w-full relative shadow-2xl shadow-black/30 border-b-4 border-[#00D4AA] bg-gradient-to-r from-[#FF6B35]/80 to-[#FF6B6B]/80 backdrop-blur-md"><div class="absolute inset-0 opacity-10 [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBxMTAgMTAgMjAgMHExMC0xMCAyMCAwaDB2MjBIMHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat pointer-events-none"></div><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-6xl animate-bounce">🌴</span><h1 class="text-5xl md:text-7xl tracking-wide text-white drop-shadow-md [font-family:'Pacifico',_cursive] [text-shadow:3px_3px_0_#FF6B6B]">BIG WINNERS</h1><span class="text-4xl md:text-6xl animate-bounce [animation-delay:0.2s]">🌴</span></div><p class="text-white/90 text-xl md:text-2xl tracking-wider mt-4 mb-8 drop-shadow-md [font-family:'Pacifico',_cursive]">🌊 Ride the wave to the top! 🌊</p><div class="flex gap-2 bg-[#FF6B6B]/40 p-1.5 rounded-full border-2 border-[#00D4AA]/50 shadow-inner backdrop-blur-sm"><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/80 hover:text-white hover:bg-white/20 [font-family:'Inter',_sans-serif]">HOURLY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all bg-[#00D4AA] text-white shadow-[0_0_15px_rgba(0,212,170,0.6)] scale-105 [font-family:'Inter',_sans-serif]">TODAY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-white/80 hover:text-white hover:bg-white/20 [font-family:'Inter',_sans-serif]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-12 md:mt-16 flex flex-col items-center"><div data-top3=""></div><div data-rows=""></div><div class="mt-12 mb-8 text-center"><p class="text-white text-xl md:text-2xl tracking-wide animate-pulse [font-family:'Pacifico',_cursive]">🌺 Updated Live · Keep Spinning! 🌺</p></div></div></div>`; }
const UNDERWATER_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-2 {
  left: -0.5rem;
}

.-right-3 {
  right: -0.75rem;
}

.-top-2 {
  top: -0.5rem;
}

.-top-3 {
  top: -0.75rem;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-1\\/3 {
  width: 33.333333%;
}

.w-10 {
  width: 2.5rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-20 {
  width: 5rem;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-b-lg {
  border-bottom-right-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.rounded-b-xl {
  border-bottom-right-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}

.rounded-t-2xl {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-x-2 {
  border-left-width: 2px;
  border-right-width: 2px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-l-4 {
  border-left-width: 4px;
}

.border-\\[\\#00E5FF\\] {
  --tw-border-opacity: 1;
  border-color: rgb(0 229 255 / var(--tw-border-opacity, 1));
}

.border-\\[\\#00E5FF\\]\\/20 {
  border-color: rgb(0 229 255 / 0.2);
}

.border-\\[\\#00E5FF\\]\\/40 {
  border-color: rgb(0 229 255 / 0.4);
}

.border-\\[\\#00E5FF\\]\\/50 {
  border-color: rgb(0 229 255 / 0.5);
}

.border-\\[\\#39FF9C\\] {
  --tw-border-opacity: 1;
  border-color: rgb(57 255 156 / var(--tw-border-opacity, 1));
}

.border-\\[\\#39FF9C\\]\\/50 {
  border-color: rgb(57 255 156 / 0.5);
}

.border-\\[\\#FF6B9D\\] {
  --tw-border-opacity: 1;
  border-color: rgb(255 107 157 / var(--tw-border-opacity, 1));
}

.border-\\[\\#FF6B9D\\]\\/50 {
  border-color: rgb(255 107 157 / 0.5);
}

.border-\\[\\#FF6B9D\\]\\/60 {
  border-color: rgb(255 107 157 / 0.6);
}

.bg-\\[\\#001824\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 24 36 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#001824\\]\\/80 {
  background-color: rgb(0 24 36 / 0.8);
}

.bg-\\[\\#001F2D\\]\\/80 {
  background-color: rgb(0 31 45 / 0.8);
}

.bg-\\[\\#001F2D\\]\\/90 {
  background-color: rgb(0 31 45 / 0.9);
}

.bg-\\[\\#00E5FF\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(0 229 255 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#0D0D2B\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(13 13 43 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FF6B9D\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 107 157 / var(--tw-bg-opacity, 1));
}

.bg-cyan-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(34 211 238 / var(--tw-bg-opacity, 1));
}

.bg-transparent {
  background-color: transparent;
}

.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.bg-gradient-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}

.from-\\[\\#003344\\] {
  --tw-gradient-from: #003344 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 51 68 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#00E5FF\\]\\/20 {
  --tw-gradient-from: rgb(0 229 255 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 229 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#00E5FF\\]\\/5 {
  --tw-gradient-from: rgb(0 229 255 / 0.05) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 229 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#39FF9C\\]\\/20 {
  --tw-gradient-from: rgb(57 255 156 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(57 255 156 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#FF6B9D\\]\\/20 {
  --tw-gradient-from: rgb(255 107 157 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 107 157 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#0D0D2B\\] {
  --tw-gradient-to: #0D0D2B var(--tw-gradient-to-position);
}

.to-transparent {
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
}

.p-1\\.5 {
  padding: 0.375rem;
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.text-center {
  text-align: center;
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.text-\\[\\#001824\\] {
  --tw-text-opacity: 1;
  color: rgb(0 24 36 / var(--tw-text-opacity, 1));
}

.text-\\[\\#00E5FF\\] {
  --tw-text-opacity: 1;
  color: rgb(0 229 255 / var(--tw-text-opacity, 1));
}

.text-\\[\\#00E5FF\\]\\/70 {
  color: rgb(0 229 255 / 0.7);
}

.text-\\[\\#00E5FF\\]\\/90 {
  color: rgb(0 229 255 / 0.9);
}

.text-\\[\\#39FF9C\\] {
  --tw-text-opacity: 1;
  color: rgb(57 255 156 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FF6B9D\\] {
  --tw-text-opacity: 1;
  color: rgb(255 107 157 / var(--tw-text-opacity, 1));
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-white\\/90 {
  color: rgb(255 255 255 / 0.9);
}

.opacity-0 {
  opacity: 0;
}

.opacity-30 {
  opacity: 0.3;
}

.opacity-80 {
  opacity: 0.8;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow-\\[0_0_10px_inset_\\#00E5FF\\] {
  --tw-shadow: 0 0 10px inset #00E5FF;
  --tw-shadow-colored: inset 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_\\#00E5FF\\] {
  --tw-shadow: 0 0 15px #00E5FF;
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_inset_\\#00E5FF\\] {
  --tw-shadow: 0 0 15px inset #00E5FF;
  --tw-shadow-colored: inset 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_inset_\\#39FF9C\\] {
  --tw-shadow: 0 0 15px inset #39FF9C;
  --tw-shadow-colored: inset 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_15px_rgba\\(0\\2c 229\\2c 255\\2c 0\\.2\\)\\] {
  --tw-shadow: 0 0 15px rgba(0,229,255,0.2);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_inset_\\#FF6B9D\\] {
  --tw-shadow: 0 0 20px inset #FF6B9D;
  --tw-shadow-colored: inset 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_rgba\\(0\\2c 229\\2c 255\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 0 20px rgba(0,229,255,0.4);
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_20px_rgba\\(57\\2c 255\\2c 156\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 0 20px rgba(57,255,156,0.4);
  --tw-shadow-colored: 0 0 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_30px_rgba\\(255\\2c 107\\2c 157\\2c 0\\.6\\)\\] {
  --tw-shadow: 0 0 30px rgba(255,107,157,0.6);
  --tw-shadow-colored: 0 0 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_30px_rgba\\(0\\2c 229\\2c 255\\2c 0\\.1\\)\\] {
  --tw-shadow: 0 10px 30px rgba(0,229,255,0.1);
  --tw-shadow-colored: 0 10px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_4px_15px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 4px 15px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 4px 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur-\\[50px\\] {
  --tw-blur: blur(50px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_\\#00E5FF\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px #00E5FF);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_\\#39FF9C\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px #39FF9C);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_\\#FF6B9D\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px #FF6B9D);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_10px_rgba\\(57\\2c 255\\2c 156\\2c 0\\.6\\)\\] {
  --tw-drop-shadow: drop-shadow(0 0 10px rgba(57,255,156,0.6));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_\\#00E5FF\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px #00E5FF);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_\\#39FF9C\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px #39FF9C);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_\\#FF6B9D\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px #FF6B9D);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_20px_\\#FF6B9D\\] {
  --tw-drop-shadow: drop-shadow(0 0 20px #FF6B9D);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_\\#00E5FF\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px #00E5FF);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_8px_\\#39FF9C\\] {
  --tw-drop-shadow: drop-shadow(0 0 8px #39FF9C);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-none {
  --tw-drop-shadow: drop-shadow(0 0 #0000);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[--max-opacity\\:0\\.15013815830877086\\] {
  --max-opacity: 0.15013815830877086;
}

.\\[--max-opacity\\:0\\.15273905897703746\\] {
  --max-opacity: 0.15273905897703746;
}

.\\[--max-opacity\\:0\\.1529449603789417\\] {
  --max-opacity: 0.1529449603789417;
}

.\\[--max-opacity\\:0\\.15877832659696497\\] {
  --max-opacity: 0.15877832659696497;
}

.\\[--max-opacity\\:0\\.1805509736283908\\] {
  --max-opacity: 0.1805509736283908;
}

.\\[--max-opacity\\:0\\.18092246215231808\\] {
  --max-opacity: 0.18092246215231808;
}

.\\[--max-opacity\\:0\\.19058179069276718\\] {
  --max-opacity: 0.19058179069276718;
}

.\\[--max-opacity\\:0\\.2093377287176159\\] {
  --max-opacity: 0.2093377287176159;
}

.\\[--max-opacity\\:0\\.21257611938001114\\] {
  --max-opacity: 0.21257611938001114;
}

.\\[--max-opacity\\:0\\.2157937986311067\\] {
  --max-opacity: 0.2157937986311067;
}

.\\[--max-opacity\\:0\\.2297770781693513\\] {
  --max-opacity: 0.2297770781693513;
}

.\\[--max-opacity\\:0\\.2527935909425225\\] {
  --max-opacity: 0.2527935909425225;
}

.\\[--max-opacity\\:0\\.27427645600069817\\] {
  --max-opacity: 0.27427645600069817;
}

.\\[--max-opacity\\:0\\.276942568682893\\] {
  --max-opacity: 0.276942568682893;
}

.\\[--max-opacity\\:0\\.28002799835640724\\] {
  --max-opacity: 0.28002799835640724;
}

.\\[animation-delay\\:0\\.0380781225413479s\\] {
  animation-delay: 0.0380781225413479s;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-delay\\:1\\.1142723093895845s\\] {
  animation-delay: 1.1142723093895845s;
}

.\\[animation-delay\\:1\\.125880306162768s\\] {
  animation-delay: 1.125880306162768s;
}

.\\[animation-delay\\:1\\.6734771598470415s\\] {
  animation-delay: 1.6734771598470415s;
}

.\\[animation-delay\\:2\\.6260564695781308s\\] {
  animation-delay: 2.6260564695781308s;
}

.\\[animation-delay\\:3\\.0008097624475427s\\] {
  animation-delay: 3.0008097624475427s;
}

.\\[animation-delay\\:3\\.041701346904418s\\] {
  animation-delay: 3.041701346904418s;
}

.\\[animation-delay\\:3\\.2413064003030367s\\] {
  animation-delay: 3.2413064003030367s;
}

.\\[animation-delay\\:3\\.7308571870670875s\\] {
  animation-delay: 3.7308571870670875s;
}

.\\[animation-delay\\:3\\.8149259450432966s\\] {
  animation-delay: 3.8149259450432966s;
}

.\\[animation-delay\\:4\\.313587675681026s\\] {
  animation-delay: 4.313587675681026s;
}

.\\[animation-delay\\:4\\.352478842754946s\\] {
  animation-delay: 4.352478842754946s;
}

.\\[animation-delay\\:4\\.359811825070141s\\] {
  animation-delay: 4.359811825070141s;
}

.\\[animation-delay\\:4\\.479529479890308s\\] {
  animation-delay: 4.479529479890308s;
}

.\\[animation-delay\\:4\\.686890047137881s\\] {
  animation-delay: 4.686890047137881s;
}

.\\[animation-duration\\:10\\.374164692464564s\\] {
  animation-duration: 10.374164692464564s;
}

.\\[animation-duration\\:11\\.318487103224944s\\] {
  animation-duration: 11.318487103224944s;
}

.\\[animation-duration\\:11\\.733357009678528s\\] {
  animation-duration: 11.733357009678528s;
}

.\\[animation-duration\\:13\\.631723154534203s\\] {
  animation-duration: 13.631723154534203s;
}

.\\[animation-duration\\:13\\.659112575235161s\\] {
  animation-duration: 13.659112575235161s;
}

.\\[animation-duration\\:3\\.036071219826662s\\] {
  animation-duration: 3.036071219826662s;
}

.\\[animation-duration\\:3\\.1353911939570587s\\] {
  animation-duration: 3.1353911939570587s;
}

.\\[animation-duration\\:3\\.1529050836130303s\\] {
  animation-duration: 3.1529050836130303s;
}

.\\[animation-duration\\:3\\.706031275653286s\\] {
  animation-duration: 3.706031275653286s;
}

.\\[animation-duration\\:3\\.9393595942687s\\] {
  animation-duration: 3.9393595942687s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4\\.326470512464105s\\] {
  animation-duration: 4.326470512464105s;
}

.\\[animation-duration\\:4\\.411126907415714s\\] {
  animation-duration: 4.411126907415714s;
}

.\\[animation-duration\\:4\\.500211498185095s\\] {
  animation-duration: 4.500211498185095s;
}

.\\[animation-duration\\:4\\.786203356513066s\\] {
  animation-duration: 4.786203356513066s;
}

.\\[animation-duration\\:4\\.994081662373665s\\] {
  animation-duration: 4.994081662373665s;
}

.\\[animation-duration\\:4s\\] {
  animation-duration: 4s;
}

.\\[animation-duration\\:5\\.187082346232282s\\] {
  animation-duration: 5.187082346232282s;
}

.\\[animation-duration\\:5\\.659243551612472s\\] {
  animation-duration: 5.659243551612472s;
}

.\\[animation-duration\\:5\\.866678504839264s\\] {
  animation-duration: 5.866678504839264s;
}

.\\[animation-duration\\:6\\.072142439653324s\\] {
  animation-duration: 6.072142439653324s;
}

.\\[animation-duration\\:6\\.270782387914117s\\] {
  animation-duration: 6.270782387914117s;
}

.\\[animation-duration\\:6\\.305810167226061s\\] {
  animation-duration: 6.305810167226061s;
}

.\\[animation-duration\\:6\\.815861577267102s\\] {
  animation-duration: 6.815861577267102s;
}

.\\[animation-duration\\:6\\.829556287617581s\\] {
  animation-duration: 6.829556287617581s;
}

.\\[animation-duration\\:7\\.412062551306572s\\] {
  animation-duration: 7.412062551306572s;
}

.\\[animation-duration\\:7\\.8787191885374s\\] {
  animation-duration: 7.8787191885374s;
}

.\\[animation-duration\\:8\\.65294102492821s\\] {
  animation-duration: 8.65294102492821s;
}

.\\[animation-duration\\:8\\.822253814831427s\\] {
  animation-duration: 8.822253814831427s;
}

.\\[animation-duration\\:9\\.00042299637019s\\] {
  animation-duration: 9.00042299637019s;
}

.\\[animation-duration\\:9\\.572406713026131s\\] {
  animation-duration: 9.572406713026131s;
}

.\\[animation-duration\\:9\\.98816332474733s\\] {
  animation-duration: 9.98816332474733s;
}

.\\[animation-iteration-count\\:infinite\\] {
  animation-iteration-count: infinite;
}

.\\[bottom\\:-0\\.007367607506649776\\%\\] {
  bottom: -0.007367607506649776%;
}

.\\[bottom\\:-0\\.20702668289196646\\%\\] {
  bottom: -0.20702668289196646%;
}

.\\[bottom\\:-0\\.7306877177746429\\%\\] {
  bottom: -0.7306877177746429%;
}

.\\[bottom\\:-10\\.515422761805446\\%\\] {
  bottom: -10.515422761805446%;
}

.\\[bottom\\:-10\\.61430192706947\\%\\] {
  bottom: -10.61430192706947%;
}

.\\[bottom\\:-14\\.576005326597068\\%\\] {
  bottom: -14.576005326597068%;
}

.\\[bottom\\:-16\\.00555158345489\\%\\] {
  bottom: -16.00555158345489%;
}

.\\[bottom\\:-17\\.690013493869728\\%\\] {
  bottom: -17.690013493869728%;
}

.\\[bottom\\:-17\\.95860630760402\\%\\] {
  bottom: -17.95860630760402%;
}

.\\[bottom\\:-19\\.074492474826112\\%\\] {
  bottom: -19.074492474826112%;
}

.\\[bottom\\:-3\\.8452601493151195\\%\\] {
  bottom: -3.8452601493151195%;
}

.\\[bottom\\:-5\\.041683895345357\\%\\] {
  bottom: -5.041683895345357%;
}

.\\[bottom\\:-5\\.560884407096096\\%\\] {
  bottom: -5.560884407096096%;
}

.\\[bottom\\:-5\\.649383841211042\\%\\] {
  bottom: -5.649383841211042%;
}

.\\[bottom\\:-9\\.15105926850708\\%\\] {
  bottom: -9.15105926850708%;
}

.\\[box-shadow\\:0_0_10px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.5\\)\\] {
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.\\[box-shadow\\:0_0_8px_rgba\\(0\\2c _229\\2c _255\\2c _0\\.4\\)\\] {
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
}

.\\[font-family\\:\\'Baloo_2\\'\\2c _cursive\\] {
  font-family: 'Baloo 2', cursive;
}

.\\[font-family\\:\\'Inter\\'\\2c _sans-serif\\] {
  font-family: 'Inter', sans-serif;
}

.\\[font-weight\\:600\\] {
  font-weight: 600;
}

.\\[font-weight\\:800\\] {
  font-weight: 800;
}

.\\[height\\:12\\.024142947329596px\\] {
  height: 12.024142947329596px;
}

.\\[height\\:15\\.476810642288507px\\] {
  height: 15.476810642288507px;
}

.\\[height\\:15\\.50584545612523px\\] {
  height: 15.50584545612523px;
}

.\\[height\\:15\\.98655297165047px\\] {
  height: 15.98655297165047px;
}

.\\[height\\:16\\.369400794837034px\\] {
  height: 16.369400794837034px;
}

.\\[height\\:16\\.752613216445678px\\] {
  height: 16.752613216445678px;
}

.\\[height\\:19\\.365980881501976px\\] {
  height: 19.365980881501976px;
}

.\\[height\\:19\\.74366129844619px\\] {
  height: 19.74366129844619px;
}

.\\[height\\:21\\.030136239178283px\\] {
  height: 21.030136239178283px;
}

.\\[height\\:21\\.52059460058555px\\] {
  height: 21.52059460058555px;
}

.\\[height\\:22\\.33337172913013px\\] {
  height: 22.33337172913013px;
}

.\\[height\\:23\\.438256457576728px\\] {
  height: 23.438256457576728px;
}

.\\[height\\:8\\.708047475289616px\\] {
  height: 8.708047475289616px;
}

.\\[height\\:8\\.898269910446942px\\] {
  height: 8.898269910446942px;
}

.\\[height\\:9\\.31145349942909px\\] {
  height: 9.31145349942909px;
}

.\\[left\\:1\\.998518866790977\\%\\] {
  left: 1.998518866790977%;
}

.\\[left\\:12\\.676658578464583\\%\\] {
  left: 12.676658578464583%;
}

.\\[left\\:24\\.60634868227487\\%\\] {
  left: 24.60634868227487%;
}

.\\[left\\:3\\.464440535855595\\%\\] {
  left: 3.464440535855595%;
}

.\\[left\\:33\\.64789683500417\\%\\] {
  left: 33.64789683500417%;
}

.\\[left\\:34\\.58213437915767\\%\\] {
  left: 34.58213437915767%;
}

.\\[left\\:53\\.613186457168695\\%\\] {
  left: 53.613186457168695%;
}

.\\[left\\:55\\.573211843033896\\%\\] {
  left: 55.573211843033896%;
}

.\\[left\\:65\\.46571924489903\\%\\] {
  left: 65.46571924489903%;
}

.\\[left\\:7\\.576186738282709\\%\\] {
  left: 7.576186738282709%;
}

.\\[left\\:7\\.760898052975196\\%\\] {
  left: 7.760898052975196%;
}

.\\[left\\:75\\.09134405324114\\%\\] {
  left: 75.09134405324114%;
}

.\\[left\\:80\\.08494748067349\\%\\] {
  left: 80.08494748067349%;
}

.\\[left\\:86\\.95571622063886\\%\\] {
  left: 86.95571622063886%;
}

.\\[left\\:92\\.92994773494426\\%\\] {
  left: 92.92994773494426%;
}

.\\[opacity\\:0\\.050138158308770865\\] {
  opacity: 0.050138158308770865;
}

.\\[opacity\\:0\\.05273905897703745\\] {
  opacity: 0.05273905897703745;
}

.\\[opacity\\:0\\.0529449603789417\\] {
  opacity: 0.0529449603789417;
}

.\\[opacity\\:0\\.05877832659696496\\] {
  opacity: 0.05877832659696496;
}

.\\[opacity\\:0\\.08055097362839078\\] {
  opacity: 0.08055097362839078;
}

.\\[opacity\\:0\\.08092246215231808\\] {
  opacity: 0.08092246215231808;
}

.\\[opacity\\:0\\.09058179069276717\\] {
  opacity: 0.09058179069276717;
}

.\\[opacity\\:0\\.10933772871761589\\] {
  opacity: 0.10933772871761589;
}

.\\[opacity\\:0\\.11257611938001112\\] {
  opacity: 0.11257611938001112;
}

.\\[opacity\\:0\\.1157937986311067\\] {
  opacity: 0.1157937986311067;
}

.\\[opacity\\:0\\.1297770781693513\\] {
  opacity: 0.1297770781693513;
}

.\\[opacity\\:0\\.15279359094252254\\] {
  opacity: 0.15279359094252254;
}

.\\[opacity\\:0\\.1742764560006982\\] {
  opacity: 0.1742764560006982;
}

.\\[opacity\\:0\\.176942568682893\\] {
  opacity: 0.176942568682893;
}

.\\[opacity\\:0\\.1800279983564072\\] {
  opacity: 0.1800279983564072;
}

.\\[text-shadow\\:0_0_10px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.5\\)\\] {
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.\\[text-shadow\\:0_0_20px_\\#00E5FF\\] {
  text-shadow: 0 0 20px #00E5FF;
}

.\\[transform\\:translateY\\(-1000px\\)\\] {
  transform: translateY(-1000px);
}

.\\[transition\\:transform_3\\.036071219826662s_linear\\] {
  transition: transform 3.036071219826662s linear;
}

.\\[transition\\:transform_3\\.1353911939570587s_linear\\] {
  transition: transform 3.1353911939570587s linear;
}

.\\[transition\\:transform_3\\.1529050836130303s_linear\\] {
  transition: transform 3.1529050836130303s linear;
}

.\\[transition\\:transform_3\\.706031275653286s_linear\\] {
  transition: transform 3.706031275653286s linear;
}

.\\[transition\\:transform_3\\.9393595942687s_linear\\] {
  transition: transform 3.9393595942687s linear;
}

.\\[transition\\:transform_4\\.326470512464105s_linear\\] {
  transition: transform 4.326470512464105s linear;
}

.\\[transition\\:transform_4\\.411126907415714s_linear\\] {
  transition: transform 4.411126907415714s linear;
}

.\\[transition\\:transform_4\\.500211498185095s_linear\\] {
  transition: transform 4.500211498185095s linear;
}

.\\[transition\\:transform_4\\.786203356513066s_linear\\] {
  transition: transform 4.786203356513066s linear;
}

.\\[transition\\:transform_4\\.994081662373665s_linear\\] {
  transition: transform 4.994081662373665s linear;
}

.\\[transition\\:transform_5\\.187082346232282s_linear\\] {
  transition: transform 5.187082346232282s linear;
}

.\\[transition\\:transform_5\\.659243551612472s_linear\\] {
  transition: transform 5.659243551612472s linear;
}

.\\[transition\\:transform_5\\.866678504839264s_linear\\] {
  transition: transform 5.866678504839264s linear;
}

.\\[transition\\:transform_6\\.815861577267102s_linear\\] {
  transition: transform 6.815861577267102s linear;
}

.\\[transition\\:transform_6\\.829556287617581s_linear\\] {
  transition: transform 6.829556287617581s linear;
}

.\\[width\\:12\\.024142947329596px\\] {
  width: 12.024142947329596px;
}

.\\[width\\:15\\.476810642288507px\\] {
  width: 15.476810642288507px;
}

.\\[width\\:15\\.50584545612523px\\] {
  width: 15.50584545612523px;
}

.\\[width\\:15\\.98655297165047px\\] {
  width: 15.98655297165047px;
}

.\\[width\\:16\\.369400794837034px\\] {
  width: 16.369400794837034px;
}

.\\[width\\:16\\.752613216445678px\\] {
  width: 16.752613216445678px;
}

.\\[width\\:19\\.365980881501976px\\] {
  width: 19.365980881501976px;
}

.\\[width\\:19\\.74366129844619px\\] {
  width: 19.74366129844619px;
}

.\\[width\\:21\\.030136239178283px\\] {
  width: 21.030136239178283px;
}

.\\[width\\:21\\.52059460058555px\\] {
  width: 21.52059460058555px;
}

.\\[width\\:22\\.33337172913013px\\] {
  width: 22.33337172913013px;
}

.\\[width\\:23\\.438256457576728px\\] {
  width: 23.438256457576728px;
}

.\\[width\\:8\\.708047475289616px\\] {
  width: 8.708047475289616px;
}

.\\[width\\:8\\.898269910446942px\\] {
  width: 8.898269910446942px;
}

.\\[width\\:9\\.31145349942909px\\] {
  width: 9.31145349942909px;
}

.selection\\:bg-\\[\\#00E5FF\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 229 255 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#00E5FF\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 229 255 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#0D0D2B\\] *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(13 13 43 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#0D0D2B\\] *::selection {
  --tw-text-opacity: 1;
  color: rgb(13 13 43 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#00E5FF\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 229 255 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#00E5FF\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(0 229 255 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#0D0D2B\\]::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(13 13 43 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#0D0D2B\\]::selection {
  --tw-text-opacity: 1;
  color: rgb(13 13 43 / var(--tw-text-opacity, 1));
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-\\[1\\.01\\]:hover {
  --tw-scale-x: 1.01;
  --tw-scale-y: 1.01;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:bg-\\[\\#00E5FF\\]\\/10:hover {
  background-color: rgb(0 229 255 / 0.1);
}

.hover\\:text-\\[\\#00E5FF\\]:hover {
  --tw-text-opacity: 1;
  color: rgb(0 229 255 / var(--tw-text-opacity, 1));
}

.hover\\:opacity-100:hover {
  opacity: 1;
}

.hover\\:shadow-\\[0_0_15px_rgba\\(0\\2c 229\\2c 255\\2c 0\\.2\\)\\]:hover {
  --tw-shadow: 0 0 15px rgba(0,229,255,0.2);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-16 {
    margin-top: 4rem;
  }

  .md\\:h-12 {
    height: 3rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-28 {
    height: 7rem;
  }

  .md\\:w-12 {
    width: 3rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-28 {
    width: 7rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}


          @keyframes rise {
            0% { transform: translateY(100px) scale(0.8); opacity: 0; }
            50% { opacity: var(--max-opacity); }
            100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
          }
          .bubble {
            animation: rise linear infinite;
          }
        `;
export function composeUnderwater(_p) { return `<div class="min-h-screen bg-gradient-to-b from-[#003344] to-[#0D0D2B] text-white font-sans overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#00E5FF] selection:text-[#0D0D2B] relative"><div class="absolute inset-0 overflow-hidden pointer-events-none"><div class="absolute rounded-full bg-white animate-pulse [left:75.09134405324114%] [bottom:-5.649383841211042%] [width:8.708047475289616px] [height:8.708047475289616px] [opacity:0.10933772871761589] [animation-duration:4.786203356513066s] [animation-delay:3.8149259450432966s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_4.786203356513066s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:24.60634868227487%] [bottom:-0.7306877177746429%] [width:23.438256457576728px] [height:23.438256457576728px] [opacity:0.08092246215231808] [animation-duration:3.9393595942687s] [animation-delay:3.041701346904418s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_3.9393595942687s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:55.573211843033896%] [bottom:-16.00555158345489%] [width:12.024142947329596px] [height:12.024142947329596px] [opacity:0.050138158308770865] [animation-duration:5.187082346232282s] [animation-delay:1.125880306162768s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_5.187082346232282s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:7.760898052975196%] [bottom:-9.15105926850708%] [width:8.898269910446942px] [height:8.898269910446942px] [opacity:0.05273905897703745] [animation-duration:3.1529050836130303s] [animation-delay:4.313587675681026s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_3.1529050836130303s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:92.92994773494426%] [bottom:-5.041683895345357%] [width:19.74366129844619px] [height:19.74366129844619px] [opacity:0.08055097362839078] [animation-duration:6.829556287617581s] [animation-delay:2.6260564695781308s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_6.829556287617581s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:1.998518866790977%] [bottom:-10.515422761805446%] [width:15.50584545612523px] [height:15.50584545612523px] [opacity:0.15279359094252254] [animation-duration:6.815861577267102s] [animation-delay:4.359811825070141s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_6.815861577267102s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:33.64789683500417%] [bottom:-17.690013493869728%] [width:19.365980881501976px] [height:19.365980881501976px] [opacity:0.09058179069276717] [animation-duration:3.036071219826662s] [animation-delay:4.352478842754946s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_3.036071219826662s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:7.576186738282709%] [bottom:-10.61430192706947%] [width:21.52059460058555px] [height:21.52059460058555px] [opacity:0.05877832659696496] [animation-duration:4.411126907415714s] [animation-delay:0.0380781225413479s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_4.411126907415714s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:53.613186457168695%] [bottom:-19.074492474826112%] [width:15.476810642288507px] [height:15.476810642288507px] [opacity:0.176942568682893] [animation-duration:4.994081662373665s] [animation-delay:4.686890047137881s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_4.994081662373665s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:80.08494748067349%] [bottom:-0.007367607506649776%] [width:22.33337172913013px] [height:22.33337172913013px] [opacity:0.0529449603789417] [animation-duration:5.659243551612472s] [animation-delay:3.0008097624475427s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_5.659243551612472s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:3.464440535855595%] [bottom:-17.95860630760402%] [width:21.030136239178283px] [height:21.030136239178283px] [opacity:0.1742764560006982] [animation-duration:4.500211498185095s] [animation-delay:3.7308571870670875s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_4.500211498185095s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:65.46571924489903%] [bottom:-14.576005326597068%] [width:15.98655297165047px] [height:15.98655297165047px] [opacity:0.1297770781693513] [animation-duration:3.1353911939570587s] [animation-delay:3.2413064003030367s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_3.1353911939570587s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:12.676658578464583%] [bottom:-0.20702668289196646%] [width:9.31145349942909px] [height:9.31145349942909px] [opacity:0.1157937986311067] [animation-duration:5.866678504839264s] [animation-delay:1.1142723093895845s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_5.866678504839264s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:86.95571622063886%] [bottom:-5.560884407096096%] [width:16.752613216445678px] [height:16.752613216445678px] [opacity:0.1800279983564072] [animation-duration:3.706031275653286s] [animation-delay:4.479529479890308s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_3.706031275653286s_linear]"></div><div class="absolute rounded-full bg-white animate-pulse [left:34.58213437915767%] [bottom:-3.8452601493151195%] [width:16.369400794837034px] [height:16.369400794837034px] [opacity:0.11257611938001112] [animation-duration:4.326470512464105s] [animation-delay:1.6734771598470415s] [animation-iteration-count:infinite] [box-shadow:0_0_10px_rgba(255,255,255,0.5)] [transform:translateY(-1000px)] [transition:transform_4.326470512464105s_linear]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:75.09134405324114%] [width:8.708047475289616px] [height:8.708047475289616px] [--max-opacity:0.2093377287176159] [animation-duration:9.572406713026131s] [animation-delay:3.8149259450432966s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:24.60634868227487%] [width:23.438256457576728px] [height:23.438256457576728px] [--max-opacity:0.18092246215231808] [animation-duration:7.8787191885374s] [animation-delay:3.041701346904418s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:55.573211843033896%] [width:12.024142947329596px] [height:12.024142947329596px] [--max-opacity:0.15013815830877086] [animation-duration:10.374164692464564s] [animation-delay:1.125880306162768s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:7.760898052975196%] [width:8.898269910446942px] [height:8.898269910446942px] [--max-opacity:0.15273905897703746] [animation-duration:6.305810167226061s] [animation-delay:4.313587675681026s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:92.92994773494426%] [width:19.74366129844619px] [height:19.74366129844619px] [--max-opacity:0.1805509736283908] [animation-duration:13.659112575235161s] [animation-delay:2.6260564695781308s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:1.998518866790977%] [width:15.50584545612523px] [height:15.50584545612523px] [--max-opacity:0.2527935909425225] [animation-duration:13.631723154534203s] [animation-delay:4.359811825070141s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:33.64789683500417%] [width:19.365980881501976px] [height:19.365980881501976px] [--max-opacity:0.19058179069276718] [animation-duration:6.072142439653324s] [animation-delay:4.352478842754946s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:7.576186738282709%] [width:21.52059460058555px] [height:21.52059460058555px] [--max-opacity:0.15877832659696497] [animation-duration:8.822253814831427s] [animation-delay:0.0380781225413479s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:53.613186457168695%] [width:15.476810642288507px] [height:15.476810642288507px] [--max-opacity:0.276942568682893] [animation-duration:9.98816332474733s] [animation-delay:4.686890047137881s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:80.08494748067349%] [width:22.33337172913013px] [height:22.33337172913013px] [--max-opacity:0.1529449603789417] [animation-duration:11.318487103224944s] [animation-delay:3.0008097624475427s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:3.464440535855595%] [width:21.030136239178283px] [height:21.030136239178283px] [--max-opacity:0.27427645600069817] [animation-duration:9.00042299637019s] [animation-delay:3.7308571870670875s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:65.46571924489903%] [width:15.98655297165047px] [height:15.98655297165047px] [--max-opacity:0.2297770781693513] [animation-duration:6.270782387914117s] [animation-delay:3.2413064003030367s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:12.676658578464583%] [width:9.31145349942909px] [height:9.31145349942909px] [--max-opacity:0.2157937986311067] [animation-duration:11.733357009678528s] [animation-delay:1.1142723093895845s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:86.95571622063886%] [width:16.752613216445678px] [height:16.752613216445678px] [--max-opacity:0.28002799835640724] [animation-duration:7.412062551306572s] [animation-delay:4.479529479890308s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div><div class="absolute rounded-full bg-cyan-400 bubble [left:34.58213437915767%] [width:16.369400794837034px] [height:16.369400794837034px] [--max-opacity:0.21257611938001114] [animation-duration:8.65294102492821s] [animation-delay:1.6734771598470415s] [box-shadow:0_0_8px_rgba(0,_229,_255,_0.4)]"></div></div><div class="w-full relative bg-transparent border-b border-[#00E5FF]/20 shadow-[0_10px_30px_rgba(0,229,255,0.1)]"><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-6xl animate-bounce">🫧</span><h1 class="text-4xl md:text-6xl tracking-wide text-[#00E5FF] [font-family:'Baloo_2',_cursive] [font-weight:800] [text-shadow:0_0_20px_#00E5FF]">DEEP SEA RANKINGS</h1><span class="text-4xl md:text-6xl animate-bounce [animation-delay:0.2s]">🫧</span></div><p class="text-[#39FF9C] text-xl md:text-2xl font-bold tracking-wider mt-2 mb-8 drop-shadow-[0_0_10px_rgba(57,255,156,0.6)] [font-family:'Baloo_2',_cursive]">🌊 Dive in and rise to the top! 🌊</p><div class="flex gap-2 bg-[#001824]/80 backdrop-blur-md p-1.5 rounded-full border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]"><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-[#00E5FF]/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 [font-family:'Baloo_2',_cursive]">HOURLY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all bg-[#00E5FF] text-[#001824] shadow-[0_0_15px_#00E5FF] scale-105 [font-family:'Baloo_2',_cursive]">TODAY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all text-[#00E5FF]/70 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 [font-family:'Baloo_2',_cursive]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-12 md:mt-16 flex flex-col items-center relative z-10"><div data-top3=""></div><div data-rows=""></div><div class="mt-12 mb-8 text-center"><p class="text-[#00E5FF] text-xl md:text-2xl tracking-wide animate-pulse drop-shadow-[0_0_10px_#00E5FF] [font-family:'Baloo_2',_cursive] [font-weight:600]">🌊 Live from the Deep · Keep Diving! 🌊</p></div></div></div>`; }
const VIP_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.relative {
  position: relative;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mr-6 {
  margin-right: 1.5rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-16 {
  margin-top: 4rem;
}

.flex {
  display: flex;
}

.h-8 {
  height: 2rem;
}

.h-\\[1px\\] {
  height: 1px;
}

.min-h-screen {
  min-height: 100vh;
}

.w-12 {
  width: 3rem;
}

.w-4 {
  width: 1rem;
}

.w-8 {
  width: 2rem;
}

.w-full {
  width: 100%;
}

.min-w-0 {
  min-width: 0px;
}

.max-w-4xl {
  max-width: 56rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-col {
  flex-direction: column;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.gap-4 {
  gap: 1rem;
}

.gap-8 {
  gap: 2rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-full {
  border-radius: 9999px;
}

.border {
  border-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-l-\\[1px\\] {
  border-left-width: 1px;
}

.border-\\[\\#C9A84C\\] {
  --tw-border-opacity: 1;
  border-color: rgb(201 168 76 / var(--tw-border-opacity, 1));
}

.border-\\[\\#C9A84C\\]\\/20 {
  border-color: rgb(201 168 76 / 0.2);
}

.border-l-transparent {
  border-left-color: transparent;
}

.bg-\\[\\#0A0A0A\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(10 10 10 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#C9A84C\\]\\/30 {
  background-color: rgb(201 168 76 / 0.3);
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-12 {
  padding-top: 3rem;
  padding-bottom: 3rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.pb-1 {
  padding-bottom: 0.25rem;
}

.text-center {
  text-align: center;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-\\[11px\\] {
  font-size: 11px;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.uppercase {
  text-transform: uppercase;
}

.tracking-\\[0\\.2em\\] {
  letter-spacing: 0.2em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#C9A84C\\] {
  --tw-text-opacity: 1;
  color: rgb(201 168 76 / var(--tw-text-opacity, 1));
}

.text-\\[\\#C9A84C\\]\\/50 {
  color: rgb(201 168 76 / 0.5);
}

.text-\\[\\#C9A84C\\]\\/60 {
  color: rgb(201 168 76 / 0.6);
}

.text-\\[\\#C9A84C\\]\\/70 {
  color: rgb(201 168 76 / 0.7);
}

.text-\\[\\#F5F5F0\\] {
  --tw-text-opacity: 1;
  color: rgb(245 245 240 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F5F5F0\\]\\/40 {
  color: rgb(245 245 240 / 0.4);
}

.opacity-50 {
  opacity: 0.5;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[font-family\\:\\'Cormorant_Garamond\\'\\2c _serif\\] {
  font-family: 'Cormorant Garamond', serif;
}

.\\[font-family\\:\\'Space_Mono\\'\\2c _monospace\\] {
  font-family: 'Space Mono', monospace;
}

.\\[font-style\\:italic\\] {
  font-style: italic;
}

.\\[font-variant\\:small-caps\\] {
  font-variant: small-caps;
}

.selection\\:bg-\\[\\#C9A84C\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(201 168 76 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#C9A84C\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(201 168 76 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#0A0A0A\\] *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(10 10 10 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#0A0A0A\\] *::selection {
  --tw-text-opacity: 1;
  color: rgb(10 10 10 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#C9A84C\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(201 168 76 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#C9A84C\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(201 168 76 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#0A0A0A\\]::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(10 10 10 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#0A0A0A\\]::selection {
  --tw-text-opacity: 1;
  color: rgb(10 10 10 / var(--tw-text-opacity, 1));
}

.hover\\:bg-\\[\\#0f0f0f\\]:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(15 15 15 / var(--tw-bg-opacity, 1));
}

.hover\\:text-\\[\\#C9A84C\\]:hover {
  --tw-text-opacity: 1;
  color: rgb(201 168 76 / var(--tw-text-opacity, 1));
}

@media (min-width: 768px) {
  .md\\:px-8 {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }
}
`;
export function composeVip(_p) { return `<div class="min-h-screen bg-[#0A0A0A] text-[#F5F5F0] flex flex-col items-center selection:bg-[#C9A84C] selection:text-[#0A0A0A]"><div class="w-full max-w-4xl px-6 py-12 flex flex-col"><header class="mb-12 text-center relative w-full"><div class="h-[1px] w-full bg-[#C9A84C]/30 mb-8"></div><h1 class="text-4xl md:text-5xl tracking-[0.2em] text-[#C9A84C] uppercase mb-4 [font-family:'Cormorant_Garamond',_serif] [font-variant:small-caps]">Private Standings</h1><p class="text-xs text-[#C9A84C]/70 tracking-widest uppercase mb-8 [font-family:'Space_Mono',_monospace]">Season XIV <span class="mx-2 opacity-50">·</span> Members Only</p><div class="h-[1px] w-full bg-[#C9A84C]/30 mb-8"></div><div class="flex justify-center gap-8 text-[11px] tracking-widest uppercase [font-family:'Space_Mono',_monospace]"><button class="text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">Today</button><button class="text-[#C9A84C] border-b border-[#C9A84C] pb-1">This Week</button><button class="text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">All Time</button></div></header><div data-rows=""></div><footer class="mt-16 text-center"><div class="h-[1px] w-full bg-[#C9A84C]/30 mb-6"></div><p class="text-[#C9A84C]/50 text-[10px] tracking-widest uppercase [font-family:'Space_Mono',_monospace]">12 Members <span class="mx-2">·</span> Updated 2 min ago</p></footer></div></div>`; }
const WESTERN_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-left-3 {
  left: -0.75rem;
}

.-right-4 {
  right: -1rem;
}

.-top-3 {
  top: -0.75rem;
}

.-top-4 {
  top: -1rem;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-8 {
  margin-bottom: 2rem;
}

.ml-4 {
  margin-left: 1rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-12 {
  margin-top: 3rem;
}

.mt-4 {
  margin-top: 1rem;
}

.flex {
  display: flex;
}

.h-10 {
  height: 2.5rem;
}

.h-12 {
  height: 3rem;
}

.h-14 {
  height: 3.5rem;
}

.h-16 {
  height: 4rem;
}

.h-20 {
  height: 5rem;
}

.min-h-screen {
  min-height: 100vh;
}

.w-1\\/3 {
  width: 33.333333%;
}

.w-10 {
  width: 2.5rem;
}

.w-14 {
  width: 3.5rem;
}

.w-16 {
  width: 4rem;
}

.w-20 {
  width: 5rem;
}

.w-full {
  width: 100%;
}

.max-w-4xl {
  max-width: 56rem;
}

.max-w-\\[180px\\] {
  max-width: 180px;
}

.max-w-\\[200px\\] {
  max-width: 200px;
}

.max-w-\\[240px\\] {
  max-width: 240px;
}

.max-w-md {
  max-width: 28rem;
}

.shrink-0 {
  flex-shrink: 0;
}

.flex-grow {
  flex-grow: 1;
}

.-translate-y-4 {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.rotate-45 {
  --tw-rotate: 45deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-105 {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.scale-\\[1\\.05\\] {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer {
  cursor: pointer;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.overflow-x-hidden {
  overflow-x: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-b-md {
  border-bottom-right-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.rounded-b-xl {
  border-bottom-right-radius: 0.75rem;
  border-bottom-left-radius: 0.75rem;
}

.rounded-t-lg {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.border-2 {
  border-width: 2px;
}

.border-4 {
  border-width: 4px;
}

.border-x-4 {
  border-left-width: 4px;
  border-right-width: 4px;
}

.border-b-4 {
  border-bottom-width: 4px;
}

.border-b-8 {
  border-bottom-width: 8px;
}

.border-l-8 {
  border-left-width: 8px;
}

.border-t {
  border-top-width: 1px;
}

.border-\\[\\#1A0A00\\] {
  --tw-border-opacity: 1;
  border-color: rgb(26 10 0 / var(--tw-border-opacity, 1));
}

.border-\\[\\#33220F\\] {
  --tw-border-opacity: 1;
  border-color: rgb(51 34 15 / var(--tw-border-opacity, 1));
}

.border-\\[\\#3D2912\\] {
  --tw-border-opacity: 1;
  border-color: rgb(61 41 18 / var(--tw-border-opacity, 1));
}

.border-\\[\\#7A5A34\\] {
  --tw-border-opacity: 1;
  border-color: rgb(122 90 52 / var(--tw-border-opacity, 1));
}

.border-\\[\\#8A5A0A\\] {
  --tw-border-opacity: 1;
  border-color: rgb(138 90 10 / var(--tw-border-opacity, 1));
}

.border-\\[\\#8B6B3D\\] {
  --tw-border-opacity: 1;
  border-color: rgb(139 107 61 / var(--tw-border-opacity, 1));
}

.border-\\[\\#C98415\\] {
  --tw-border-opacity: 1;
  border-color: rgb(201 132 21 / var(--tw-border-opacity, 1));
}

.border-\\[\\#F5A623\\] {
  --tw-border-opacity: 1;
  border-color: rgb(245 166 35 / var(--tw-border-opacity, 1));
}

.border-\\[\\#F5A623\\]\\/30 {
  border-color: rgb(245 166 35 / 0.3);
}

.border-\\[\\#F5A623\\]\\/40 {
  border-color: rgb(245 166 35 / 0.4);
}

.border-transparent {
  border-color: transparent;
}

.bg-\\[\\#1A0A00\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(26 10 0 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#2C1000\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(44 16 0 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#3D1A00\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(61 26 0 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#F5A623\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(245 166 35 / var(--tw-bg-opacity, 1));
}

.bg-transparent {
  background-color: transparent;
}

.bg-\\[repeating-linear-gradient\\(45deg\\2c \\#000\\2c \\#000_10px\\2c transparent_10px\\2c transparent_20px\\)\\] {
  background-image: repeating-linear-gradient(45deg,#000,#000 10px,transparent 10px,transparent 20px);
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.from-\\[\\#7A5A34\\] {
  --tw-gradient-from: #7A5A34 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(122 90 52 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#8B6B3D\\] {
  --tw-gradient-from: #8B6B3D var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(139 107 61 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#C4A076\\] {
  --tw-gradient-from: #C4A076 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(196 160 118 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#D4B886\\] {
  --tw-gradient-from: #D4B886 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(212 184 134 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#EEDC9A\\] {
  --tw-gradient-from: #EEDC9A var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(238 220 154 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-\\[\\#F5A623\\] {
  --tw-gradient-from: #F5A623 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(245 166 35 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.to-\\[\\#4F371B\\] {
  --tw-gradient-to: #4F371B var(--tw-gradient-to-position);
}

.to-\\[\\#5C4525\\] {
  --tw-gradient-to: #5C4525 var(--tw-gradient-to-position);
}

.to-\\[\\#9A764A\\] {
  --tw-gradient-to: #9A764A var(--tw-gradient-to-position);
}

.to-\\[\\#A68A56\\] {
  --tw-gradient-to: #A68A56 var(--tw-gradient-to-position);
}

.to-\\[\\#B87A11\\] {
  --tw-gradient-to: #B87A11 var(--tw-gradient-to-position);
}

.to-\\[\\#C8A951\\] {
  --tw-gradient-to: #C8A951 var(--tw-gradient-to-position);
}

.p-2 {
  padding: 0.5rem;
}

.p-3 {
  padding: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.pb-20 {
  padding-bottom: 5rem;
}

.pt-8 {
  padding-top: 2rem;
}

.text-center {
  text-align: center;
}

.font-\\[\\'Inter\\'\\] {
  font-family: 'Inter';
}

.font-sans {
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-5xl {
  font-size: 3rem;
  line-height: 1;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.tracking-wide {
  letter-spacing: 0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#1A0A00\\] {
  --tw-text-opacity: 1;
  color: rgb(26 10 0 / var(--tw-text-opacity, 1));
}

.text-\\[\\#2C1000\\] {
  --tw-text-opacity: 1;
  color: rgb(44 16 0 / var(--tw-text-opacity, 1));
}

.text-\\[\\#800000\\] {
  --tw-text-opacity: 1;
  color: rgb(128 0 0 / var(--tw-text-opacity, 1));
}

.text-\\[\\#C0392B\\] {
  --tw-text-opacity: 1;
  color: rgb(192 57 43 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F5A623\\] {
  --tw-text-opacity: 1;
  color: rgb(245 166 35 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F5A623\\]\\/70 {
  color: rgb(245 166 35 / 0.7);
}

.text-\\[\\#FFF8E7\\] {
  --tw-text-opacity: 1;
  color: rgb(255 248 231 / var(--tw-text-opacity, 1));
}

.opacity-10 {
  opacity: 0.1;
}

.opacity-30 {
  opacity: 0.3;
}

.opacity-50 {
  opacity: 0.5;
}

.opacity-80 {
  opacity: 0.8;
}

.shadow-\\[0_0_15px_rgba\\(245\\2c 166\\2c 35\\2c 0\\.4\\)\\] {
  --tw-shadow: 0 0 15px rgba(245,166,35,0.4);
  --tw-shadow-colored: 0 0 15px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_20px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-shadow: 0 10px 20px rgba(0,0,0,0.8);
  --tw-shadow-colored: 0 10px 20px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_10px_30px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-shadow: 0 10px 30px rgba(0,0,0,0.8);
  --tw-shadow-colored: 0 10px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_15px_30px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.9\\)\\] {
  --tw-shadow: 0 15px 30px rgba(0,0,0,0.9);
  --tw-shadow-colored: 0 15px 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_4px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: 0 4px 10px rgba(0,0,0,0.5);
  --tw-shadow-colored: 0 4px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_2px_4px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.4\\)\\] {
  --tw-shadow: inset 0 2px 4px rgba(255,255,255,0.4);
  --tw-shadow-colored: inset 0 2px 4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_10px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-shadow: inset 0 4px 10px rgba(0,0,0,0.5);
  --tw-shadow-colored: inset 0 4px 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[inset_0_4px_8px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-shadow: inset 0 4px 8px rgba(0,0,0,0.8);
  --tw-shadow-colored: inset 0 4px 8px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-inner {
  --tw-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.blur-\\[50px\\] {
  --tw-blur: blur(50px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.brightness-\\[1\\.5\\] {
  --tw-brightness: brightness(1.5);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_1px_1px_rgba\\(255\\2c 255\\2c 255\\2c 0\\.5\\)\\] {
  --tw-drop-shadow: drop-shadow(0 1px 1px rgba(255,255,255,0.5));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 4px rgba(0,0,0,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_2px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.9\\)\\] {
  --tw-drop-shadow: drop-shadow(0 2px 4px rgba(0,0,0,0.9));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_4px_4px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.5\\)\\] {
  --tw-drop-shadow: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_4px_6px_rgba\\(0\\2c 0\\2c 0\\2c 0\\.9\\)\\] {
  --tw-drop-shadow: drop-shadow(0 4px 6px rgba(0,0,0,0.9));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-sm {
  --tw-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.grayscale-\\[50\\%\\] {
  --tw-grayscale: grayscale(50%);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.\\[animation-delay\\:0\\.2s\\] {
  animation-delay: 0.2s;
}

.\\[animation-delay\\:0\\.3s\\] {
  animation-delay: 0.3s;
}

.\\[animation-duration\\:3s\\] {
  animation-duration: 3s;
}

.\\[animation-duration\\:4s\\] {
  animation-duration: 4s;
}

.\\[font-family\\:\\'Rye\\'\\2c _serif\\] {
  font-family: 'Rye', serif;
}

.selection\\:bg-\\[\\#F5A623\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(245 166 35 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#F5A623\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(245 166 35 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#2C1000\\] *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(44 16 0 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#2C1000\\] *::selection {
  --tw-text-opacity: 1;
  color: rgb(44 16 0 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#F5A623\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(245 166 35 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#F5A623\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(245 166 35 / var(--tw-bg-opacity, 1));
}

.selection\\:text-\\[\\#2C1000\\]::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(44 16 0 / var(--tw-text-opacity, 1));
}

.selection\\:text-\\[\\#2C1000\\]::selection {
  --tw-text-opacity: 1;
  color: rgb(44 16 0 / var(--tw-text-opacity, 1));
}

.hover\\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:scale-\\[1\\.01\\]:hover {
  --tw-scale-x: 1.01;
  --tw-scale-y: 1.01;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:bg-\\[\\#381E0C\\]:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(56 30 12 / var(--tw-bg-opacity, 1));
}

.hover\\:bg-\\[\\#3D1A00\\]\\/50:hover {
  background-color: rgb(61 26 0 / 0.5);
}

.hover\\:text-\\[\\#F5A623\\]:hover {
  --tw-text-opacity: 1;
  color: rgb(245 166 35 / var(--tw-text-opacity, 1));
}

.group:hover .group-hover\\:text-\\[\\#F5A623\\] {
  --tw-text-opacity: 1;
  color: rgb(245 166 35 / var(--tw-text-opacity, 1));
}

@media (min-width: 768px) {
  .md\\:mt-0 {
    margin-top: 0px;
  }

  .md\\:mt-16 {
    margin-top: 4rem;
  }

  .md\\:h-12 {
    height: 3rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-28 {
    height: 7rem;
  }

  .md\\:w-12 {
    width: 3rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-28 {
    width: 7rem;
  }

  .md\\:-translate-y-8 {
    --tw-translate-y: -2rem;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-4 {
    padding: 1rem;
  }

  .md\\:p-6 {
    padding: 1.5rem;
  }

  .md\\:py-12 {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .md\\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .md\\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }

  .md\\:text-7xl {
    font-size: 4.5rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
`;
export function composeWestern(_p) { return `<div class="min-h-screen bg-[#3D1A00] text-[#FFF8E7] font-sans overflow-x-hidden flex flex-col items-center pb-20 selection:bg-[#F5A623] selection:text-[#2C1000]"><div class="w-full relative bg-[#2C1000] shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-b-8 border-[#F5A623]"><div class="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,#000,#000_10px,transparent_10px,transparent_20px)] pointer-events-none"></div><div class="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center text-center"><div class="flex items-center gap-2 md:gap-4 mb-2"><span class="text-4xl md:text-6xl animate-bounce">🤠</span><h1 class="text-5xl md:text-7xl tracking-widest text-[#F5A623] drop-shadow-[0_4px_6px_rgba(0,0,0,0.9)] [font-family:'Rye',_serif]">HIGH ROLLERS</h1><span class="text-4xl md:text-6xl animate-bounce [animation-delay:0.2s]">🤠</span></div><p class="text-[#FFF8E7] text-lg md:text-2xl font-bold tracking-wider mt-4 mb-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2 [font-family:'Rye',_serif]">⭐ The Frontier's Finest Gamblers ⭐</p><div class="flex gap-3 bg-[#1A0A00] p-2 rounded-full border-2 border-[#F5A623]/40 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all border-2 bg-transparent border-transparent text-[#F5A623]/70 hover:text-[#F5A623] hover:bg-[#3D1A00]/50 [font-family:'Rye',_serif]">HOURLY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all border-2 bg-[#2C1000] text-[#F5A623] border-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.4)] scale-105 [font-family:'Rye',_serif]">TODAY</button><button class="px-6 py-2 rounded-full font-bold text-sm md:text-base transition-all border-2 bg-transparent border-transparent text-[#F5A623]/70 hover:text-[#F5A623] hover:bg-[#3D1A00]/50 [font-family:'Rye',_serif]">ALL TIME</button></div></div></div><div class="max-w-4xl w-full px-4 mt-12 md:mt-16 flex flex-col items-center"><div data-top3=""></div><div data-rows=""></div><div class="mt-12 mb-8 text-center border-t border-[#F5A623]/30 pt-8 w-full max-w-md"><p class="text-[#F5A623] text-xl md:text-2xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [font-family:'Rye',_serif]">🤠 Yeehaw · Keep Dealin'! 🤠</p></div></div></div>`; }

const PRO_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.left-0 {
  left: 0px;
}

.top-0 {
  top: 0px;
}

.flex {
  display: flex;
}

.table {
  display: table;
}

.grid {
  display: grid;
}

.h-2 {
  height: 0.5rem;
}

.h-8 {
  height: 2rem;
}

.h-\\[2px\\] {
  height: 2px;
}

.h-full {
  height: 100%;
}

.min-h-screen {
  min-height: 100vh;
}

.w-10 {
  width: 2.5rem;
}

.w-16 {
  width: 4rem;
}

.w-2 {
  width: 0.5rem;
}

.w-24 {
  width: 6rem;
}

.w-48 {
  width: 12rem;
}

.w-8 {
  width: 2rem;
}

.w-full {
  width: 100%;
}

.max-w-7xl {
  max-width: 80rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.border-collapse {
  border-collapse: collapse;
}

@keyframes pulse {
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.flex-col {
  flex-direction: column;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-auto {
  overflow-x: auto;
}

.whitespace-nowrap {
  white-space: nowrap;
}

.rounded-full {
  border-radius: 9999px;
}

.border {
  border-width: 1px;
}

.border-y {
  border-top-width: 1px;
  border-bottom-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-l-2 {
  border-left-width: 2px;
}

.border-t {
  border-top-width: 1px;
}

.border-\\[\\#22C55E\\]\\/10 {
  border-color: rgb(34 197 94 / 0.1);
}

.border-\\[\\#22C55E\\]\\/20 {
  border-color: rgb(34 197 94 / 0.2);
}

.border-\\[\\#22C55E\\]\\/50 {
  border-color: rgb(34 197 94 / 0.5);
}

.border-\\[\\#F59E0B\\] {
  --tw-border-opacity: 1;
  border-color: rgb(245 158 11 / var(--tw-border-opacity, 1));
}

.border-y-\\[\\#F59E0B\\]\\/10 {
  border-top-color: rgb(245 158 11 / 0.1);
  border-bottom-color: rgb(245 158 11 / 0.1);
}

.border-y-transparent {
  border-top-color: transparent;
  border-bottom-color: transparent;
}

.border-l-\\[\\#22C55E\\] {
  --tw-border-opacity: 1;
  border-left-color: rgb(34 197 94 / var(--tw-border-opacity, 1));
}

.border-l-\\[\\#F59E0B\\] {
  --tw-border-opacity: 1;
  border-left-color: rgb(245 158 11 / var(--tw-border-opacity, 1));
}

.border-l-transparent {
  border-left-color: transparent;
}

.bg-\\[\\#0D1A0F\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(13 26 15 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#1A2E1C\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(26 46 28 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#1A2E1C\\]\\/40 {
  background-color: rgb(26 46 28 / 0.4);
}

.bg-\\[\\#22C55E\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(34 197 94 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#F59E0B\\]\\/5 {
  background-color: rgb(245 158 11 / 0.05);
}

.p-3 {
  padding: 0.75rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-3 {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.pb-4 {
  padding-bottom: 1rem;
}

.pb-8 {
  padding-bottom: 2rem;
}

.pt-2 {
  padding-top: 0.5rem;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.font-normal {
  font-weight: 400;
}

.uppercase {
  text-transform: uppercase;
}

.leading-tight {
  line-height: 1.25;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#22C55E\\] {
  --tw-text-opacity: 1;
  color: rgb(34 197 94 / var(--tw-text-opacity, 1));
}

.text-\\[\\#6B7280\\] {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}

.text-\\[\\#E5E5E5\\] {
  --tw-text-opacity: 1;
  color: rgb(229 229 229 / var(--tw-text-opacity, 1));
}

.text-\\[\\#EF4444\\] {
  --tw-text-opacity: 1;
  color: rgb(239 68 68 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F59E0B\\] {
  --tw-text-opacity: 1;
  color: rgb(245 158 11 / var(--tw-text-opacity, 1));
}

.text-\\[\\#F59E0B\\]\\/70 {
  color: rgb(245 158 11 / 0.7);
}

.opacity-75 {
  opacity: 0.75;
}

.opacity-80 {
  opacity: 0.8;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.selection\\:bg-\\[\\#22C55E\\]\\/30 *::-moz-selection {
  background-color: rgb(34 197 94 / 0.3);
}

.selection\\:bg-\\[\\#22C55E\\]\\/30 *::selection {
  background-color: rgb(34 197 94 / 0.3);
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#22C55E\\]\\/30::-moz-selection {
  background-color: rgb(34 197 94 / 0.3);
}

.selection\\:bg-\\[\\#22C55E\\]\\/30::selection {
  background-color: rgb(34 197 94 / 0.3);
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:bg-\\[\\#1A2E1C\\]\\/40:hover {
  background-color: rgb(26 46 28 / 0.4);
}

.hover\\:bg-\\[\\#1A2E1C\\]\\/80:hover {
  background-color: rgb(26 46 28 / 0.8);
}

.hover\\:bg-\\[\\#F59E0B\\]\\/10:hover {
  background-color: rgb(245 158 11 / 0.1);
}

.hover\\:text-\\[\\#E5E5E5\\]:hover {
  --tw-text-opacity: 1;
  color: rgb(229 229 229 / var(--tw-text-opacity, 1));
}

@media (min-width: 768px) {
  .md\\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
`;

export function composePro(_p) { return `<div class="min-h-screen bg-[#0D1A0F] text-[#E5E5E5] font-mono selection:bg-[#22C55E]/30 selection:text-white flex flex-col items-center">
  <div class="w-full max-w-7xl px-4 py-6 flex flex-col gap-6">
    <header class="flex flex-col gap-4 border-b border-[#22C55E]/20 pb-4">
      <div class="flex justify-between items-end">
        <div class="flex items-center gap-3">
          <div class="relative flex items-center justify-center w-2 h-2">
            <div class="absolute w-2 h-2 bg-[#22C55E] rounded-full animate-pulse opacity-75"></div>
            <div class="absolute w-2 h-2 bg-[#22C55E] rounded-full"></div>
          </div>
          <h1 class="text-[#22C55E] text-sm font-bold tracking-widest uppercase">Poker Rankings · Live</h1>
        </div>
        <div class="flex items-center gap-4 text-xs tracking-wider">
          <button class="text-[#6B7280] hover:text-[#E5E5E5] transition-colors">[TODAY]</button>
          <button class="text-[#6B7280] hover:text-[#E5E5E5] transition-colors">[THIS WEEK]</button>
          <button class="text-[#22C55E] font-bold">[ALL TIME]</button>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div class="bg-[#1A2E1C]/40 border border-[#22C55E]/10 p-3 flex flex-col gap-1">
          <span class="text-[#6B7280] text-[10px] tracking-widest uppercase">Total Players</span>
          <span class="text-[#E5E5E5] text-sm">1,247</span>
        </div>
        <div class="bg-[#1A2E1C]/40 border border-[#22C55E]/10 p-3 flex flex-col gap-1">
          <span class="text-[#6B7280] text-[10px] tracking-widest uppercase">Avg Win Rate</span>
          <span class="text-[#E5E5E5] text-sm">54.2%</span>
        </div>
        <div class="bg-[#1A2E1C]/40 border border-[#22C55E]/10 p-3 flex flex-col gap-1">
          <span class="text-[#6B7280] text-[10px] tracking-widest uppercase">Season Prize Pool</span>
          <span class="text-[#22C55E] text-sm">$284,500</span>
        </div>
        <div class="bg-[#1A2E1C]/40 border border-[#22C55E]/10 p-3 flex flex-col gap-1">
          <span class="text-[#6B7280] text-[10px] tracking-widest uppercase">Hands Played</span>
          <span class="text-[#E5E5E5] text-sm">48,392</span>
        </div>
      </div>
    </header>
    <div class="w-full overflow-x-auto pb-8">
      <table class="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr class="text-[#6B7280] text-[10px] tracking-widest border-b border-[#22C55E]/20">
            <th class="py-3 px-4 font-normal w-16">RANK</th>
            <th class="py-3 px-4 font-normal">PLAYER</th>
            <th class="py-3 px-4 font-normal text-right">HANDS</th>
            <th class="py-3 px-4 font-normal w-48">WIN RATE</th>
            <th class="py-3 px-4 font-normal text-right">NET PROFIT</th>
            <th class="py-3 px-4 font-normal text-right">SCORE</th>
            <th class="py-3 px-4 font-normal text-right w-16">Δ</th>
          </tr>
        </thead>
        <tbody class="text-sm" data-rows></tbody>
      </table>
    </div>
    <footer class="w-full text-center py-6 border-t border-[#22C55E]/20">
      <p class="text-[#6B7280] text-[10px] tracking-widest">
        DATA REFRESHES EVERY 30S · SHOWING SEASON 14 RESULTS · ALL FIGURES IN USD
      </p>
    </footer>
  </div>
</div>`; }

const LEADERBOARDV2_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: "Space Mono", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.bottom-0 {
  bottom: 0px;
}

.left-0 {
  left: 0px;
}

.top-0 {
  top: 0px;
}

.top-1\\/2 {
  top: 50%;
}

.z-10 {
  z-index: 10;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.-ml-2 {
  margin-left: -0.5rem;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-12 {
  margin-bottom: 3rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.ml-4 {
  margin-left: 1rem;
}

.ml-5 {
  margin-left: 1.25rem;
}

.mt-16 {
  margin-top: 4rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-6 {
  margin-top: 1.5rem;
}

.mt-8 {
  margin-top: 2rem;
}

.flex {
  display: flex;
}

.hidden {
  display: none;
}

.h-12 {
  height: 3rem;
}

.h-4 {
  height: 1rem;
}

.h-\\[1px\\] {
  height: 1px;
}

.h-\\[2px\\] {
  height: 2px;
}

.h-\\[3px\\] {
  height: 3px;
}

.h-px {
  height: 1px;
}

.min-h-screen {
  min-height: 100vh;
}

.w-12 {
  width: 3rem;
}

.w-16 {
  width: 4rem;
}

.w-24 {
  width: 6rem;
}

.w-\\[3px\\] {
  width: 3px;
}

.w-\\[4px\\] {
  width: 4px;
}

.w-full {
  width: 100%;
}

.min-w-\\[240px\\] {
  min-width: 240px;
}

.max-w-\\[1400px\\] {
  max-width: 1400px;
}

.flex-1 {
  flex: 1 1 0%;
}

.shrink-0 {
  flex-shrink: 0;
}

.-translate-y-1\\/2 {
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.flex-col {
  flex-direction: column;
}

.items-start {
  align-items: flex-start;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1\\.5 {
  gap: 0.375rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-6 {
  gap: 1.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-sm {
  border-radius: 0.125rem;
}

.border-\\[1\\.5px\\] {
  border-width: 1.5px;
}

.border-b-2 {
  border-bottom-width: 2px;
}

.border-b-\\[2px\\] {
  border-bottom-width: 2px;
}

.border-b-\\[3px\\] {
  border-bottom-width: 3px;
}

.border-t-\\[3px\\] {
  border-top-width: 3px;
}

.border-\\[\\#C41E3A\\] {
  --tw-border-opacity: 1;
  border-color: rgb(196 30 58 / var(--tw-border-opacity, 1));
}

.border-black {
  --tw-border-opacity: 1;
  border-color: rgb(0 0 0 / var(--tw-border-opacity, 1));
}

.border-primary {
  --tw-border-opacity: 1;
  border-color: rgb(196 30 58 / var(--tw-border-opacity, 1));
}

.bg-\\[\\#C41E3A\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.bg-\\[\\#FFFBEA\\] {
  --tw-bg-opacity: 1;
  background-color: rgb(255 251 234 / var(--tw-bg-opacity, 1));
}

.bg-background {
  --tw-bg-opacity: 1;
  background-color: rgb(250 247 242 / var(--tw-bg-opacity, 1));
}

.bg-black {
  --tw-bg-opacity: 1;
  background-color: rgb(0 0 0 / var(--tw-bg-opacity, 1));
}

.bg-black\\/20 {
  background-color: rgb(0 0 0 / 0.2);
}

.bg-card {
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-muted {
  --tw-bg-opacity: 1;
  background-color: rgb(107 114 128 / var(--tw-bg-opacity, 1));
}

.bg-primary {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.bg-secondary {
  --tw-bg-opacity: 1;
  background-color: rgb(243 244 246 / var(--tw-bg-opacity, 1));
}

.p-6 {
  padding: 1.5rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.px-8 {
  padding-left: 2rem;
  padding-right: 2rem;
}

.py-0\\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-6 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.pb-1 {
  padding-bottom: 0.25rem;
}

.pb-16 {
  padding-bottom: 4rem;
}

.pb-6 {
  padding-bottom: 1.5rem;
}

.pl-2 {
  padding-left: 0.5rem;
}

.pl-6 {
  padding-left: 1.5rem;
}

.pr-6 {
  padding-right: 1.5rem;
}

.pt-8 {
  padding-top: 2rem;
}

.font-display {
  font-family: "Playfair Display", serif;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-6xl {
  font-size: 3.75rem;
  line-height: 1;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-\\[2\\.5rem\\] {
  font-size: 2.5rem;
}

.text-\\[4\\.5rem\\] {
  font-size: 4.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.uppercase {
  text-transform: uppercase;
}

.italic {
  font-style: italic;
}

.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  font-variant-numeric: var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction);
}

.leading-\\[0\\.85\\] {
  line-height: 0.85;
}

.leading-none {
  line-height: 1;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-\\[\\#105c38\\] {
  --tw-text-opacity: 1;
  color: rgb(16 92 56 / var(--tw-text-opacity, 1));
}

.text-\\[\\#C41E3A\\] {
  --tw-text-opacity: 1;
  color: rgb(196 30 58 / var(--tw-text-opacity, 1));
}

.text-\\[\\#FAF7F2\\] {
  --tw-text-opacity: 1;
  color: rgb(250 247 242 / var(--tw-text-opacity, 1));
}

.text-black {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-black\\/80 {
  color: rgb(0 0 0 / 0.8);
}

.text-card-foreground {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-foreground {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-gray-400 {
  --tw-text-opacity: 1;
  color: rgb(156 163 175 / var(--tw-text-opacity, 1));
}

.text-gray-500 {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}

.text-gray-700 {
  --tw-text-opacity: 1;
  color: rgb(55 65 81 / var(--tw-text-opacity, 1));
}

.text-muted {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}

.text-muted-foreground {
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity, 1));
}

.text-primary {
  --tw-text-opacity: 1;
  color: rgb(196 30 58 / var(--tw-text-opacity, 1));
}

.text-primary-foreground {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-secondary-foreground {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.opacity-20 {
  opacity: 0.2;
}

.opacity-60 {
  opacity: 0.6;
}

.mix-blend-overlay {
  mix-blend-mode: overlay;
}

.mix-blend-color-burn {
  mix-blend-mode: color-burn;
}

.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.selection\\:bg-\\[\\#C41E3A\\] *::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#C41E3A\\] *::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white *::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white *::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:bg-\\[\\#C41E3A\\]::-moz-selection {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.selection\\:bg-\\[\\#C41E3A\\]::selection {
  --tw-bg-opacity: 1;
  background-color: rgb(196 30 58 / var(--tw-bg-opacity, 1));
}

.selection\\:text-white::-moz-selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.selection\\:text-white::selection {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.hover\\:border-b-2:hover {
  border-bottom-width: 2px;
}

.hover\\:border-gray-300:hover {
  --tw-border-opacity: 1;
  border-color: rgb(209 213 219 / var(--tw-border-opacity, 1));
}

.hover\\:bg-black\\/\\[0\\.03\\]:hover {
  background-color: rgb(0 0 0 / 0.03);
}

.hover\\:text-black:hover {
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

@media (min-width: 768px) {
  .md\\:mb-0 {
    margin-bottom: 0px;
  }

  .md\\:mb-20 {
    margin-bottom: 5rem;
  }

  .md\\:ml-8 {
    margin-left: 2rem;
  }

  .md\\:mt-24 {
    margin-top: 6rem;
  }

  .md\\:mt-4 {
    margin-top: 1rem;
  }

  .md\\:h-16 {
    height: 4rem;
  }

  .md\\:w-16 {
    width: 4rem;
  }

  .md\\:w-24 {
    width: 6rem;
  }

  .md\\:w-32 {
    width: 8rem;
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:p-12 {
    padding: 3rem;
  }

  .md\\:py-8 {
    padding-top: 2rem;
    padding-bottom: 2rem;
  }

  .md\\:pr-10 {
    padding-right: 2.5rem;
  }

  .md\\:text-8xl {
    font-size: 6rem;
    line-height: 1;
  }

  .md\\:text-\\[1\\.75rem\\] {
    font-size: 1.75rem;
  }

  .md\\:text-\\[2\\.25rem\\] {
    font-size: 2.25rem;
  }

  .md\\:text-\\[3\\.5rem\\] {
    font-size: 3.5rem;
  }

  .md\\:text-\\[6rem\\] {
    font-size: 6rem;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .md\\:text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

@media (min-width: 1024px) {
  .lg\\:mt-0 {
    margin-top: 0px;
  }

  .lg\\:flex-row {
    flex-direction: row;
  }

  .lg\\:items-end {
    align-items: flex-end;
  }

  .lg\\:gap-8 {
    gap: 2rem;
  }

  .lg\\:p-20 {
    padding: 5rem;
  }

  .lg\\:px-12 {
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .lg\\:text-\\[8rem\\] {
    font-size: 8rem;
  }
}

@media (min-width: 1280px) {
  .xl\\:ml-auto {
    margin-left: auto;
  }

  .xl\\:mt-0 {
    margin-top: 0px;
  }

  .xl\\:flex {
    display: flex;
  }

  .xl\\:w-auto {
    width: auto;
  }

  .xl\\:flex-row {
    flex-direction: row;
  }

  .xl\\:items-end {
    align-items: flex-end;
  }

  .xl\\:items-center {
    align-items: center;
  }

  .xl\\:justify-end {
    justify-content: flex-end;
  }

  .xl\\:pl-0 {
    padding-left: 0px;
  }
}
`;

export function composeLeaderboardV2(_p) { return `<div class="min-h-screen p-6 md:p-12 lg:p-20 text-black selection:bg-[#C41E3A] selection:text-white bg-background font-display"><div class="max-w-[1400px] mx-auto"><header class="mb-12 md:mb-20"><div class="flex flex-col lg:flex-row lg:items-end justify-between border-b-[3px] border-black pb-6 mb-2"><div><h1 class="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter uppercase leading-[0.85]">Standings</h1><p class="mt-6 text-sm md:text-base font-mono uppercase tracking-widest text-gray-700">Season 14 · Week 32 · Updated Live</p></div><div class="flex gap-6 lg:gap-8 mt-8 lg:mt-0 font-mono text-sm md:text-base tracking-widest uppercase"><button class="border-b-2 border-black pb-1 font-bold">Today</button><button class="text-gray-500 pb-1 hover:text-black hover:border-b-2 hover:border-gray-300 transition-all">This Week</button><button class="text-gray-500 pb-1 hover:text-black hover:border-b-2 hover:border-gray-300 transition-all">All Time</button></div></div><div class="h-px bg-black w-full mb-1"></div><div class="h-[3px] bg-black w-full"></div></header><div data-rows class="flex flex-col"></div></div><footer class="mt-16 md:mt-24 flex flex-col md:flex-row items-center justify-between border-t-[3px] border-black pt-8 pb-16"><p class="font-mono text-xs md:text-sm uppercase tracking-widest text-gray-500 mb-6 md:mb-0">Rankings update every 5 minutes.</p><span class="font-mono text-sm md:text-base font-bold tracking-widest bg-black text-[#FAF7F2] px-6 py-2 rounded-sm">01 / 12</span></footer></div></div>`; }

const LEADERBOARD_CSS = `*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured \`sans\` font-family by default.
5. Use the user's configured \`sans\` font-feature-settings by default.
6. Use the user's configured \`sans\` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: "Inter", sans-serif;
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from \`html\` so users can set them as a class directly on the \`html\` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured \`mono\` font-family by default.
2. Use the user's configured \`mono\` font-feature-settings by default.
3. Use the user's configured \`mono\` font-variation-settings by default.
4. Correct the odd \`em\` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent \`sub\` and \`sup\` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional \`:invalid\` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to \`inherit\` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements \`display: block\` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add \`vertical-align: middle\` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.pointer-events-none {
  pointer-events: none;
}

.absolute {
  position: absolute;
}

.relative {
  position: relative;
}

.inset-0 {
  inset: 0px;
}

.-bottom-1 {
  bottom: -0.25rem;
}

.-bottom-3 {
  bottom: -0.75rem;
}

.-right-1 {
  right: -0.25rem;
}

.-top-16 {
  top: -4rem;
}

.bottom-0 {
  bottom: 0px;
}

.bottom-\\[-10\\%\\] {
  bottom: -10%;
}

.left-0 {
  left: 0px;
}

.left-1\\/2 {
  left: 50%;
}

.left-\\[-10\\%\\] {
  left: -10%;
}

.left-\\[50\\%\\] {
  left: 50%;
}

.right-\\[-10\\%\\] {
  right: -10%;
}

.top-0 {
  top: 0px;
}

.top-\\[-10\\%\\] {
  top: -10%;
}

.top-\\[40\\%\\] {
  top: 40%;
}

.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.order-1 {
  order: 1;
}

.order-2 {
  order: 2;
}

.order-3 {
  order: 3;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-16 {
  margin-bottom: 4rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mt-1 {
  margin-top: 0.25rem;
}

.mt-24 {
  margin-top: 6rem;
}

.mt-auto {
  margin-top: auto;
}

.flex {
  display: flex;
}

.inline-flex {
  display: inline-flex;
}

.grid {
  display: grid;
}

.hidden {
  display: none;
}

.h-1\\.5 {
  height: 0.375rem;
}

.h-10 {
  height: 2.5rem;
}

.h-16 {
  height: 4rem;
}

.h-2 {
  height: 0.5rem;
}

.h-24 {
  height: 6rem;
}

.h-28 {
  height: 7rem;
}

.h-3 {
  height: 0.75rem;
}

.h-3\\.5 {
  height: 0.875rem;
}

.h-4 {
  height: 1rem;
}

.h-8 {
  height: 2rem;
}

.h-\\[220px\\] {
  height: 220px;
}

.h-\\[240px\\] {
  height: 240px;
}

.h-\\[280px\\] {
  height: 280px;
}

.h-\\[30\\%\\] {
  height: 30%;
}

.h-\\[50\\%\\] {
  height: 50%;
}

.h-full {
  height: 100%;
}

.min-h-\\[100dvh\\] {
  min-height: 100dvh;
}

.w-1 {
  width: 0.25rem;
}

.w-10 {
  width: 2.5rem;
}

.w-16 {
  width: 4rem;
}

.w-2 {
  width: 0.5rem;
}

.w-20 {
  width: 5rem;
}

.w-24 {
  width: 6rem;
}

.w-28 {
  width: 7rem;
}

.w-3 {
  width: 0.75rem;
}

.w-3\\.5 {
  width: 0.875rem;
}

.w-4 {
  width: 1rem;
}

.w-8 {
  width: 2rem;
}

.w-\\[30\\%\\] {
  width: 30%;
}

.w-\\[50\\%\\] {
  width: 50%;
}

.w-full {
  width: 100%;
}

.min-w-0 {
  min-width: 0px;
}

.min-w-max {
  min-width: -moz-max-content;
  min-width: max-content;
}

.max-w-5xl {
  max-width: 64rem;
}

.max-w-\\[60px\\] {
  max-width: 60px;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.-translate-x-1\\/2 {
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.-translate-y-1\\/2 {
  --tw-translate-y: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }

  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-\\[auto_1fr_auto_auto\\] {
  grid-template-columns: auto 1fr auto auto;
}

.flex-col {
  flex-direction: column;
}

.items-start {
  align-items: flex-start;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-1\\.5 {
  gap: 0.375rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-5 {
  gap: 1.25rem;
}

.gap-6 {
  gap: 1.5rem;
}

.gap-8 {
  gap: 2rem;
}

.divide-y > :not([hidden]) ~ :not([hidden]) {
  --tw-divide-y-reverse: 0;
  border-top-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
  border-bottom-width: calc(1px * var(--tw-divide-y-reverse));
}

.divide-white\\/5 > :not([hidden]) ~ :not([hidden]) {
  border-color: rgb(255 255 255 / 0.05);
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-x-auto {
  overflow-x: auto;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rounded {
  border-radius: 0.25rem;
}

.rounded-2xl {
  border-radius: 1rem;
}

.rounded-3xl {
  border-radius: 1.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.rounded-sm {
  border-radius: 0.125rem;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.rounded-t-2xl {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-4 {
  border-width: 4px;
}

.border-x {
  border-left-width: 1px;
  border-right-width: 1px;
}

.border-b {
  border-bottom-width: 1px;
}

.border-t {
  border-top-width: 1px;
}

.border-background {
  --tw-border-opacity: 1;
  border-color: rgb(2 6 23 / var(--tw-border-opacity, 1));
}

.border-background\\/50 {
  border-color: rgb(2 6 23 / 0.5);
}

.border-border {
  --tw-border-opacity: 1;
  border-color: rgb(30 41 59 / var(--tw-border-opacity, 1));
}

.border-orange-500\\/30 {
  border-color: rgb(249 115 22 / 0.3);
}

.border-slate-400\\/30 {
  border-color: rgb(148 163 184 / 0.3);
}

.border-white\\/5 {
  border-color: rgb(255 255 255 / 0.05);
}

.border-yellow-500\\/50 {
  border-color: rgb(234 179 8 / 0.5);
}

.bg-accent {
  --tw-bg-opacity: 1;
  background-color: rgb(56 189 248 / var(--tw-bg-opacity, 1));
}

.bg-accent\\/5 {
  background-color: rgb(56 189 248 / 0.05);
}

.bg-background {
  --tw-bg-opacity: 1;
  background-color: rgb(2 6 23 / var(--tw-bg-opacity, 1));
}

.bg-background\\/50 {
  background-color: rgb(2 6 23 / 0.5);
}

.bg-black\\/20 {
  background-color: rgb(0 0 0 / 0.2);
}

.bg-blue-500\\/5 {
  background-color: rgb(59 130 246 / 0.05);
}

.bg-card {
  --tw-bg-opacity: 1;
  background-color: rgb(15 23 42 / var(--tw-bg-opacity, 1));
}

.bg-card\\/40 {
  background-color: rgb(15 23 42 / 0.4);
}

.bg-card\\/50 {
  background-color: rgb(15 23 42 / 0.5);
}

.bg-destructive {
  --tw-bg-opacity: 1;
  background-color: rgb(239 68 68 / var(--tw-bg-opacity, 1));
}

.bg-emerald-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(52 211 153 / var(--tw-bg-opacity, 1));
}

.bg-emerald-400\\/10 {
  background-color: rgb(52 211 153 / 0.1);
}

.bg-emerald-500 {
  --tw-bg-opacity: 1;
  background-color: rgb(16 185 129 / var(--tw-bg-opacity, 1));
}

.bg-muted {
  --tw-bg-opacity: 1;
  background-color: rgb(30 41 59 / var(--tw-bg-opacity, 1));
}

.bg-primary {
  --tw-bg-opacity: 1;
  background-color: rgb(56 189 248 / var(--tw-bg-opacity, 1));
}

.bg-primary\\/10 {
  background-color: rgb(56 189 248 / 0.1);
}

.bg-primary\\/20 {
  background-color: rgb(56 189 248 / 0.2);
}

.bg-primary\\/5 {
  background-color: rgb(56 189 248 / 0.05);
}

.bg-rose-400\\/10 {
  background-color: rgb(251 113 133 / 0.1);
}

.bg-secondary {
  --tw-bg-opacity: 1;
  background-color: rgb(30 41 59 / var(--tw-bg-opacity, 1));
}

.bg-slate-400 {
  --tw-bg-opacity: 1;
  background-color: rgb(148 163 184 / var(--tw-bg-opacity, 1));
}

.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}

.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

.bg-gradient-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}

.from-card\\/80 {
  --tw-gradient-from: rgb(15 23 42 / 0.8) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(15 23 42 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-orange-300 {
  --tw-gradient-from: #fdba74 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(253 186 116 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-primary {
  --tw-gradient-from: #38bdf8 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(56 189 248 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-primary\\/20 {
  --tw-gradient-from: rgb(56 189 248 / 0.2) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(56 189 248 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-slate-200 {
  --tw-gradient-from: #e2e8f0 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(226 232 240 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-white {
  --tw-gradient-from: #fff var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-white\\/5 {
  --tw-gradient-from: rgb(255 255 255 / 0.05) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(255 255 255 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.from-yellow-300 {
  --tw-gradient-from: #fde047 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(253 224 71 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

.via-orange-500 {
  --tw-gradient-to: rgb(249 115 22 / 0)  var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), #f97316 var(--tw-gradient-via-position), var(--tw-gradient-to);
}

.via-slate-400 {
  --tw-gradient-to: rgb(148 163 184 / 0)  var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), #94a3b8 var(--tw-gradient-via-position), var(--tw-gradient-to);
}

.via-yellow-500 {
  --tw-gradient-to: rgb(234 179 8 / 0)  var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), #eab308 var(--tw-gradient-via-position), var(--tw-gradient-to);
}

.to-accent {
  --tw-gradient-to: #38bdf8 var(--tw-gradient-to-position);
}

.to-amber-700 {
  --tw-gradient-to: #b45309 var(--tw-gradient-to-position);
}

.to-card {
  --tw-gradient-to: #0f172a var(--tw-gradient-to-position);
}

.to-orange-700 {
  --tw-gradient-to: #c2410c var(--tw-gradient-to-position);
}

.to-slate-400 {
  --tw-gradient-to: #94a3b8 var(--tw-gradient-to-position);
}

.to-slate-600 {
  --tw-gradient-to: #475569 var(--tw-gradient-to-position);
}

.to-transparent {
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
}

.bg-clip-text {
  -webkit-background-clip: text;
          background-clip: text;
}

.p-1 {
  padding: 0.25rem;
}

.p-1\\.5 {
  padding: 0.375rem;
}

.p-4 {
  padding: 1rem;
}

.p-6 {
  padding: 1.5rem;
}

.p-\\[2px\\] {
  padding: 2px;
}

.px-1\\.5 {
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.px-6 {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.py-0\\.5 {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-2\\.5 {
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.py-5 {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.pb-2 {
  padding-bottom: 0.5rem;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.font-display {
  font-family: "Inter", sans-serif;
}

.font-sans {
  font-family: "Inter", sans-serif;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.text-4xl {
  font-size: 2.25rem;
  line-height: 2.5rem;
}

.text-\\[10px\\] {
  font-size: 10px;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-black {
  font-weight: 900;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

.font-semibold {
  font-weight: 600;
}

.uppercase {
  text-transform: uppercase;
}

.italic {
  font-style: italic;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.tracking-tighter {
  letter-spacing: -0.05em;
}

.tracking-wider {
  letter-spacing: 0.05em;
}

.tracking-widest {
  letter-spacing: 0.1em;
}

.text-accent-foreground {
  --tw-text-opacity: 1;
  color: rgb(15 23 42 / var(--tw-text-opacity, 1));
}

.text-background {
  --tw-text-opacity: 1;
  color: rgb(2 6 23 / var(--tw-text-opacity, 1));
}

.text-card-foreground {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.text-destructive-foreground {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.text-emerald-400 {
  --tw-text-opacity: 1;
  color: rgb(52 211 153 / var(--tw-text-opacity, 1));
}

.text-foreground {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.text-muted-foreground {
  --tw-text-opacity: 1;
  color: rgb(148 163 184 / var(--tw-text-opacity, 1));
}

.text-primary {
  --tw-text-opacity: 1;
  color: rgb(56 189 248 / var(--tw-text-opacity, 1));
}

.text-primary-foreground {
  --tw-text-opacity: 1;
  color: rgb(15 23 42 / var(--tw-text-opacity, 1));
}

.text-rose-400 {
  --tw-text-opacity: 1;
  color: rgb(251 113 133 / var(--tw-text-opacity, 1));
}

.text-secondary-foreground {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.text-slate-400 {
  --tw-text-opacity: 1;
  color: rgb(148 163 184 / var(--tw-text-opacity, 1));
}

.text-slate-500 {
  --tw-text-opacity: 1;
  color: rgb(100 116 139 / var(--tw-text-opacity, 1));
}

.text-transparent {
  color: transparent;
}

.text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-yellow-400 {
  --tw-text-opacity: 1;
  color: rgb(250 204 21 / var(--tw-text-opacity, 1));
}

.opacity-0 {
  opacity: 0;
}

.opacity-40 {
  opacity: 0.4;
}

.opacity-75 {
  opacity: 0.75;
}

.opacity-90 {
  opacity: 0.9;
}

.shadow-2xl {
  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_10px_var\\(--color-primary\\)\\] {
  --tw-shadow: 0 0 10px var(--color-primary);
  --tw-shadow-colored: 0 0 10px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_30px_rgba\\(148\\2c 163\\2c 184\\2c 0\\.15\\)\\] {
  --tw-shadow: 0 0 30px rgba(148,163,184,0.15);
  --tw-shadow-colored: 0 0 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_30px_rgba\\(249\\2c 115\\2c 22\\2c 0\\.15\\)\\] {
  --tw-shadow: 0 0 30px rgba(249,115,22,0.15);
  --tw-shadow-colored: 0 0 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_30px_var\\(--color-primary\\)\\] {
  --tw-shadow: 0 0 30px var(--color-primary);
  --tw-shadow-colored: 0 0 30px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-\\[0_0_50px_rgba\\(251\\2c 191\\2c 36\\2c 0\\.2\\)\\] {
  --tw-shadow: 0 0 50px rgba(251,191,36,0.2);
  --tw-shadow-colored: 0 0 50px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.shadow-sm {
  --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.ring-ring {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(56 189 248 / var(--tw-ring-opacity, 1));
}

.blur-\\[100px\\] {
  --tw-blur: blur(100px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.blur-\\[120px\\] {
  --tw-blur: blur(120px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.blur-xl {
  --tw-blur: blur(24px);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-\\[0_0_15px_rgba\\(251\\2c 191\\2c 36\\2c 0\\.8\\)\\] {
  --tw-drop-shadow: drop-shadow(0 0 15px rgba(251,191,36,0.8));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-md {
  --tw-drop-shadow: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.drop-shadow-sm {
  --tw-drop-shadow: drop-shadow(0 1px 1px rgb(0 0 0 / 0.05));
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur-2xl {
  --tw-backdrop-blur: blur(40px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.delay-300 {
  transition-delay: 300ms;
}

.duration-1000 {
  transition-duration: 1000ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.duration-700 {
  transition-duration: 700ms;
}

@keyframes enter {
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0));
  }
}

@keyframes exit {
  to {
    opacity: var(--tw-exit-opacity, 1);
    transform: translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0));
  }
}

.animate-in {
  animation-name: enter;
  animation-duration: 150ms;
  --tw-enter-opacity: initial;
  --tw-enter-scale: initial;
  --tw-enter-rotate: initial;
  --tw-enter-translate-x: initial;
  --tw-enter-translate-y: initial;
}

.fade-in {
  --tw-enter-opacity: 0;
}

.slide-in-from-bottom-12 {
  --tw-enter-translate-y: 3rem;
}

.slide-in-from-bottom-4 {
  --tw-enter-translate-y: 1rem;
}

.slide-in-from-bottom-8 {
  --tw-enter-translate-y: 2rem;
}

.slide-in-from-top-8 {
  --tw-enter-translate-y: -2rem;
}

.duration-1000 {
  animation-duration: 1000ms;
}

.duration-500 {
  animation-duration: 500ms;
}

.duration-700 {
  animation-duration: 700ms;
}

.delay-300 {
  animation-delay: 300ms;
}

.fill-mode-both {
  animation-fill-mode: both;
}

.selection\\:bg-primary\\/30 *::-moz-selection {
  background-color: rgb(56 189 248 / 0.3);
}

.selection\\:bg-primary\\/30 *::selection {
  background-color: rgb(56 189 248 / 0.3);
}

.selection\\:bg-primary\\/30::-moz-selection {
  background-color: rgb(56 189 248 / 0.3);
}

.selection\\:bg-primary\\/30::selection {
  background-color: rgb(56 189 248 / 0.3);
}

.hover\\:-translate-y-4:hover {
  --tw-translate-y: -1rem;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

.hover\\:bg-primary\\/15:hover {
  background-color: rgb(56 189 248 / 0.15);
}

.hover\\:bg-white\\/\\[0\\.03\\]:hover {
  background-color: rgb(255 255 255 / 0.03);
}

.hover\\:text-foreground:hover {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.hover\\:text-primary:hover {
  --tw-text-opacity: 1;
  color: rgb(56 189 248 / var(--tw-text-opacity, 1));
}

.group:hover .group-hover\\:text-primary {
  --tw-text-opacity: 1;
  color: rgb(56 189 248 / var(--tw-text-opacity, 1));
}

.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\\:opacity-70 {
  opacity: 0.7;
}

.data-\\[state\\=active\\]\\:bg-secondary[data-state="active"] {
  --tw-bg-opacity: 1;
  background-color: rgb(30 41 59 / var(--tw-bg-opacity, 1));
}

.data-\\[state\\=active\\]\\:text-foreground[data-state="active"] {
  --tw-text-opacity: 1;
  color: rgb(248 250 252 / var(--tw-text-opacity, 1));
}

.data-\\[state\\=active\\]\\:shadow-md[data-state="active"] {
  --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 768px) {
  .md\\:order-1 {
    order: 1;
  }

  .md\\:order-2 {
    order: 2;
  }

  .md\\:order-3 {
    order: 3;
  }

  .md\\:mt-2 {
    margin-top: 0.5rem;
  }

  .md\\:mt-32 {
    margin-top: 8rem;
  }

  .md\\:block {
    display: block;
  }

  .md\\:flex {
    display: flex;
  }

  .md\\:h-10 {
    height: 2.5rem;
  }

  .md\\:h-20 {
    height: 5rem;
  }

  .md\\:h-32 {
    height: 8rem;
  }

  .md\\:w-10 {
    width: 2.5rem;
  }

  .md\\:w-12 {
    width: 3rem;
  }

  .md\\:w-20 {
    width: 5rem;
  }

  .md\\:w-24 {
    width: 6rem;
  }

  .md\\:w-32 {
    width: 8rem;
  }

  .md\\:w-auto {
    width: auto;
  }

  .md\\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .md\\:grid-cols-\\[auto_1fr_auto_auto_auto\\] {
    grid-template-columns: auto 1fr auto auto auto;
  }

  .md\\:flex-row {
    flex-direction: row;
  }

  .md\\:items-center {
    align-items: center;
  }

  .md\\:gap-4 {
    gap: 1rem;
  }

  .md\\:gap-8 {
    gap: 2rem;
  }

  .md\\:p-8 {
    padding: 2rem;
  }

  .md\\:px-0 {
    padding-left: 0px;
    padding-right: 0px;
  }

  .md\\:px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .md\\:px-6 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .md\\:pb-0 {
    padding-bottom: 0px;
  }

  .md\\:text-4xl {
    font-size: 2.25rem;
    line-height: 2.5rem;
  }

  .md\\:text-5xl {
    font-size: 3rem;
    line-height: 1;
  }

  .md\\:text-base {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  .md\\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .md\\:text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .md\\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .md\\:text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
}

@media (min-width: 1024px) {
  .lg\\:max-w-\\[80px\\] {
    max-width: 80px;
  }

  .lg\\:p-12 {
    padding: 3rem;
  }

  .lg\\:text-6xl {
    font-size: 3.75rem;
    line-height: 1;
  }
}
`;

export function composeLeaderboard(_p) { return `<div class="dark min-h-[100dvh] bg-background text-foreground font-sans p-4 md:p-8 lg:p-12 selection:bg-primary/30 relative overflow-hidden"><div class="absolute inset-0 overflow-hidden pointer-events-none"><div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div><div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]"></div><div class="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px] -translate-x-1/2 -translate-y-1/2"></div></div><div class="max-w-5xl mx-auto relative z-10"><header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 animate-in fade-in slide-in-from-top-8 duration-700"><div class="flex items-center gap-5"><div class="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-[0_0_30px_var(--color-primary)] opacity-90"><div class="h-full w-full bg-card rounded-2xl flex items-center justify-center relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-swords w-8 h-8 md:w-10 md:h-10 text-primary relative z-10" aria-hidden="true"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" /><line x1="13" x2="19" y1="19" y2="13" /><line x1="16" x2="20" y1="16" y2="20" /><line x1="19" x2="21" y1="21" y2="19" /><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" /><line x1="5" x2="9" y1="14" y2="18" /><line x1="7" x2="4" y1="17" y2="20" /><line x1="3" x2="5" y1="19" y2="21" /></svg></div></div><div><h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground font-display uppercase italic">Global <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Rankings</span></h1><p class="text-muted-foreground font-medium tracking-widest mt-1 md:mt-2 flex items-center gap-2 text-xs md:text-sm"><span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>SEASON 14 · LIVE</p></div></div><div dir="ltr" data-orientation="horizontal" class="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar"><div role="tablist" aria-orientation="horizontal" class="flex bg-card/50 backdrop-blur-md p-1.5 rounded-xl border border-white/5 min-w-max" tabindex="-1" data-orientation="horizontal" style="outline:none"><button type="button" role="tab" aria-selected="false" aria-controls="radix-:R16:-content-daily" data-state="inactive" id="radix-:R16:-trigger-daily" class="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-md" tabindex="-1" data-orientation="horizontal" data-radix-collection-item="">Today</button><button type="button" role="tab" aria-selected="true" aria-controls="radix-:R16:-content-weekly" data-state="active" id="radix-:R16:-trigger-weekly" class="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-md" tabindex="-1" data-orientation="horizontal" data-radix-collection-item="">This Week</button><button type="button" role="tab" aria-selected="false" aria-controls="radix-:R16:-content-alltime" data-state="inactive" id="radix-:R16:-trigger-alltime" class="px-6 py-2.5 text-sm font-bold rounded-lg transition-all text-muted-foreground hover:text-foreground data-[state=active]:bg-secondary data-[state=active]:text-foreground data-[state=active]:shadow-md" tabindex="-1" data-orientation="horizontal" data-radix-collection-item="">All Time</button></div></div></header><div data-top3 class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 items-end mt-24 md:mt-32 px-4 md:px-0"></div><div class="bg-card/40 backdrop-blur-2xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both"><div class="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 md:px-6 py-5 text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 bg-black/20"><div class="w-8 md:w-12 text-center">Rank</div><div>Player</div><div class="w-24 md:w-32 hidden md:block text-right">Win Rate</div><div class="w-16 md:w-24 text-center">Status</div><div class="w-20 md:w-32 text-right">Score</div></div><div data-rows class="divide-y divide-white/5 flex flex-col"></div><div class="px-6 py-4 bg-black/20 border-t border-white/5 text-center"><button class="text-sm font-bold text-muted-foreground hover:text-primary transition-colors py-2 uppercase tracking-widest">Load More Players</button></div></div></div></div>`; }

export const CASINO_FULL_CSS = { arcade: ARCADE_CSS, candy: CANDY_CSS, fun: FUN_CSS, space: SPACE_CSS, tropical: TROPICAL_CSS, underwater: UNDERWATER_CSS, vip: VIP_CSS, western: WESTERN_CSS, pro: PRO_CSS, leaderboardV2: LEADERBOARDV2_CSS, leaderboard: LEADERBOARD_CSS };
