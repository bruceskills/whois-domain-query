# Whois CLI

An example project to demonstrate the creation of a CLI using Node.js.

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/npm/v/whois-domain-query)
![License](https://img.shields.io/badge/license-MIT-blue)


### Repository

[Whois CLI](https://github.com/bruceskills/whois-domain-query)


### Table of Content
- [Technologies](#technologies)
- [Commits](#commits)
- [Maintainers](#maintainers)


### Technologies

- [Node.js](https://nodejs.org/pt)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)


1 - Clone the repository:

```bash
git clone https://github.com/bruceskills/whois-domain-query
cd whois-domain-query
```

2 - Install the dependencies:

```bash
npm install
# ou
yarn
# ou
pnpm install
```

3 - Link the project globally to make the `whois-cli` command available on your system:

```bash
npm link
```
This step allows you to run the `whois-cli` command from anywhere in your terminal.


4 - How to use

```bash
# Example
whois-cli --domain google.com
```


### Commits
This project uses the [Commitizen](https://commitizen-tools.github.io/commitizen/) for standardization of commit messages.

How to commit

```bash
# ------------------------------------------------------------- #
# Add your changes as normal:
# ------------------------------------------------------------- #
git add .

# ------------------------------------------------------------- #
# Then, instead of using git commit -m "...", run:
# ------------------------------------------------------------- #
npx git-cz
```

### Contributing

Contributions are welcome! Please feel free to fork the repository, make changes, and submit pull requests.

### Code of Conduct
Be respectful, keep discussions constructive, follow GitHub rules.


### Maintainers

- Bruno César - [Bruce](https://github.com/bruceskills)
