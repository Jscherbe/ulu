# About 

This is the sass library. Set up for packaged use (under on namespace) and al-a-carte use (importing modules directly)

## Directory Contents/Structure

1. Base - The area for the base styles (normalize, html elements)
2. Components - The area for reusable ui/layout components
3. Helpers - The place for stylesheets that provide overriding/atomic styles (accessibility, type classes, etc)
4. Lib - The modules that are used throughout the system and on the user's side
5. Packages - Entry points for users with preset imports 
   - Note: User's will need to add a namespace like `ulu` when importing a package

## Important Goals

1. You should be able get access to anything from the user's side
   - Mixins, Functions, Variables
   - Styles - Things should be able to be 
     - Extended into a pre-existing system (when you have little selector control)
     - Mixing in styles when needed
       - Use placeholders as a more flexible selector system
2. Namespacing
   - Should you be able to namespace the library (selectors not modules)?
     - Would create a log of interpolation which makes the codebase harder to maintain
     - Bigger barrier if someone else works into this
     - Probably important with certain components
     - If it's within a module/component (interpolation) it's probably not a huge deal

## Rules

- Kabab case will be used for everything, @see "Module Prefixes" below, works better with kabab case
- Modules use simple variable, mixins and function names relative to their module
- Forwards will make namespacing in the overall ulu packaged module
- **Module Prefixes:** Modules all get prefixed by parent module ie lib will transform color.set() to color-set(), adding the modules namespace for users that are importing the whole library. It also matches the core modules `map-get()` and when @used `map.get()`

## Writing Docs

- Should be written from the user's point of view
  - Use prefixes @see "Module Prefixes" in member names. This will avoid confusion about normal use case. For advanced user importing specific parts would already be familiar with this pattern. 