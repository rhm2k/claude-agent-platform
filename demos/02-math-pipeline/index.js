#!/usr/bin/env node

/**
 * Demo 2: Math Pipeline
 * 
 * Demonstrates parallel processing with a mathematical computation pipeline.
 * Multiple agents work in parallel to solve different aspects of a problem.
 */

import { AgentCoordinator } from '../../src/core/agent-coordinator.js';
import { SimpleFramework } from '../../src/frameworks/simple-framework.js';
import chalk from 'chalk';

async function runMathPipelineDemo() {
  console.log(chalk.blue.bold('\n🔢 Claude Agent Platform - Math Pipeline Demo\n'));

  // Initialize
  const coordinator = new AgentCoordinator();
  await coordinator.initialize();

  const framework = new SimpleFramework({
    description: 'Mathematical computation pipeline'
  });
  await framework.initialize(coordinator);

  // Enhanced monitoring
  let activeAgents = 0;
  
  coordinator.on('agent:spawned', ({ agentId }) => {
    activeAgents++;
    console.log(chalk.green(`✓ Agent spawned: ${agentId}`));
    console.log(chalk.gray(`  Active agents: ${activeAgents}`));
  });

  coordinator.on('agent:completed', ({ agentId, results }) => {
    activeAgents--;
    console.log(chalk.cyan(`✓ Agent completed: ${agentId}`));
    console.log(chalk.gray(`  Output: ${results.output}`));
    console.log(chalk.gray(`  Remaining agents: ${activeAgents}`));
  });

  try {
    // Scenario 1: Parallel computation
    console.log(chalk.white.bold('Scenario 1: Parallel Computation'));
    console.log(chalk.gray('Multiple agents solving different math problems simultaneously\n'));

    const parallelWorkflow = await framework.createWorkflow('math-parallel', 'parallel', {
      tasks: [
        {
          agent: 'prime-calculator',
          task: 'Find all prime numbers between 1 and 100'
        },
        {
          agent: 'fibonacci-generator',
          task: 'Generate the first 20 Fibonacci numbers'
        },
        {
          agent: 'statistics-analyzer',
          task: 'Calculate mean, median, and mode of [23, 45, 67, 23, 89, 12, 45, 67, 89, 23]'
        },
        {
          agent: 'geometry-solver',
          task: 'Calculate area and perimeter of a circle with radius 7'
        }
      ]
    });

    const startTime = Date.now();
    await framework.executeWorkflow(parallelWorkflow.id);
    const parallelTime = Date.now() - startTime;

    console.log(chalk.yellow(`\n⚡ Parallel execution completed in ${parallelTime}ms`));

    // Scenario 2: Sequential pipeline with dependencies
    console.log(chalk.white.bold('\n\nScenario 2: Sequential Pipeline'));
    console.log(chalk.gray('Agents building on each other\'s results\n'));

    const sequentialWorkflow = await framework.createWorkflow('math-sequential', 'sequential', {
      tasks: [
        {
          agent: 'number-generator',
          task: 'Generate 5 random numbers between 1 and 50',
          passResults: true
        },
        {
          agent: 'sorter',
          task: 'Sort the numbers in ascending order',
          passResults: true
        },
        {
          agent: 'analyzer',
          task: 'Calculate sum, average, and standard deviation',
          passResults: true
        },
        {
          agent: 'reporter',
          task: 'Create a summary report of all calculations'
        }
      ]
    });

    const seqStartTime = Date.now();
    await framework.executeWorkflow(sequentialWorkflow.id);
    const sequentialTime = Date.now() - seqStartTime;

    console.log(chalk.yellow(`\n⏱️  Sequential execution completed in ${sequentialTime}ms`));

    // Compare performance
    console.log(chalk.white.bold('\n📊 Performance Comparison:'));
    console.log(chalk.gray(`  Parallel workflow (4 agents): ${parallelTime}ms`));
    console.log(chalk.gray(`  Sequential workflow (4 agents): ${sequentialTime}ms`));
    console.log(chalk.green(`  Speedup factor: ${(sequentialTime / parallelTime).toFixed(2)}x`));

    // Show statistics
    const stats = coordinator.getStatistics();
    console.log(chalk.white.bold('\n📈 Session Statistics:'));
    console.log(chalk.gray(`  Total agents created: ${stats.totalAgents}`));
    console.log(chalk.gray(`  Completed successfully: ${stats.completedAgents}`));

    // Cleanup
    await framework.cleanup();
    await coordinator.cleanup();

    console.log(chalk.green.bold('\n✅ Math Pipeline demo completed!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error.message);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runMathPipelineDemo().catch(console.error);
}