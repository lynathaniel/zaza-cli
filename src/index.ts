#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import prompts from 'prompts';

// Recipe interfaces
interface Poolish {
  flour: number;
  water: number;
  yeast: number;
}

interface FlourBlend {
  breadFlour: number;  // 70%
  doubleZero: number;  // 30%
}

interface Recipe {
  flourBlend: FlourBlend;
  water: number;
  poolish: Poolish;
  yeast: number;
  sugar: number;
  diastaticMalt: number;
  salt: number;
  oliveOil: number;
}

// Base recipe for 1x 14" pizza
const BASE_RECIPE: Recipe = {
  flourBlend: { breadFlour: 138, doubleZero: 66 },
  water: 128.5,
  poolish: { flour: 23.5, water: 23.5, yeast: 0.055 },
  yeast: 0.14,
  sugar: 2.35,
  diastaticMalt: 1.4,
  salt: 4.7,
  oliveOil: 2.35,
};

const SIZE_12_FACTOR = (12 / 14) ** 2;  // Area scaling: ~0.735

// Calculate total weight of a recipe
function totalWeight(recipe: Recipe): number {
  const poolishWeight = recipe.poolish.flour + recipe.poolish.water + recipe.poolish.yeast;
  const flourBlendWeight = recipe.flourBlend.breadFlour + recipe.flourBlend.doubleZero;
  return poolishWeight + flourBlendWeight + recipe.water + recipe.yeast +
         recipe.sugar + recipe.diastaticMalt + recipe.salt + recipe.oliveOil;
}

// Scale recipe by a factor
function scaleRecipe(recipe: Recipe, factor: number): Recipe {
  return {
    flourBlend: {
      breadFlour: recipe.flourBlend.breadFlour * factor,
      doubleZero: recipe.flourBlend.doubleZero * factor,
    },
    water: recipe.water * factor,
    poolish: {
      flour: recipe.poolish.flour * factor,
      water: recipe.poolish.water * factor,
      yeast: recipe.poolish.yeast * factor,
    },
    yeast: recipe.yeast * factor,
    sugar: recipe.sugar * factor,
    diastaticMalt: recipe.diastaticMalt * factor,
    salt: recipe.salt * factor,
    oliveOil: recipe.oliveOil * factor,
  };
}

// Format number for display
function fmt(num: number, decimal_override?: number): string {
  const decimal = decimal_override ?? 1;
  return num.toFixed(decimal);
}

// Print recipe with specified format
function printRecipe(recipe: Recipe): void {
  console.log(chalk.bold.cyan('\nCareful! This recipe is fresh out of the oven!\n'));
  console.log(chalk.bold.yellow('Dough'));
  const flourBlendTotal = recipe.flourBlend.breadFlour + recipe.flourBlend.doubleZero;
  console.log(chalk.white(`- ${fmt(flourBlendTotal, 0)}g flour blend`));
  console.log(chalk.white(`- ${fmt(recipe.water, 0)}g water`));
  const poolishTotal = recipe.poolish.flour + recipe.poolish.water + recipe.poolish.yeast;
  console.log(chalk.white(`- ${fmt(poolishTotal)}g poolish`));
  console.log(chalk.white(`- ${fmt(recipe.yeast, 2)}g dry yeast`));
  console.log(chalk.white(`- ${fmt(recipe.sugar)}g sugar`));
  console.log(chalk.white(`- ${fmt(recipe.diastaticMalt)}g diastatic malt`));
  console.log(chalk.white(`- ${fmt(recipe.salt)}g salt`));
  console.log(chalk.white(`- ${fmt(recipe.oliveOil)}g olive oil`));
  console.log(chalk.bold.yellow('\nFlour Blend:'));
  console.log(chalk.white(`- ${fmt(recipe.flourBlend.breadFlour, 0)}g bread flour`));
  console.log(chalk.white(`- ${fmt(recipe.flourBlend.doubleZero, 0)}g 00 flour`));
  console.log(chalk.bold.yellow('\nPoolish:'));
  console.log(chalk.white(`- ${fmt(recipe.poolish.flour, 0)}g flour`));
  console.log(chalk.white(`- ${fmt(recipe.poolish.water, 0)}g water`));
  console.log(chalk.white(`- ${fmt(recipe.poolish.yeast, 2)}g dry yeast`));
  console.log(chalk.bold.yellow(`\nTotal Yield:`), chalk.bold.white(`${fmt(totalWeight(recipe), 0)}g`));
  console.log('');
}

