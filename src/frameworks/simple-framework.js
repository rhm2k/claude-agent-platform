/**
 * Simple Framework - Basic sequential/parallel agent coordination
 */

import { BaseFramework } from '../core/base-framework.js';

export class SimpleFramework extends BaseFramework {
  async onInitialize() {
    console.log('✅ Simple Framework initialized');
  }

  async createWorkflow(workflowId, type, config = {}) {
    const workflow = {
      id: workflowId,
      type: type,
      status: 'initialized',
      created: new Date(),
      config: config,
      tasks: config.tasks || [],
      agents: [],
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
    workflow.startTime = new Date();

    try {
      if (workflow.type === 'sequential') {
        await this.executeSequential(workflow);
      } else if (workflow.type === 'parallel') {
        await this.executeParallel(workflow);
      } else {
        throw new Error(`Unknown workflow type: ${workflow.type}`);
      }

      workflow.status = 'completed';
      workflow.endTime = new Date();
      this.emit('workflow:completed', { workflowId, results: workflow.results });

    } catch (error) {
      workflow.status = 'failed';
      workflow.error = error.message;
      this.emit('workflow:failed', { workflowId, error: error.message });
      throw error;
    }

    return workflow;
  }

  async executeSequential(workflow) {
    console.log(`\n🔄 Executing sequential workflow: ${workflow.id}`);
    
    for (let i = 0; i < workflow.tasks.length; i++) {
      const task = workflow.tasks[i];
      const agentId = `${workflow.id}-${task.agent}`;
      
      console.log(`  → Task ${i + 1}/${workflow.tasks.length}: ${task.agent}`);
      
      await this.spawnAgent(agentId, task.task);
      workflow.agents.push(agentId);
      
      // Wait for completion
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      workflow.results[task.agent] = status.results;
      
      // Pass results to next agent if needed
      if (i < workflow.tasks.length - 1 && task.passResults) {
        const nextAgentId = `${workflow.id}-${workflow.tasks[i + 1].agent}`;
        await this.sendMessage(agentId, nextAgentId, status.results);
      }
    }
  }

  async executeParallel(workflow) {
    console.log(`\n🔄 Executing parallel workflow: ${workflow.id}`);
    
    const agentPromises = workflow.tasks.map(async (task) => {
      const agentId = `${workflow.id}-${task.agent}`;
      console.log(`  ⇉ Spawning parallel agent: ${task.agent}`);
      
      await this.spawnAgent(agentId, task.task);
      workflow.agents.push(agentId);
      
      await this.waitForAgent(agentId);
      
      const status = await this.coordinator.getAgentStatus(agentId);
      return { agent: task.agent, results: status.results };
    });

    const results = await Promise.all(agentPromises);
    
    for (const { agent, results: agentResults } of results) {
      workflow.results[agent] = agentResults;
    }
  }

  async waitForAgent(agentId, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.coordinator.getAgentStatus(agentId);
      
      if (status.status === 'completed') {
        return true;
      }
      
      if (status.status === 'failed') {
        throw new Error(`Agent ${agentId} failed`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Agent ${agentId} timed out`);
  }
}