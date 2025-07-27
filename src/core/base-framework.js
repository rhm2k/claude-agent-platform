/**
 * Base Framework - Abstract class for all management frameworks
 */

import { EventEmitter } from 'events';

export class BaseFramework extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.coordinator = null;
    this.workflows = new Map();
  }

  async initialize(coordinator) {
    this.coordinator = coordinator;
    await this.onInitialize();
    this.emit('framework:initialized', { framework: this.constructor.name });
  }

  // Abstract methods - must be implemented by subclasses
  async onInitialize() {
    throw new Error('onInitialize() must be implemented by framework');
  }

  async createWorkflow(workflowId, type, config = {}) {
    throw new Error('createWorkflow() must be implemented by framework');
  }

  async executeWorkflow(workflowId) {
    throw new Error('executeWorkflow() must be implemented by framework');
  }

  async getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return null;
    }

    return {
      id: workflow.id,
      type: workflow.type,
      status: workflow.status,
      created: workflow.created,
      completed: workflow.status === 'completed',
      failed: workflow.status === 'failed',
      error: workflow.error
    };
  }

  async cleanup(workflowId = null) {
    if (workflowId) {
      const workflow = this.workflows.get(workflowId);
      if (workflow && workflow.agents) {
        for (const agentId of workflow.agents) {
          await this.coordinator.terminateAgent(agentId);
        }
      }
      this.workflows.delete(workflowId);
    } else {
      for (const [id] of this.workflows) {
        await this.cleanup(id);
      }
    }
  }

  // Utility methods
  async spawnAgent(agentId, task, options = {}) {
    return await this.coordinator.spawnAgent(agentId, task, {
      ...options,
      framework: this.constructor.name
    });
  }

  async sendMessage(fromAgent, toAgent, message) {
    return await this.coordinator.sendMessage(fromAgent, toAgent, message);
  }

  getMetadata() {
    return {
      name: this.constructor.name,
      version: this.config.version || '1.0.0',
      description: this.config.description || 'Custom framework'
    };
  }
}