// Interactive mode
async function interactiveMode(): Promise<void> {
  console.clear();
  console.log(chalk.bold.cyan('\n🍕 YAYA it\'s time for ZAZA 🍕\n'));

  // Handle Ctrl+C
  const handleExit = () => {
    process.stdout.write('\n');
    process.exit(0);
  };
  process.on('SIGINT', handleExit);

  try {
    await prompts({
      type: 'text',
      name: 'start',
      message: 'Press enter to start banging out some dough',
      onState: (state: any) => {
        if (state.aborted) {
          handleExit();
        }
      },
    });

    const sizeResponse = await prompts({
      type: 'select',
      name: 'size',
      message: 'What size pizza we lookin\' at today boss?',
      choices: [
        { title: '12 in.', value: 12 },
        { title: '14 in.', value: 14 },
      ],
      onState: (state: any) => {
        if (state.aborted) {
          handleExit();
        }
      },
    });

  var size = sizeResponse.size || 14;

  var numPizzas = 2;
  var validCount = false;

  while (!validCount) {
    const countResponse = await prompts({
      type: 'number',
      name: 'count',
      message: 'How many pies we slangin\'?',
      initial: 2,
    });

    numPizzas = countResponse.count || 0;

    if (numPizzas < 1) {
      console.log(chalk.red('whoa betch! stopa wastina myuh time! 🤌\n'));
    } else if (numPizzas > 8) {
      console.log(chalk.red('bruh chill tf out 💀\n'));
    } else {
      validCount = true;
    }
  }

    // Calculate factor based on size and number of pizzas
    const sizeFactor = size === 14 ? 1 : size === 12 ? SIZE_12_FACTOR : (size / 14) ** 2;
    const factor = sizeFactor * numPizzas;

    const recipe = scaleRecipe(BASE_RECIPE, factor);
    printRecipe(recipe);
  } finally {
    process.off('SIGINT', handleExit);
  }
}

// CLI setup
const program = new Command();

program
  .name('zaza')
  .description('A pizza dough calculator CLI tool')
  .version('1.0.0');

program
  .option('-s, --size <inches>', 'Pizza diameter in inches')
  .option('-n, --number <count>', 'Number of pizzas')
  .option('-y, --yield <grams>', 'Target total dough yield in grams')
  .action((options) => {
    const hasSize = options.size !== undefined;
    const hasNumber = options.number !== undefined;
    const hasWeight = options.weight !== undefined;

    if (hasWeight) {
      if (hasSize || hasNumber) {
        console.error(chalk.red('Error: --weight cannot be used with --size or --number'));
        process.exit(1);
      }
      const weight = parseFloat(options.weight);
      const factor = weight / totalWeight(BASE_RECIPE);
      const recipe = scaleRecipe(BASE_RECIPE, factor);
      printRecipe(recipe);
    } else if (hasSize && hasNumber) {
      const size = parseFloat(options.size);
      const number = parseFloat(options.number);
      const sizeFactor = size === 14 ? 1 : size === 12 ? SIZE_12_FACTOR : (size / 14) ** 2;
      const factor = sizeFactor * number;
      const recipe = scaleRecipe(BASE_RECIPE, factor);
      printRecipe(recipe);
    } else if (hasSize || hasNumber) {
      console.error(chalk.red('Error: --size and --number must be used together'));
      process.exit(1);
    } else {
      interactiveMode().catch(console.error);
    }
  });

program.parse(process.argv);
