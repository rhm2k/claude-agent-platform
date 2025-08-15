# Claude Agent Platform

A **simulation and demonstration platform** for multi-agent coordination patterns inspired by Anthropic's Claude Code sub-agent architecture. This platform provides a conceptual framework and working examples of how multiple AI agents could be coordinated across different domains.

**Important**: This is a simulation platform that demonstrates coordination patterns rather than implementing actual Claude Code sub-agents. Real sub-agents would use Claude Code's Task Tool with separate git worktrees.

## Overview

Claude Agent Platform demonstrates how to:
- 🤖 **Simulate** multi-agent coordination patterns and workflows
- 🔌 Design pluggable management frameworks for different domains  
- 🎯 Apply coordination patterns to diverse use cases (data pipelines, development workflows, ML training, etc.)
- 📊 Monitor and manage agent coordination through a unified event system
- 🧩 Build extensible architecture for multi-agent systems

## What This Platform Is

**This is a conceptual demonstration**, not a live multi-agent system. It simulates what coordinating multiple Claude Code sub-agents might look like by:

- **Simulating agent work** with `setTimeout()` and realistic result generation
- **Demonstrating coordination patterns** (sequential, parallel, hybrid workflows)
- **Showing framework architecture** for building real multi-agent systems
- **Providing working examples** of common coordination scenarios

## What This Platform Is NOT

- ❌ **Not using real Claude Code sub-agents** - no actual Task Tool calls
- ❌ **Not creating git worktrees** - no real agent isolation  
- ❌ **Not running actual AI models** - just simulated responses
- ❌ **Not a production system** - it's an architectural blueprint

## Quick Start

```bash
# Install the platform
npm install @claude-agent/core

# Install a framework
npm install @claude-agent/data-pipeline-framework

# Run a simple example
npm run demo:hello-world
```

## Architecture

The platform consists of:

### Core Platform (`@claude-agent/core`)
- **Agent Coordinator**: Manages multiple agent lifecycles
- **Message Protocol**: Inter-agent communication system
- **Plugin Registry**: Framework and plugin management
- **Event System**: Unified monitoring and hooks

### Framework Interface
- **Base Framework**: Abstract class for all management frameworks
- **Workflow Types**: Common workflow patterns (sequential, parallel, hybrid)
- **Plugin Interface**: Extensibility system

### Example Frameworks
- **Data Pipeline Framework**: For ETL and analytics workflows
- **Development Framework**: For software development governance
- **Simple Framework**: Basic agent coordination (included in demos)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/claude-agent-platform.git
cd claude-agent-platform

# Install dependencies
npm install

# Run tests
npm test

# Run demonstrations
npm run demo:all
```

## Usage Examples

### 1. Simple Agent Coordination

```javascript
import { AgentCoordinator, SimpleFramework } from '@claude-agent/core';

const coordinator = new AgentCoordinator();
const framework = new SimpleFramework();

// Create a simple workflow
const workflow = await framework.createWorkflow('hello-world', 'sequential', {
  tasks: [
    { agent: 'greeter', task: 'Say hello to the world' },
    { agent: 'translator', task: 'Translate greeting to Spanish' }
  ]
});

await framework.executeWorkflow(workflow.id);
```

### 2. Data Pipeline

```javascript
import { DataPipelineFramework } from '@claude-agent/data-pipeline-framework';

const pipeline = new DataPipelineFramework();

// Create streaming analytics pipeline
const workflow = await pipeline.createWorkflow('customer-analytics', 'streaming', {
  components: ['kafka-specialist', 'airflow-specialist', 'dbt-specialist'],
  domain: 'e-commerce'
});

await pipeline.executeWorkflow(workflow.id);
```

### 3. Custom Framework

```javascript
import { BaseFramework } from '@claude-agent/core';

class MLTrainingFramework extends BaseFramework {
  async createWorkflow(workflowId, type, config) {
    // Custom ML training workflow logic
  }
  
  async executeWorkflow(workflowId) {
    // Custom execution with ML-specific coordination
  }
}
```

## Demonstrations

Three simple demonstrations are included:

### 1. Hello World (`demos/01-hello-world/`)
Basic agent coordination with simple task handoff.

### 2. Math Pipeline (`demos/02-math-pipeline/`)
Multi-agent mathematical computation pipeline demonstrating parallel processing.

### 3. Document Processor (`demos/03-document-processor/`)
Document analysis workflow showing sequential processing with review stages.

Run all demos:
```bash
npm run demo:all
```

## Framework Development

To create your own framework:

1. Extend `BaseFramework`
2. Implement required methods
3. Register with the platform
4. Share with the community!

See the [Framework Development Guide](docs/framework-development.md) for details.

## Plugin System

Extend any framework with plugins:

```javascript
class MonitoringPlugin extends FrameworkPlugin {
  onRegister(framework) {
    // Add monitoring capabilities to any framework
  }
}
```

## Use Cases

- 📊 **Data Engineering**: ETL pipelines, streaming analytics
- 💻 **Software Development**: Code review workflows, CI/CD coordination
- 🤖 **ML Operations**: Training pipelines, model deployment
- 📝 **Content Processing**: Document analysis, translation workflows
- 🏭 **Business Automation**: Multi-step business processes
- 🔬 **Research Workflows**: Experiment coordination, data analysis

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Documentation

- [Getting Started](docs/getting-started.md)
- [Core Concepts](docs/core-concepts.md)
- [Framework Development](docs/framework-development.md)
- [API Reference](docs/api-reference.md)
- [Examples](examples/)

## License

MIT License - see [LICENSE](LICENSE) file.

## Acknowledgments

Inspired by [Anthropic's Claude Code](https://claude.ai/code) sub-agent architecture, but implemented as a simulation for learning and demonstration purposes.

---

**Note**: This is a general-purpose platform. For specific use cases, see our framework marketplace or develop your own!