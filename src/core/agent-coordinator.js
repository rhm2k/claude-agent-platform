/**
 * Agent Coordinator - Simplified for general purpose use
 * Manages agent lifecycle and task distribution
 */

import { EventEmitter } from 'events';

export class AgentCoordinator extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.messageQueues = new Map();
  }

  async initialize() {
    this.emit('coordinator:initialized');
    return this;
  }

  async spawnAgent(agentId, task, options = {}) {
    if (this.agents.has(agentId)) {
      throw new Error(`Agent ${agentId} already exists`);
    }

    const agent = {
      id: agentId,
      task,
      status: 'idle',
      created: new Date(),
      options,
      results: null
    };

    this.agents.set(agentId, agent);
    this.messageQueues.set(agentId, []);
    
    this.emit('agent:spawned', { agentId, task });
    
    // Simulate agent work
    setTimeout(() => {
      this.completeAgent(agentId, { 
        completed: true, 
        output: `Agent ${agentId} completed task: ${task}` 
      });
    }, 1000);

    return agent;
  }

  async sendMessage(fromAgent, toAgent, message) {
    const queue = this.messageQueues.get(toAgent);
    if (!queue) {
      throw new Error(`Agent ${toAgent} not found`);
    }

    const fullMessage = {
      from: fromAgent,
      to: toAgent,
      message,
      timestamp: new Date()
    };

    queue.push(fullMessage);
    this.emit('message:sent', fullMessage);
  }

  async getMessages(agentId) {
    return this.messageQueues.get(agentId) || [];
  }

  async getAgentStatus(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent;
  }

  completeAgent(agentId, results) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'completed';
      agent.results = results;
      this.emit('agent:completed', { agentId, results });
    }
  }

  async terminateAgent(agentId) {
    if (this.agents.has(agentId)) {
      this.agents.delete(agentId);
      this.messageQueues.delete(agentId);
      this.emit('agent:terminated', { agentId });
    }
  }

  async cleanup() {
    for (const [agentId] of this.agents) {
      await this.terminateAgent(agentId);
    }
    this.emit('coordinator:cleanup');
  }

  getStatistics() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
      completedAgents: Array.from(this.agents.values()).filter(a => a.status === 'completed').length
    };
  }
}