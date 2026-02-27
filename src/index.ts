#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';
import prompts from 'prompts';

// Recipe interfaces
interface Poolish {
  flour: number;
  water: number;
  yeast: number;
}

interface Recipe {
  poolish: Poolish;
  flour: number;
  water: number;
  salt: number;
  yeast?: number;
}

// Base recipe for 2x 14" pizzas
const BASE_RECIPE: Recipe = {
  poolish: {
    flour: 400,
    water: 400,
    yeast: 0.5,
  },
  flour: 600,
  water: 270,
  salt: 24,
  yeast: 0.5,
};

// Calculate total weight of a recipe
function totalWeight(recipe: Recipe): number {
  const poolishWeight = recipe.poolish.flour + recipe.poolish.water + recipe.poolish.yeast;
  return poolishWeight + recipe.flour + recipe.water + recipe.salt + (recipe.yeast || 0);
}

// Scale recipe by a factor
function scaleRecipe(recipe: Recipe, factor: number): Recipe {
  return {
    poolish: {
      flour: recipe.poolish.flour * factor,
      water: recipe.poolish.water * factor,
      yeast: recipe.poolish.yeast * factor,
    },
    flour: recipe.flour * factor,
    water: recipe.water * factor,
    salt: recipe.salt * factor,
    yeast: recipe.yeast ? recipe.yeast * factor : undefined,
  };
}

// Format number for display
function fmt(num: number): string {
  return Math.round(num).toString();
}

// Print recipe with colors
function printRecipe(recipe: Recipe): void {
  console.log(chalk.bold.cyan('\n🍕 ZAZA Pizza Dough Recipe\n'));
  console.log(chalk.bold.yellow('Poolish (Pre-ferment):'));
  console.log(chalk.white(`  Flour:   ${fmt(recipe.poolish.flour)}g`));
  console.log(chalk.white(`  Water:   ${fmt(recipe.poolish.water)}g`));
  console.log(chalk.white(`  Yeast:   ${fmt(recipe.poolish.yeast)}g`));
  console.log(chalk.bold.yellow('\nMain Dough:'));
  console.log(chalk.white(`  Flour:   ${fmt(recipe.flour)}g`));
  console.log(chalk.white(`  Water:   ${fmt(recipe.water)}g`));
  console.log(chalk.white(`  Salt:    ${fmt(recipe.salt)}g`));
  if (recipe.yeast) {
    console.log(chalk.white(`  Yeast:   ${fmt(recipe.yeast)}g`));
  }
  console.log(chalk.bold.gray(`\nTotal Weight: ${fmt(totalWeight(recipe))}g`));
  console.log('');
}

// Interactive mode
async function interactiveMode(): Promise<void> {
  const response = await prompts([
    {
      type: 'select',
      name: 'mode',
      message: 'What would you like to calculate?',
      choices: [
        { title: 'By pizza size', value: 'size' },
        { title: 'By number of pizzas', value: 'number' },
        { title: 'By target weight', value: 'weight' },
      ],
    },
  ]);

  let recipe: Recipe;
  let factor: number;

  if (response.mode === 'size') {
    const sizeResponse = await prompts({
      type: 'number',
      name: 'size',
      message: 'Pizza diameter (inches)?',
      initial: 14,
    });
    const baseArea = Math.PI * Math.pow(7, 2); // 14" = 14/2 radius
    const targetArea = Math.PI * Math.pow(sizeResponse.size / 2, 2);
    factor = targetArea / baseArea / 2; // Base recipe is 2x 14"
  } else if (response.mode === 'number') {
    const numResponse = await prompts({
      type: 'number',
      name: 'number',
      message: 'How many 14" pizzas?',
      initial: 2,
    });
    factor = numResponse.number / 2;
  } else {
    const weightResponse = await prompts({
      type: 'number',
      name: 'weight',
      message: 'Target total dough weight (grams)?',
      initial: 1688,
    });
    factor = weightResponse.weight / totalWeight(BASE_RECIPE);
  }

  const spinner = ora('Calculating your dough...').start();
  recipe = scaleRecipe(BASE_RECIPE, factor);
  spinner.stop();
  printRecipe(recipe);
}

// CLI setup
const program = new Command();

program
  .name('zaza')
  .description('A pizza dough calculator CLI tool')
  .version('1.0.0');

program
  .option('--size <inches>', 'Pizza diameter in inches')
  .option('--number <count>', 'Number of 14" pizzas')
  .option('--weight <grams>', 'Target total dough weight in grams')
  .action((options) => {
    if (options.size || options.number || options.weight) {
      const spinner = ora('Calculating your dough...').start();
      let recipe: Recipe;

      if (options.size) {
        const size = parseFloat(options.size);
        const baseArea = Math.PI * Math.pow(7, 2);
        const targetArea = Math.PI * Math.pow(size / 2, 2);
        const factor = targetArea / baseArea / 2;
        recipe = scaleRecipe(BASE_RECIPE, factor);
      } else if (options.number) {
        const number = parseFloat(options.number);
        const factor = number / 2;
        recipe = scaleRecipe(BASE_RECIPE, factor);
      } else {
        const weight = parseFloat(options.weight);
        const factor = weight / totalWeight(BASE_RECIPE);
        recipe = scaleRecipe(BASE_RECIPE, factor);
      }

      spinner.stop();
      printRecipe(recipe);
    } else {
      interactiveMode().catch(console.error);
    }
  });

program.parse(process.argv);
