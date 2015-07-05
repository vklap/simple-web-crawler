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
  //console.log('pushTask: ' + this.queue.length);
  this.queue.push(task);
  this.next();
};

TaskQueue.prototype.next = function() {
  var self = this;
  while(self.queue.length && self.running < self.concurrency) {
    //console.log('queue length: ' + self.queue.length);
    var task = self.queue.shift();
    task(function(err) {
      console.log('inside task callback - queue length: ' + self.queue.length);
      self.running--;
      self.next();
    });
    self.running++;
  }
};