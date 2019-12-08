export class EventEmitter {
  constructor() {
    this._events = {};
  }
  on(evt, listener) {
    (this._events[evt] || (this._events[evt] = [])).push(listener);
    return this;
  }
  emit(evt, payload) {
    console.log('=======================================');
    console.log('event: ' + evt);
    console.log(payload);
    console.log('=======================================');
    (this._events[evt] || []).slice().forEach(lsn => lsn(payload));
  }
}

export const eventBus = new EventEmitter();