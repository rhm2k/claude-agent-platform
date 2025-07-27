# Framework Development Guide

## Overview

Frameworks in Claude Agent Platform define how agents coordinate to accomplish tasks. This guide shows you how to create custom frameworks for your specific needs.

## Basic Framework Structure

All frameworks must extend the `BaseFramework` class:

```javascript
import { BaseFramework } from '@claude-agent/core';

export class MyCustomFramework extends BaseFramework {
  async onInitialize() {
    // Framework-specific initialization
  }

  async createWorkflow(workflowId, type, config) {
    // Create workflow based on your framework's patterns
  }

  async executeWorkflow(workflowId) {
    // Execute workflow using your framework's logic
  }
}
```

## Required Methods

### `onInitialize()`
Called when the framework is initialized. Set up any framework-specific resources here.

```javascript
async onInitialize() {
  this.specialistAgents = new Map();
  this.workflowTemplates = new Map();
  console.log('My framework initialized');
}
```

### `createWorkflow(workflowId, type, config)`
Create a new workflow instance.

```javascript
async createWorkflow(workflowId, type, config = {}) {
  const workflow = {
    id: workflowId,
    type: type,
    status: 'initialized',
    created: new Date(),
    config: config,
    // Add framework-specific properties
  };

  this.workflows.set(workflowId, workflow);
  return workflow;
}
```

### `executeWorkflow(workflowId)`
Execute the workflow according to your framework's logic.

```javascript
async executeWorkflow(workflowId) {
  const workflow = this.workflows.get(workflowId);
  
  workflow.status = 'running';
  
  try {
    // Your execution logic here
    await this.runWorkflowStages(workflow);
    
    workflow.status = 'completed';
    this.emit('workflow:completed', { workflowId });
  } catch (error) {
    workflow.status = 'failed';
    workflow.error = error.message;
    throw error;
  }
  
  return workflow;
}
```

## Example: ML Training Framework

Here's a complete example of a machine learning training framework:

```javascript
import { BaseFramework } from '@claude-agent/core';

export class MLTrainingFramework extends BaseFramework {
  async onInitialize() {
    this.modelTypes = new Set(['classification', 'regression', 'clustering']);
    this.stages = ['data-prep', 'training', 'evaluation', 'deployment'];
  }

  async createWorkflow(workflowId, modelType, config = {}) {
    if (!this.modelTypes.has(modelType)) {
      throw new Error(`Unsupported model type: ${modelType}`);
    }

    const workflow = {
      id: workflowId,
      type: modelType,
      status: 'initialized',
      created: new Date(),
      config: config,
      dataset: config.dataset,
      hyperparameters: config.hyperparameters || {},
      stages: this.stages.map(stage => ({
        name: stage,
        status: 'pending',
        agents: this.getAgentsForStage(stage, modelType)
      })),
      results: {}
    };

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  async executeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    workflow.status = 'running';

    try {
      for (const stage of workflow.stages) {
        console.log(`Executing stage: ${stage.name}`);
        
        // Run agents for this stage
        if (stage.name === 'training' && workflow.config.parallel) {
          await this.runParallelTraining(workflow, stage);
        } else {
          await this.runSequentialStage(workflow, stage);
        }
        
        stage.status = 'completed';
      }

      // Final model selection if multiple were trained
      if (workflow.config.parallel) {
        await this.selectBestModel(workflow);
      }

      workflow.status = 'completed';
      this.emit('workflow:completed', { workflowId, results: workflow.results });

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      throw error;
    }

    return workflow;
  }

  getAgentsForStage(stage, modelType) {
    const agents = {
      'data-prep': ['data-cleaner', 'feature-engineer'],
      'training': modelType === 'classification' 
        ? ['classifier-trainer'] 
        : ['regressor-trainer'],
      'evaluation': ['model-evaluator', 'metrics-calculator'],
      'deployment': ['model-packager', 'api-deployer']
    };

    return agents[stage] || [];
  }

  async runSequentialStage(workflow, stage) {
    for (const agentType of stage.agents) {
      const agentId = `${workflow.id}-${stage.name}-${agentType}`;
      
      const task = this.createMLTask(workflow, stage, agentType);
      await this.spawnAgent(agentId, task);
      
      // Wait for completion
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      workflow.results[agentType] = status.results;
    }
  }

  async runParallelTraining(workflow, stage) {
    // Train multiple models in parallel with different hyperparameters
    const variants = this.generateHyperparameterVariants(workflow.hyperparameters);
    
    const trainingPromises = variants.map(async (params, index) => {
      const agentId = `${workflow.id}-trainer-variant-${index}`;
      const task = `Train model variant ${index} with params: ${JSON.stringify(params)}`;
      
      await this.spawnAgent(agentId, task);
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      return { variant: index, params, results: status.results };
    });

    const results = await Promise.all(trainingPromises);
    workflow.results.trainingVariants = results;
  }

  createMLTask(workflow, stage, agentType) {
    const taskTemplates = {
      'data-cleaner': `Clean dataset ${workflow.dataset}: handle missing values, outliers`,
      'feature-engineer': `Engineer features for ${workflow.type} model`,
      'classifier-trainer': `Train classification model with params: ${JSON.stringify(workflow.hyperparameters)}`,
      'model-evaluator': `Evaluate model performance on test set`,
      'model-packager': `Package model for deployment`
    };

    return taskTemplates[agentType] || `Execute ${agentType} for ${stage.name}`;
  }

  generateHyperparameterVariants(baseParams) {
    // Generate variations for parallel training
    return [
      { ...baseParams, learning_rate: 0.001 },
      { ...baseParams, learning_rate: 0.01 },
      { ...baseParams, learning_rate: 0.1 }
    ];
  }

  async selectBestModel(workflow) {
    const agentId = `${workflow.id}-model-selector`;
    await this.spawnAgent(agentId, 'Select best performing model from variants');
    
    await this.waitForAgent(agentId);
    
    const status = await this.coordinator.getAgentStatus(agentId);
    workflow.results.selectedModel = status.results;
  }

  async waitForAgent(agentId, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.coordinator.getAgentStatus(agentId);
      
      if (status.status === 'completed') {
        return true;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Agent ${agentId} failed`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Agent ${agentId} timed out`);
  }
}
```

