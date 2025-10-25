# LUIZA MOTA - VTEX IO

Repositório da loja Luiza Mota.

## Run Locally

Clone the project

```bash
  git clone 'link do repositório'
```

Install dependencies

```bash
  yarn
```

Start build css

```bash
  yarn build:scss--store
```

Create new branch

```bash
  git checkout -b 'taskNumber/taskName'
```

All new commit

```bash
  git commit -m 'taskNumber - commitTitle'
```

VTEX login

```bash
  vtex login luizamota
```

VTEX change workspace

```bash
  vtex use 'new workspace name'
```

VTEX verify workspace

```bash
  vtex whoami
```

VTEX push changes and hot reload

```bash
  vtex link
```

Start with all commands

```bash
  first terminal = yarn && vtex login luizamota && vtex use task0000 && vtex link
  second terminal = yarn build:scss--store
```

## Technologies

- **Git**: 2.50.1
- **NVM**: 1.1.12
- **NodeJS**: 18.20.8
- **VTEX-CLI**: vtex/4.2.2 win32-x64 node-v20.16.0

## Libraries

- **autoprefixer**: 10.x,
- **chokidar**: 3.x,
- **concurrently**: 8.x,
- **eslint**: 8.x,
- **eslint-config-airbnb-base**: 15.x,
- **eslint-config-prettier**: 8.x,
- **eslint-plugin-import**: 2.x,
- **eslint-plugin-prettier**: 4.x,
- **glob**: 10.x,
- **postcss**: 8.x,
- **postcss-cli**: 10.x,
- **prettier**: 2.x,
- **sass**: 1.x

## VSCode Extensions

- Brazilian Portuguese - Code Spell Checker (Street Side Software)
- Code Spell Checker (Street Side Software)
- ESLint (Microsoft)
- Prettier - Code formatter (Prettier)
- Sass (Syler)
- VTEX IO Intellisense (Agencia E-plus)

## Tech Stack

**Client:** VTEX IO, React

## Global Installation

[Git Installer](https://git-scm.com/)

[VSCode Installer](https://code.visualstudio.com/)

[NVM Repository](https://github.com/nvm-sh/nvm)

[VTEX Installer](https://developers.vtex.com/vtex-developer-docs/docs/vtex-io-documentation-vtex-io-cli-install)

## REFERENCES

[FIGMA HOME](https://www.figma.com/proto/Nl9xCKtuYhszLAqUy6YNwd/Projeto-Luiza-Mota?page-id=15561%3A4&node-id=19263-30587&p=f&viewport=1115%2C697%2C0.1&t=veM8dvxTn2JOVa73-1&scaling=scale-down&content-scaling=fixed)

[FIGMA PDP](https://www.figma.com/proto/Nl9xCKtuYhszLAqUy6YNwd/Projeto-Luiza-Mota?page-id=15562%3A34559&node-id=15562-34762&viewport=1115%2C697%2C0.1&t=gMMRi3OpdfM5KAzi-1&scaling=scale-down&content-scaling=fixed)

[FIGMA CHECKOUT](https://www.figma.com/proto/Nl9xCKtuYhszLAqUy6YNwd/Projeto-Luiza-Mota?page-id=15562%3A27601&node-id=19215-26663&p=f&viewport=152%2C-399%2C0.61&t=vusgD7zK1pJDLjFK-1&scaling=scale-down&content-scaling=fixed)

[FIGMA DEPARTMENT](https://www.figma.com/proto/Nl9xCKtuYhszLAqUy6YNwd/Projeto-Luiza-Mota?page-id=19311%3A10332&node-id=19311-12800&p=f&viewport=412%2C77%2C0.21&t=CjReRfQbUdRNTceX-1&scaling=scale-down&content-scaling=fixed)

[FIGMA MY ACCOUNT](https://www.figma.com/proto/Nl9xCKtuYhszLAqUy6YNwd/Projeto-Luiza-Mota?page-id=19331%3A13695&node-id=19331-16792&p=f&viewport=137%2C303%2C0.03&t=koT1DJrFPdiXWQJV-1&scaling=scale-down&content-scaling=fixed)

[FIGMA E-MAIL](https://www.figma.com/design/9E5uMzdY59QNgWxnHgmnvz/Projeto-Luiza-mota---Emails-transacionais?node-id=15486-1455&t=r4C6Wp5txYm7gVUM-1)

## OBSERVATIONS

**If your change doesn't start propagating to Workspace or Production, delete the css folder and run the build command again.**