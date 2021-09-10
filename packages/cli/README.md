# 🥖 CPany - Competitive Programming Statistic

[![version](https://img.shields.io/npm/v/@cpany/cli?color=rgb%2850%2C203%2C86%29&label=cpany)](https://www.npmjs.com/package/@cpany/cli) [![Demo](https://img.shields.io/badge/Netlify-Demo-brightgreen)](https://cpany.netlify.app/) [![build-test](https://github.com/yjl9903/CPany/actions/workflows/build.yml/badge.svg)](https://github.com/yjl9903/CPany/actions/workflows/build.yml)

![Screen shot](./screenshot.jpeg)

## Getting Started

Use CPany template [@yjl9903/CPany-Template](https://github.com/yjl9903/CPany-Template) to create your own repository for data storage.

Update config file `cpany.yml`, and push the changes to Github. Then, Github Actions will automatically fetch data and push to your repository.

You can use Github Pages, Netlify, etc. to deploy generated static site.

### Netlify Deploy

The template repository has provided config file `netlify.toml`, so you can just add your repository to Netlify without any configuration.

### Github Pages Deploy

You can use this action [peaceiris/actions-gh-pages](https://github.com/marketplace/actions/github-pages-action) to deploy your site.

Update the action configuration on `.github/workflows/update.yml`:

```yml
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup node
        uses: actions/setup-node@v1
        with:
          node-version: 14
      - name: Fetch data
        uses: yjl9903/CPany@v0.0.35
      - run: npm install
      - run: npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Run locally

Install [Node.js >= 14](https://nodejs.org/).

Run one of the following commands to install [@cpany/cli](https://www.npmjs.com/package/@cpany/cli) globally.

```bash
# npm
npm i -g @cpany/cli

# yarn
yarn global add @cpany/cli
```

Create an empty foler, and create `cpany.yml` in this new folder.

```bash
# prepare folder
mkdir cpany-data
cd cpany-data
echo "users:" > cpany.yml
echo "  tourist:" >> cpany.yml
echo "    codeforces/handle: tourist" >> cpany.yml
```

Fetch data, and start your static site.

```bash
# fetch data
cpany action ./

# Start dev server
cpany dev

# Build static site
cpany build
```

## License

MIT License © 2021 [XLor](https://github.com/yjl9903)
