# *Lang*uage *Nav*igator

This repository contain a dataset about the world's languages and language-like objects as well as a website framework to visualize the information.

![Preview of the website](/public/preview.png)

There are multiple ways to visualize the data
|Card List|Details|Hierarchy|Table|Reports|
|--|--|--|--|--|
|<img src="public/cardlist.png" alt="Card List" style="max-width: 200px;" />|<img src="public/details.png" alt="Details" style="max-width: 200px;" />|<img src="public/hierarchy.png" alt="Hierarchy" style="max-width: 200px;" />|<img src="public/table.png" alt="Table" style="max-width: 200px;" />|<img src="public/reports.png" alt="Reports" style="max-width: 200px;" />

## Project Overview

### Motivation

This website was put together to give an overview of the world's languages and language-related concepts. Similar to Ethnologue & Glottolog, the main differences of this are to:
* **Free** & open to all consumers.
* Show **all data**, even contested language definitions. Making sure to put contested data in context.
* Provide **actionable insights** -- make sure the data is clear enough that consumers can come to this page to get answers.

Common questions people will come to this resource for are:
* What's the language code for XXXX?
* What languages are used in country YYYY?
* What are the top languages in the world *given some criteria*.

### Tech Stack

* **Frontend**: The website is rendered in Javascript, particularly React using Typescript.
* **Backend**: The framework of the website Node and Vite.
* **Data**: Data files are written in Tab-separated-value format (tsv).

### Partners

We've partnered with various organizations to get data and to provide data to. UNESCO's [World Atlas of Languages](https://en.wal.unesco.org/), [Digital Language Vitality](https://hlt.bme.hu/en/dld/), and [Unicode CLDR](https://cldr.unicode.org/)

## Data

The data comes from multiple sources, primarily [CLDR](https://github.com/unicode-org/cldr/), [Ethnologue](https://www.ethnologue.com/), and [Glottolog](https://glottolog.org/).

## Development Instructions

In order to generate the website on an internal server, follow these instructions.

1. Install Node Project Manager, see [the official Node documentation for install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Download the repository to your computer -- go to that folder when you are done
3. Run `npm install` to install relevant Node and Vite packageas
4. Run `npm run dev` to start the server with some dev options
   1. or `npm run build` for the public version
5. Depending on what port is used, the website can now be accessed using a local browser at a URL like http://localhost:5173/

In order to push the changes to the deployed website (github pages site), follow these instructions.

1. Run `npm run deploy` to deploy the changes. This will
    1. Build the app into the dist/ folder.
    2. Push the dist/ contents to the gh-pages branch.

### Initialization

This is how we created the project originally -- you should not need to run these, but its for background.

2. Initalize the project using vite `npm create vite@latest`
  1. Choose `lang-nav` as project name. Then React + TypeScript
3. Change into the `lang-nav` directory and run `npm install`
4. Setup the linter
  1. Initialize `npx eslint --init`
  2. Choose options: what: javascript, use: problems, modules: esm, framework: react, typescript: yes, runs on: browser
  3. `npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier`
  4. More magic to get it to run... I had to install ESLint on my IDE (VSCode)
  5. Some plugins were added after the this library was started like `eslint-plugin-import`
5. Import other lirbaries
   1. `npm install react-router-dom`
6. Start `npm run dev`

## How to contribute

### Adding or update Data

There's a lot of data shown here but there always could be more. The main way to add or update data is to go to the Tab-separated files directly. They are all in the [public/data](public/data) directory.

If you want to add entries or update values, you can just edit the existing TSVs. 

However, if you want to add a lot more data or add contested data it may be better to make new TSVs and then update the website to use those instead.

### Adding a Feature

TODO add a guide

## Functionality

Here's a list of planned functionality. Completed functions are checked off.

- [x] Language-adjacent objects
  - [x] Languages
    - [x] Core attributes
    - [x] ISO parent/child connections
    - [x] Language families
    - [x] Glottolog
    - [ ] Digital Support details
    - [ ] Vitality details
    - [ ] Keyboard availability details
  - [x] Territories
    - [x] Countries & Dependencies
    - [x] Continents & other regions
  - [x] Locales (languages + territories + potentially other specificity)
    - [x] Basic data
    - [x] Computed regional locales
    - [ ] Population estimate sources
  - [x] Writing Systems
    - [x] Basic data
    - [x] Relationship w/ other writing systems (containment, lineage)
  - [ ] Language Variants / IANA tags
  - [x] Censuses
    - [x] Regular censuses
    - [ ] Include citation information
    - [ ] Convert other imported datasets into census-like objects
- [x] Views
  - [x] Cards
  - [x] Details
  - [x] Hierarchy
  - [x] Table
  - [ ] Map
  - [x] Reports
    - [x] Language name overlap
    - [ ] Invalid languages
    - [ ] Locales that should be added
    - [ ] Metrics on the data we have
- [x] Interactivity
  - [x] Search
    - [x] By Code
    - [x] By Name, Endonym
    - [x] Highlight search
    - [x] For Hierarchy
    - [x] Using typeahead
    - [ ] When few results are shown, suggest alternatives
  - [x] Filter
    - [x] By Scope
    - [x] By Country
    - [x] Integrate in search bar
  - [x] Hovercard & Tooltips
    - [x] Related objects
    - [x] Field explanations
  - [x] Sort By: Population, Name, Code
  - [x] Limit
    - [x] Pagination
  - [x] Visual options
    - [x] Change locale separator (_ or -)
  - [ ] Selection
  - [ ] Export
- [ ] Manage data sources
  - [x] Show results based on different definitions of what a language is
    - [x] ISO, Glottolog, Inclusive
    - [x] Highlight language codes in each
  - [ ] Add a better guide for different kinds of users
- [x] About Page
  - [x] Introduction, how to use
  - [x] Acknowledgements
- [ ] Future ideas
  - [ ] Database-powered backend
  - [ ] Feedback mechanisms
  - [ ] Metrics

## License

- The code in this repository is licensed under the [MIT License](LICENSE).
- The language data, visualizations, and other content are licensed under [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).