## Best Practices

### 1. Use Events
Emit events for important framework activities:

```javascript
this.emit('stage:started', { stage: stageName });
this.emit('stage:completed', { stage: stageName, results });
this.emit('framework:error', { error });
```

### 2. Validate Configuration
Always validate workflow configurations:

```javascript
async createWorkflow(workflowId, type, config) {
  // Validate required fields
  if (!config.requiredField) {
    throw new Error('Missing required field: requiredField');
  }
  
  // Validate types
  if (!this.supportedTypes.includes(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
}
```

### 3. Handle Errors Gracefully
Provide meaningful error messages and cleanup:

```javascript
try {
  await this.riskyOperation();
} catch (error) {
  // Log detailed error
  console.error(`Framework error in ${this.constructor.name}:`, error);
  
  // Clean up any partial state
  await this.cleanup(workflowId);
  
  // Re-throw with context
  throw new Error(`${this.constructor.name} failed: ${error.message}`);
}
```

### 4. Support Different Execution Patterns
Allow flexibility in how agents execute:

```javascript
if (stage.parallel) {
  await this.executeParallel(stage.agents);
} else if (stage.sequential) {
  await this.executeSequential(stage.agents);
} else if (stage.custom) {
  await this.executeCustomPattern(stage);
}
```

### 5. Provide Useful Metadata
Include helpful information about your framework:

```javascript
getMetadata() {
  return {
    name: this.constructor.name,
    version: '1.0.0',
    description: 'ML training pipeline framework',
    supportedTypes: Array.from(this.modelTypes),
    requiredConfig: ['dataset', 'modelType'],
    optionalConfig: ['hyperparameters', 'parallel']
  };
}
```

## Testing Your Framework

Create tests for your framework:

```javascript
import { MyCustomFramework } from './my-custom-framework.js';
import { AgentCoordinator } from '@claude-agent/core';

describe('MyCustomFramework', () => {
  let framework;
  let coordinator;

  beforeEach(async () => {
    coordinator = new AgentCoordinator();
    framework = new MyCustomFramework();
    await coordinator.initialize();
    await framework.initialize(coordinator);
  });

  test('creates workflow correctly', async () => {
    const workflow = await framework.createWorkflow('test-1', 'type1', {
      config: 'value'
    });

    expect(workflow.id).toBe('test-1');
    expect(workflow.type).toBe('type1');
  });

  test('executes workflow successfully', async () => {
    const workflow = await framework.createWorkflow('test-2', 'type1', {
      tasks: ['task1', 'task2']
    });

    const result = await framework.executeWorkflow(workflow.id);
    
    expect(result.status).toBe('completed');
    expect(result.results).toBeDefined();
  });
});
```

## Publishing Your Framework

Once your framework is ready:

1. **Document it thoroughly** - Include examples and use cases
2. **Add to npm** - Publish as `@claude-agent/framework-[name]`
3. **Share examples** - Create demo scripts
4. **Engage community** - Share in discussions and get feedback

## Summary

Creating custom frameworks allows you to:
- Define domain-specific coordination patterns
- Encapsulate complex workflows
- Share reusable solutions with the community
- Build on top of robust agent coordination infrastructure

Start with the `SimpleFramework` as a reference, then add your domain-specific logic!