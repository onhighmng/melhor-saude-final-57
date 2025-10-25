#!/usr/bin/env node

/**
 * Spec Kit Feature Implementation Script
 * 
 * This script helps implement features following the spec-driven development process.
 * It reads feature specifications and guides you through the implementation.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const FEATURES_DIR = path.join(__dirname, '..', 'features');

function listFeatures() {
  const features = fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  return features;
}

function readFeatureSpec(featureName) {
  const specPath = path.join(FEATURES_DIR, featureName, 'specification.md');
  const planPath = path.join(FEATURES_DIR, featureName, 'plan.md');
  const tasksPath = path.join(FEATURES_DIR, featureName, 'tasks.md');
  
  const spec = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf8') : null;
  const plan = fs.existsSync(planPath) ? fs.readFileSync(planPath, 'utf8') : null;
  const tasks = fs.existsSync(tasksPath) ? fs.readFileSync(tasksPath, 'utf8') : null;
  
  return { spec, plan, tasks };
}

function displayFeatureInfo(featureName) {
  const { spec, plan, tasks } = readFeatureSpec(featureName);
  
  console.log(`\n📋 Feature: ${featureName}`);
  console.log('='.repeat(50));
  
  if (spec) {
    console.log('\n📖 Specification:');
    console.log(spec.split('\n').slice(0, 10).join('\n'));
    if (spec.split('\n').length > 10) {
      console.log('... (truncated)');
    }
  }
  
  if (plan) {
    console.log('\n🏗️  Technical Plan:');
    console.log(plan.split('\n').slice(0, 5).join('\n'));
    if (plan.split('\n').length > 5) {
      console.log('... (truncated)');
    }
  }
  
  if (tasks) {
    const taskLines = tasks.split('\n').filter(line => line.startsWith('### Task'));
    console.log('\n✅ Available Tasks:');
    taskLines.forEach((line, index) => {
      console.log(`   ${index + 1}. ${line.replace('### ', '')}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
}

function displayTaskDetails(featureName, taskNumber) {
  const tasksPath = path.join(FEATURES_DIR, featureName, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    console.log('❌ No tasks file found for this feature.');
    return;
  }
  
  const tasks = fs.readFileSync(tasksPath, 'utf8');
  const taskSections = tasks.split('### Task');
  
  if (taskNumber < 1 || taskNumber >= taskSections.length) {
    console.log('❌ Invalid task number.');
    return;
  }
  
  const taskContent = taskSections[taskNumber];
  console.log(`\n📝 Task ${taskNumber} Details:`);
  console.log('='.repeat(50));
  console.log(taskContent);
  console.log('='.repeat(50));
}

function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 Spec Kit Feature Implementation Tool');
  console.log('=====================================\n');
  
  const features = listFeatures();
  
  if (features.length === 0) {
    console.log('❌ No features found in the features directory.');
    rl.close();
    return;
  }
  
  console.log('Available features:');
  features.forEach((feature, index) => {
    console.log(`   ${index + 1}. ${feature}`);
  });
  
  const featureChoice = await promptUser('\nSelect a feature (number): ');
  const featureIndex = parseInt(featureChoice) - 1;
  
  if (featureIndex < 0 || featureIndex >= features.length) {
    console.log('❌ Invalid feature selection.');
    rl.close();
    return;
  }
  
  const selectedFeature = features[featureIndex];
  displayFeatureInfo(selectedFeature);
  
  const action = await promptUser('\nWhat would you like to do? (view-tasks/implement/exit): ');
  
  switch (action.toLowerCase()) {
    case 'view-tasks':
      const taskChoice = await promptUser('Enter task number to view details: ');
      const taskNumber = parseInt(taskChoice);
      displayTaskDetails(selectedFeature, taskNumber);
      break;
      
    case 'implement':
      console.log('\n🎯 Implementation Guide:');
      console.log('1. Read the specification to understand what to build');
      console.log('2. Review the technical plan for implementation details');
      console.log('3. Follow the tasks in order, completing each one');
      console.log('4. Test your implementation against the success criteria');
      console.log('5. Document any changes or decisions made');
      console.log('\n💡 Tip: Start with the first task and work through them sequentially.');
      break;
      
    case 'exit':
      console.log('👋 Goodbye!');
      break;
      
    default:
      console.log('❌ Invalid action. Please choose view-tasks, implement, or exit.');
  }
  
  rl.close();
}

// Handle command line arguments
if (process.argv.length > 2) {
  const command = process.argv[2];
  const featureName = process.argv[3];
  
  switch (command) {
    case 'list':
      console.log('Available features:');
      listFeatures().forEach((feature, index) => {
        console.log(`   ${index + 1}. ${feature}`);
      });
      break;
      
    case 'info':
      if (featureName) {
        displayFeatureInfo(featureName);
      } else {
        console.log('Usage: node implement-feature.js info <feature-name>');
      }
      break;
      
    case 'task':
      const taskNumber = parseInt(process.argv[4]);
      if (featureName && taskNumber) {
        displayTaskDetails(featureName, taskNumber);
      } else {
        console.log('Usage: node implement-feature.js task <feature-name> <task-number>');
      }
      break;
      
    default:
      console.log('Available commands:');
      console.log('  list                    - List all features');
      console.log('  info <feature-name>     - Show feature information');
      console.log('  task <feature-name> <task-number> - Show task details');
      console.log('  (no args)               - Interactive mode');
  }
} else {
  main().catch(console.error);
}
