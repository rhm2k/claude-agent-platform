#!/usr/bin/env node

/**
 * Demo 1: Hello World
 * 
 * Simplest demonstration of agent coordination.
 * Two agents work sequentially to create and translate a greeting.
 */

import { AgentCoordinator } from '../../src/core/agent-coordinator.js';
import { SimpleFramework } from '../../src/frameworks/simple-framework.js';
import chalk from 'chalk';

async function runHelloWorldDemo() {
  console.log(chalk.blue.bold('\n🌍 Claude Agent Platform - Hello World Demo\n'));

  // Initialize coordinator and framework
  const coordinator = new AgentCoordinator();
  await coordinator.initialize();

  const framework = new SimpleFramework({
    description: 'Hello World demonstration'
  });
  await framework.initialize(coordinator);

  // Monitor events
  coordinator.on('agent:spawned', ({ agentId, task }) => {
    console.log(chalk.green(`✓ Agent spawned: ${agentId}`));
    console.log(chalk.gray(`  Task: ${task}`));
  });

  coordinator.on('agent:completed', ({ agentId, results }) => {
    console.log(chalk.cyan(`✓ Agent completed: ${agentId}`));
    console.log(chalk.gray(`  Output: ${results.output}`));
  });

  framework.on('workflow:completed', ({ workflowId, results }) => {
    console.log(chalk.green.bold(`\n✨ Workflow completed: ${workflowId}`));
    console.log(chalk.white('\nFinal Results:'));
    Object.entries(results).forEach(([agent, result]) => {
      console.log(chalk.yellow(`  ${agent}: ${result.output}`));
    });
  });

  try {
    // Create workflow
    console.log(chalk.white('Creating hello world workflow...'));
    
    const workflow = await framework.createWorkflow('hello-world-demo', 'sequential', {
      tasks: [
        {
          agent: 'greeter',
          task: 'Create a friendly greeting message for the world'
        },
        {
          agent: 'translator',
          task: 'Translate the greeting to Spanish, French, and Japanese',
          passResults: true
        },
        {
          agent: 'formatter',
          task: 'Format all greetings into a beautiful display',
          passResults: true
        }
      ]
    });

    console.log(chalk.white(`\nWorkflow created: ${workflow.id}`));
    console.log(chalk.gray(`Type: ${workflow.type}`));
    console.log(chalk.gray(`Tasks: ${workflow.tasks.length}`));

    // Execute workflow
    console.log(chalk.white('\nExecuting workflow...'));
    const result = await framework.executeWorkflow(workflow.id);

    // Display execution time
    const duration = result.endTime - result.startTime;
    console.log(chalk.gray(`\nExecution time: ${duration}ms`));

    // Cleanup
    await framework.cleanup();
    await coordinator.cleanup();

    console.log(chalk.green.bold('\n✅ Demo completed successfully!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error.message);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runHelloWorldDemo().catch(console.error);
}