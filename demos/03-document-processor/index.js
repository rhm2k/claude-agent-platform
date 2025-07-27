#!/usr/bin/env node

/**
 * Demo 3: Document Processor
 * 
 * Demonstrates a more complex workflow with document analysis,
 * including conditional logic and review stages.
 */

import { AgentCoordinator } from '../../src/core/agent-coordinator.js';
import { SimpleFramework } from '../../src/frameworks/simple-framework.js';
import chalk from 'chalk';

// Extended framework with review capabilities
class DocumentFramework extends SimpleFramework {
  async executeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'running';
    workflow.startTime = new Date();

    try {
      // Document processing stages
      console.log(chalk.white.bold('\n📄 Document Processing Pipeline\n'));

      // Stage 1: Analysis
      console.log(chalk.yellow('Stage 1: Document Analysis'));
      await this.executeStage(workflow, workflow.config.stages.analysis);

      // Stage 2: Processing
      console.log(chalk.yellow('\nStage 2: Content Processing'));
      await this.executeStage(workflow, workflow.config.stages.processing);

      // Stage 3: Review
      console.log(chalk.yellow('\nStage 3: Quality Review'));
      await this.executeStage(workflow, workflow.config.stages.review);

      // Stage 4: Finalization
      console.log(chalk.yellow('\nStage 4: Finalization'));
      await this.executeStage(workflow, workflow.config.stages.finalization);

      workflow.status = 'completed';
      workflow.endTime = new Date();
      this.emit('workflow:completed', { workflowId, results: workflow.results });

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      throw error;
    }

    return workflow;
  }

  async executeStage(workflow, stage) {
    console.log(chalk.gray(`  ${stage.description}`));
    
    if (stage.parallel) {
      await this.executeParallelTasks(workflow, stage.tasks);
    } else {
      await this.executeSequentialTasks(workflow, stage.tasks);
    }
  }

  async executeSequentialTasks(workflow, tasks) {
    for (const task of tasks) {
      const agentId = `${workflow.id}-${task.agent}`;
      console.log(chalk.cyan(`    → ${task.agent}: ${task.task}`));
      
      await this.spawnAgent(agentId, task.task);
      workflow.agents.push(agentId);
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      workflow.results[task.agent] = status.results;
    }
  }

  async executeParallelTasks(workflow, tasks) {
    const promises = tasks.map(async (task) => {
      const agentId = `${workflow.id}-${task.agent}`;
      console.log(chalk.cyan(`    ⇉ ${task.agent}: ${task.task}`));
      
      await this.spawnAgent(agentId, task.task);
      workflow.agents.push(agentId);
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      workflow.results[task.agent] = status.results;
    });

    await Promise.all(promises);
  }
}

async function runDocumentProcessorDemo() {
  console.log(chalk.blue.bold('\n📋 Claude Agent Platform - Document Processor Demo\n'));

  // Initialize
  const coordinator = new AgentCoordinator();
  await coordinator.initialize();

  const framework = new DocumentFramework({
    description: 'Document processing and analysis pipeline'
  });
  await framework.initialize(coordinator);

  // Progress tracking
  let completedTasks = 0;
  const totalTasks = 10; // Total number of agents in the workflow

  coordinator.on('agent:completed', ({ agentId, results }) => {
    completedTasks++;
    const progress = Math.round((completedTasks / totalTasks) * 100);
    console.log(chalk.green(`    ✓ Completed (${progress}%)`));
  });

  try {
    // Create document processing workflow
    const workflow = await framework.createWorkflow('document-processor', 'custom', {
      documentType: 'technical-report',
      stages: {
        analysis: {
          description: 'Initial document analysis',
          parallel: true,
          tasks: [
            {
              agent: 'structure-analyzer',
              task: 'Analyze document structure: sections, headings, paragraphs'
            },
            {
              agent: 'language-detector',
              task: 'Detect document language and writing style'
            },
            {
              agent: 'metadata-extractor',
              task: 'Extract metadata: author, date, version, keywords'
            }
          ]
        },
        processing: {
          description: 'Content processing and enhancement',
          parallel: false,
          tasks: [
            {
              agent: 'content-validator',
              task: 'Validate content structure and completeness'
            },
            {
              agent: 'reference-checker',
              task: 'Verify all references and citations'
            },
            {
              agent: 'grammar-checker',
              task: 'Check grammar and suggest improvements'
            }
          ]
        },
        review: {
          description: 'Quality assurance review',
          parallel: true,
          tasks: [
            {
              agent: 'technical-reviewer',
              task: 'Review technical accuracy and completeness'
            },
            {
              agent: 'style-reviewer',
              task: 'Review writing style and consistency'
            }
          ]
        },
        finalization: {
          description: 'Final processing and output generation',
          parallel: false,
          tasks: [
            {
              agent: 'report-generator',
              task: 'Generate comprehensive analysis report'
            },
            {
              agent: 'summary-creator',
              task: 'Create executive summary of findings'
            }
          ]
        }
      }
    });

    console.log(chalk.white('Document Processing Workflow Configuration:'));
    console.log(chalk.gray(`  Document Type: ${workflow.config.documentType}`));
    console.log(chalk.gray(`  Total Stages: ${Object.keys(workflow.config.stages).length}`));
    console.log(chalk.gray(`  Total Agents: ${totalTasks}`));

    // Execute workflow
    const startTime = Date.now();
    const result = await framework.executeWorkflow(workflow.id);
    const duration = Date.now() - startTime;

    // Display results summary
    console.log(chalk.white.bold('\n📊 Processing Results Summary:\n'));
    
    const stages = Object.keys(workflow.config.stages);
    stages.forEach(stageName => {
      console.log(chalk.yellow(`${stageName.charAt(0).toUpperCase() + stageName.slice(1)}:`));
      const stageTasks = workflow.config.stages[stageName].tasks;
      stageTasks.forEach(task => {
        const result = workflow.results[task.agent];
        if (result) {
          console.log(chalk.gray(`  • ${task.agent}: ${result.output}`));
        }
      });
      console.log('');
    });

    console.log(chalk.white.bold('📈 Performance Metrics:'));
    console.log(chalk.gray(`  Total execution time: ${duration}ms`));
    console.log(chalk.gray(`  Average time per agent: ${Math.round(duration / totalTasks)}ms`));
    console.log(chalk.gray(`  Parallel stages: 2 of 4`));
    console.log(chalk.gray(`  Sequential stages: 2 of 4`));

    // Cleanup
    await framework.cleanup();
    await coordinator.cleanup();

    console.log(chalk.green.bold('\n✅ Document Processor demo completed!\n'));

    // Key takeaways
    console.log(chalk.white.bold('🔑 Key Concepts Demonstrated:'));
    console.log(chalk.gray('  • Multi-stage workflows with mixed execution patterns'));
    console.log(chalk.gray('  • Parallel analysis for independent tasks'));
    console.log(chalk.gray('  • Sequential processing for dependent tasks'));
    console.log(chalk.gray('  • Custom framework extension for domain-specific needs'));
    console.log(chalk.gray('  • Progress tracking and performance monitoring\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Demo failed:'), error.message);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDocumentProcessorDemo().catch(console.error);
}