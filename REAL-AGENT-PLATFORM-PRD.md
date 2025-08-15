# Real Claude Agent Platform - Product Requirements Document

## Project Overview

Build a production-ready multi-agent coordination platform that uses actual Claude Code Task Tools with git worktrees for true agent isolation. This platform will implement the coordination patterns demonstrated in the simulation platform, but with real Claude Code sub-agents running in isolated environments.

## Core Requirements

### 1. Real Agent Management
- **Git Worktree Integration**: Create isolated git worktrees in `./agents/` subdirectory
- **Task Tool Integration**: Use Claude Code's Task Tool to spawn actual sub-agents
- **Agent Isolation**: Each agent runs in its own git worktree with full repository access
- **Lifecycle Management**: Spawn, monitor, communicate with, and cleanup real agents

### 2. Enhanced Architecture (Building on Simulation)
- **Keep Core Patterns**: Preserve AgentCoordinator, BaseFramework, workflow patterns
- **Real Implementation**: Replace simulation with actual Task Tool calls
- **Git Integration**: Add worktree creation, cleanup, and management
- **Inter-Agent Communication**: Implement file-based or API-based communication between worktrees

### 3. Advanced Monitoring & Visualization
- **Live Dashboard**: Web-based interface showing active agents and their states
- **Worktree Visualization**: Display git worktree creation/destruction in real-time
- **Agent Communication Flow**: Show message passing and data flow between agents
- **Performance Metrics**: Track real execution times, resource usage, success rates

## Technical Architecture

### Core Components

#### RealAgentCoordinator
```javascript
class RealAgentCoordinator extends EventEmitter {
  async spawnAgent(agentId, task, options = {}) {
    // 1. Create git worktree in ./agents/${agentId}/
    // 2. Launch Task Tool in that worktree
    // 3. Monitor agent via Task Tool API
    // 4. Handle real communication and results
  }
  
  async createWorktree(agentId) {
    // git worktree add ./agents/${agentId} HEAD
  }
  
  async cleanupWorktree(agentId) {
    // git worktree remove ./agents/${agentId}
  }
}
```

#### Enhanced Framework System
- **BaseFramework**: Extended with worktree management
- **Communication Layer**: File-based or message queue system between agents
- **Resource Management**: CPU, memory, and git worktree limits
- **Error Recovery**: Handle agent failures and worktree cleanup

### Repository Structure
```
real-claude-agent-platform/
├── src/
│   ├── core/
│   │   ├── real-agent-coordinator.js
│   │   ├── worktree-manager.js
│   │   ├── task-tool-client.js
│   │   └── base-framework.js
│   ├── frameworks/
│   │   ├── development-framework.js    # Code review, CI/CD
│   │   ├── data-pipeline-framework.js  # ETL, analytics
│   │   └── research-framework.js       # Multi-step analysis
│   ├── communication/
│   │   ├── message-queue.js
│   │   └── file-based-comm.js
│   └── monitoring/
│       ├── dashboard-server.js
│       └── metrics-collector.js
├── dashboard/                          # Web dashboard
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── components/
├── demos/                             # Real working demos
│   ├── 01-code-review-workflow/
│   ├── 02-data-analysis-pipeline/
│   └── 03-document-research-chain/
├── agents/                           # Git worktrees (gitignored)
├── .gitignore                        # Include "agents/"
├── package.json
└── SIMULATION-REFERENCE/             # Copy of simulation platform
    └── [simulation platform files]
```

## Key Features

### 1. Git Worktree Management
- **Automatic Creation**: Spawn worktrees on-demand in `./agents/` subdirectory
- **Isolation**: Each agent gets full git repository access in isolated environment
- **Cleanup**: Automatic worktree removal on agent completion or failure
- **Conflict Prevention**: Unique branch names and worktree paths per agent

### 2. Real Task Tool Integration
```javascript
// Example: Real agent spawning
const agent = await coordinator.spawnAgent('code-reviewer-001', {
  task: 'Review the changes in src/auth/ for security vulnerabilities',
  workingDirectory: './agents/code-reviewer-001/',
  specialization: 'security-review',
  timeout: 300000 // 5 minutes
});
```

### 3. Advanced Communication
- **File-based**: Agents write results to shared files
- **Message Queue**: Redis or in-memory queue for real-time communication
- **Event Stream**: WebSocket updates to dashboard
- **Result Aggregation**: Collect and combine outputs from multiple agents

### 4. Live Dashboard Features
- **Agent Status Grid**: Show all active agents with status indicators
- **Worktree Visualization**: Tree view of git worktrees and their states
- **Communication Flow**: Interactive diagram showing agent interactions
- **Resource Monitor**: CPU, memory, disk usage per agent
- **Execution Timeline**: Gantt chart of agent lifecycles
- **Result Viewer**: Live display of agent outputs and results

