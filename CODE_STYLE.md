# Code style

In general use prettier config at the root along with guidelines from
[typescript book style guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md)

## Default exports

Do not use default exports ever. I don't like them and they do not work as good with autocompletion as named exports.
This also applies for react components.

Files with exporting single react component only should be named UpperCamelCase instead of camelCase.

## Absolute imports

As much as I love them, they are real pain while developing libraries. Long story short do not use them until
I or someone else creates automated util parsing ts-compiled js, which rewrites absolute imports from current lib to relative ones.
