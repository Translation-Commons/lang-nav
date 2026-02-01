## Initialization

This is how we created the project originally -- you should not need to run these, but the steps are provided for background.

1. Initialize the project using vite `npm create vite@latest`
   1. Choose `lang-nav` as project name.
   2. Then React + TypeScript
2. Change into the `lang-nav` directory and run `npm install`
3. Setup the linter
   1. Initialize `npx eslint --init`
   2. Choose options: what: javascript, use: problems, modules: esm, framework: react, typescript: yes, runs on: browser
   3. `npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier`
4. More magic to get it to run... I had to install ESLint on my IDE (VSCode)
5. Some plugins were added after the this library was started like `eslint-plugin-import`
6. Import other libraries
   1. `npm install react-router-dom`
7. Start `npm run dev`

## Deployment

In order to push the changes to the deployed website (github pages site), follow these instructions.

1. Run `npm run deploy` to deploy the changes. This will
   1. Build the app into the dist/ folder.
   2. Push the dist/ contents to the gh-pages branch.
