# Getting Started with Claude Agent Platform

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/claude-agent-platform.git
cd claude-agent-platform

# Install dependencies
npm install

# Run the demos
npm run demo:all
```

## Basic Concepts

### 1. Agent Coordinator
The core component that manages agent lifecycles, communication, and task distribution.

```javascript
import { AgentCoordinator } from '@claude-agent/core';

const coordinator = new AgentCoordinator();
await coordinator.initialize();
```

### 2. Frameworks
Management frameworks define how agents work together. Use built-in frameworks or create your own.

```javascript
import { SimpleFramework } from '@claude-agent/core';

const framework = new SimpleFramework();
await framework.initialize(coordinator);
```

### 3. Workflows
Workflows define the tasks and execution patterns for your agents.

```javascript
const workflow = await framework.createWorkflow('my-workflow', 'sequential', {
  tasks: [
    { agent: 'agent1', task: 'Do something' },
    { agent: 'agent2', task: 'Do something else' }
  ]
});

await framework.executeWorkflow(workflow.id);
```

## Quick Example

```javascript
import { AgentCoordinator, SimpleFramework } from '@claude-agent/core';

async function runExample() {
  // Initialize platform
  const coordinator = new AgentCoordinator();
  const framework = new SimpleFramework();
  
  await coordinator.initialize();
  await framework.initialize(coordinator);

  // Create and execute workflow
  const workflow = await framework.createWorkflow('example', 'sequential', {
    tasks: [
      { agent: 'analyzer', task: 'Analyze the problem' },
      { agent: 'solver', task: 'Solve the problem' },
      { agent: 'reporter', task: 'Report the solution' }
    ]
  });

  const result = await framework.executeWorkflow(workflow.id);
  console.log('Results:', result.results);

  // Cleanup
  await framework.cleanup();
  await coordinator.cleanup();
}

runExample();
```

## Workflow Types

### Sequential Workflows
Agents execute one after another, optionally passing results.

```javascript
const workflow = await framework.createWorkflow('sequential-example', 'sequential', {
  tasks: [
    { agent: 'step1', task: 'First step', passResults: true },
    { agent: 'step2', task: 'Second step uses results from step1' }
  ]
});
```

### Parallel Workflows
Agents execute simultaneously for faster processing.

```javascript
const workflow = await framework.createWorkflow('parallel-example', 'parallel', {
  tasks: [
    { agent: 'worker1', task: 'Process data set 1' },
    { agent: 'worker2', task: 'Process data set 2' },
    { agent: 'worker3', task: 'Process data set 3' }
  ]
});
```

## Event System

Monitor agent and workflow events:

```javascript
coordinator.on('agent:spawned', ({ agentId, task }) => {
  console.log(`Agent ${agentId} started: ${task}`);
});

coordinator.on('agent:completed', ({ agentId, results }) => {
  console.log(`Agent ${agentId} completed`);
});

framework.on('workflow:completed', ({ workflowId, results }) => {
  console.log(`Workflow ${workflowId} finished`);
});
```

## Next Steps

- Explore the [demos](../demos/) for more examples
- Learn about [creating custom frameworks](framework-development.md)
- Read the [API reference](api-reference.md)
- Join the community and share your frameworks!