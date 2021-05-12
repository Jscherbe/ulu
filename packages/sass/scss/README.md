# About 

This is the sass library 

## Important Goals

1. You should be able get access to anything from the user's side
   - Mixins, Functions, Variables
   - Styles - Things should be able to be 
     - Extended into a pre-existing system (when you have little selector control)
     - Mixing in styles when needed
       - Use placeholders as a more flexible selector system
2. Namespacing
   - Should you be able to namespace the library?
     - Would create a log of interpolation which makes the codebase harder to maintain
     - Bigger barrier if someone else works into this
     - Probably important with certain components
     - If it's within a module/component (interpolation) it's probably not a huge deal