### 5. Production-Ready Features
- **Error Handling**: Graceful failure recovery and worktree cleanup
- **Resource Limits**: Prevent runaway agents from consuming resources
- **Logging**: Comprehensive logging of all agent activities
- **Metrics**: Performance tracking and analytics
- **Security**: Sandboxing and permission controls for agents

## Implementation Plan

### Phase 1: Core Platform (Week 1-2)
1. **Port Simulation Architecture**: Copy coordination patterns and framework system
2. **Implement Worktree Manager**: Git worktree creation, cleanup, management
3. **Task Tool Client**: Interface to Claude Code Task Tool API
4. **Basic Real Agent Spawning**: Replace simulation with actual Task Tool calls
5. **File-based Communication**: Simple inter-agent communication

### Phase 2: Enhanced Features (Week 3-4)
1. **Web Dashboard**: Basic monitoring interface
2. **Advanced Communication**: Message queues and event streaming
3. **Resource Management**: Limits, cleanup, error recovery
4. **Framework Extensions**: Domain-specific frameworks (dev, data, research)
5. **Demo Workflows**: Real working examples

### Phase 3: Production Polish (Week 5-6)
1. **Advanced Dashboard**: Interactive visualizations and monitoring
2. **Performance Optimization**: Resource usage, cleanup efficiency
3. **Security & Sandboxing**: Agent isolation and permission controls
4. **Documentation**: Complete API docs, tutorials, examples
5. **Testing**: Comprehensive test suite for real agent scenarios

## Success Criteria

### Functional Requirements
- ✅ Real Claude Code sub-agents running in isolated git worktrees
- ✅ Successful coordination of 3+ agents in complex workflows
- ✅ Live dashboard showing agent status and communication flows
- ✅ Automatic worktree cleanup and resource management
- ✅ At least 3 working demo scenarios with real-world applications

### Performance Requirements
- ⚡ Agent spawn time: < 10 seconds
- 🧠 Memory usage: < 100MB per agent
- 🧹 Cleanup time: < 5 seconds per worktree
- 📊 Dashboard responsiveness: < 1 second updates
- 🔄 Handle 5+ concurrent agents without performance degradation

### Quality Requirements
- 🛡️ Zero git repository corruption from worktree operations
- 🧪 95%+ test coverage for core coordination logic
- 📝 Complete documentation with tutorials and API reference
- 🚀 Production-ready error handling and logging

## Repository Setup Recommendations

### Initial Setup Commands
```bash
# Create new repository
mkdir real-claude-agent-platform && cd real-claude-agent-platform
git init
npm init -y

# Copy simulation as reference
cp -r ../claude-agent-platform SIMULATION-REFERENCE/

# Set up .gitignore
echo "agents/" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore

# Initial commit
git add .
git commit -m "Initial commit: Real Claude Agent Platform PRD and simulation reference"
```

### Development Environment
- **Node.js**: >= 18.0.0 for modern features
- **Dependencies**: Add real-time dashboard (express, ws, sqlite3)
- **Dev Tools**: Enhanced testing, linting, monitoring tools
- **Claude Code Access**: Ensure Task Tool is available and working

### Working Directory Strategy
- **Keep Simulation Platform**: Available in `SIMULATION-REFERENCE/` for pattern reference
- **Start with Core**: Begin with RealAgentCoordinator implementation
- **Incremental Development**: Build and test one component at a time
- **Dashboard Early**: Implement basic monitoring early for development visibility

## Additional Ideas & Enhancements

### Advanced Features to Consider
- **Agent Templates**: Pre-configured agent types (security-reviewer, data-analyst, etc.)
- **Workflow Builder**: Visual interface for creating complex agent workflows
- **Agent Marketplace**: Community-contributed agent configurations
- **Distributed Agents**: Run agents across multiple machines
- **Integration Hub**: Connect with GitHub, Slack, monitoring tools
- **AI-Powered Orchestration**: Use Claude to dynamically create agent workflows

### Monitoring & Observability
- **Real-time Metrics**: Agent performance, success rates, resource usage  
- **Alert System**: Notify on agent failures, resource limits, long-running tasks
- **Audit Trail**: Complete log of all agent activities and decisions
- **Performance Profiling**: Identify bottlenecks in agent coordination
- **Health Checks**: Automated testing of agent capabilities and platform health

This PRD provides a comprehensive roadmap for building a real multi-agent platform while leveraging the patterns and architecture already proven in the simulation platform.