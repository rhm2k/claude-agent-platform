# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Agent Platform is a **simulation and demonstration platform** for multi-agent coordination patterns inspired by Anthropic's Claude Code sub-agent architecture. 

**Important**: This is NOT a live multi-agent system. It simulates coordination patterns using JavaScript `setTimeout()` and realistic result generation to demonstrate how multiple Claude Code sub-agents could be orchestrated, without actually using Task Tools or git worktrees.

## Development Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Run all demos
npm run demo:all

# Run individual demos
npm run demo:hello-world
npm run demo:math-pipeline
npm run demo:document-processor
```

## Architecture Overview

### Core Structure

- **src/core/** - Core platform components
  - `agent-coordinator.js` - Manages agent lifecycle and task distribution using EventEmitter
  - `base-framework.js` - Abstract base class that all management frameworks must extend

- **src/frameworks/** - Framework implementations
  - `simple-framework.js` - Basic sequential/parallel coordination (included framework)

- **demos/** - Working demonstrations showing platform usage
  - Each demo is self-contained and can be run independently

### Key Concepts

**AgentCoordinator**: Central orchestrator that **simulates** agent spawning, message passing, and lifecycle. Agents are simulated with `setTimeout()` and realistic result generation. Agent states: idle → active → completed. Event-driven architecture with events: `agent:spawned`, `agent:completed`, `coordinator:initialized`.

**BaseFramework**: Abstract class providing workflow management. Subclasses must implement:
- `onInitialize()` - Framework setup
- `createWorkflow(workflowId, type, config)` - Workflow creation
- `executeWorkflow(workflowId)` - Workflow execution

**SimpleFramework**: Reference implementation supporting:
- `sequential` - Tasks execute one after another, with optional result passing
- `parallel` - Tasks execute concurrently using Promise.all

### Agent Communication (Simulated)

The platform simulates agent communication via message queues managed by the coordinator. Each simulated agent has a dedicated message queue. Messages include timestamp, sender, and recipient metadata. In a real implementation, this would be actual inter-process communication between Claude Code sub-agents in separate git worktrees.

## Framework Development

To create custom frameworks:

1. Extend `BaseFramework` class
2. Implement required abstract methods
3. Use `this.spawnAgent()` and `this.sendMessage()` for coordination
4. Emit events for monitoring: `workflow:completed`, `workflow:failed`
5. Handle cleanup in the `cleanup()` method

## Dependencies

- **chalk**: Terminal styling and colors
- **yaml**: YAML parsing (available for config files)
- **uuid**: UUID generation
- **jest**: Testing framework
- **eslint**: Code linting
- **prettier**: Code formatting

Node.js ≥18.0.0 required. Uses ES modules (`"type": "module"` in package.json).

## Event System

The platform uses Node.js EventEmitter pattern throughout. Key events:
- Coordinator: `coordinator:initialized`, `coordinator:cleanup`
- Agents: `agent:spawned`, `agent:completed`, `agent:terminated`
- Messages: `message:sent`
- Workflows: `workflow:completed`, `workflow:failed`
- Framework: `framework:initialized`

## Demo Structure

All demos follow the same pattern:
1. Initialize coordinator and framework
2. Set up event listeners for monitoring
3. Create workflow with task configuration
4. Execute workflow
5. Display results and cleanup

Each demo is executable with shebang (`#!/usr/bin/env node`) and includes error handling with chalk-styled output.

## Simulation vs Reality

This platform demonstrates coordination patterns but does NOT:
- Use actual Claude Code Task Tools  
- Create git worktrees for agent isolation
- Run real AI models or sub-agents
- Implement true inter-agent communication

Instead, it simulates these concepts to demonstrate:
- How multi-agent workflows could be structured
- Event-driven coordination patterns
- Framework architecture for extensibility
- Realistic result generation showing what agents would accomplish

For real implementation, replace the `AgentCoordinator.generateRealisticResult()` simulation with actual Task Tool calls.