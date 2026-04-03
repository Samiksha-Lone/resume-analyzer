const EventEmitter = require('events');

class AnalysisQueue extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
  }

  addJob(jobId, task) {
    this.jobs.set(jobId, { status: 'pending', createdAt: new Date() });
    
    // Simulate async processing
    setImmediate(async () => {
      try {
        this.emit('start', jobId);
        this.jobs.set(jobId, { ...this.jobs.get(jobId), status: 'analyzing' });
        
        const result = await task();
        
        this.jobs.set(jobId, { status: 'completed', result, completedAt: new Date() });
        this.emit('completed', jobId, result);
      } catch (error) {
        this.jobs.set(jobId, { status: 'failed', error: error.message, failedAt: new Date() });
        this.emit('failed', jobId, error);
      }
    });

    return jobId;
  }

  getJobStatus(jobId) {
    return this.jobs.get(jobId);
  }
}

const analysisQueue = new AnalysisQueue();

module.exports = analysisQueue;
