# zaza-cli

A pizza dough calculator CLI tool built with TypeScript.

## Installation

```bash
npm install -g zaza-cli
```

Or install from source:

```bash
git clone https://github.com/yourusername/zaza-cli.git
cd zaza-cli
npm install
npm run build
npm link
```

## Usage

### Interactive Mode

Just run `zaza` to enter interactive mode:

```bash
zaza
```

### CLI Mode

Calculate based on pizza size:

```bash
zaza --size 14
```

Calculate based on number of pizzas:

```bash
zaza --number 3
```

Calculate based on target weight:

```bash
zaza --weight 2000
```

## Features

- 🍕 Precise pizza dough calculations
- 🎨 Colorful terminal output
- 📊 Multiple calculation modes (size, number, weight)
- 🔄 Interactive prompts
- ⚡ Loading spinners
- 📦 Easy global install via npm

## Recipe

The CLI calculates both the poolish (pre-ferment) and main dough quantities to make perfect Neapolitan-style pizza dough.

## License

MIT
