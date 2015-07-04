/**
 * Created by victor on 04/07/15.
 */

module.exports = TaskQueue;

function TaskQueue(concurrency) {
  this.concurrency = concurrency;
  this.running = 0;
  this.queue = [];
}

TaskQueue.prototype.pushTask = function (task) {
  this.queue.push(task);
  this.next();
};

TaskQueue.prototype.next = function() {
  var self = this;
  while(self.queue.length && self.running < self.concurrency) {
    var task = this.queue.shift();
    task(function(err) {
      self.running--;
      self.next();
    });
    self.running++;
  }
};