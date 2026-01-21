/**
 * Mock Phaser objects for unit testing
 * Provides minimal implementations of Phaser scene and events
 */

/**
 * Mock EventEmitter that tracks emitted events
 */
export class MockEventEmitter {
  constructor() {
    this.listeners = new Map();
    this.emittedEvents = [];
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    return this;
  }

  emit(event, ...args) {
    this.emittedEvents.push({ event, args });
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        callback(...args);
      }
    }
    return this;
  }

  getEmittedEvents(eventName = null) {
    if (eventName) {
      return this.emittedEvents.filter(e => e.event === eventName);
    }
    return this.emittedEvents;
  }

  clearEmittedEvents() {
    this.emittedEvents = [];
  }
}

/**
 * Mock Phaser.GameObjects.Image
 */
export class MockImage {
  constructor(x, y, texture) {
    this.x = x;
    this.y = y;
    this.texture = texture;
    this.alpha = 1;
    this.tint = null;
    this.data = new Map();
    this.destroyed = false;
  }

  setAlpha(alpha) {
    this.alpha = alpha;
    return this;
  }

  setTint(tint) {
    this.tint = tint;
    return this;
  }

  clearTint() {
    this.tint = null;
    return this;
  }

  setTexture(texture) {
    this.texture = texture;
    return this;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setInteractive() {
    return this;
  }

  setData(key, value) {
    this.data.set(key, value);
    return this;
  }

  getData(key) {
    return this.data.get(key);
  }

  destroy() {
    this.destroyed = true;
  }
}

/**
 * Mock Phaser.GameObjects.Circle
 */
export class MockCircle {
  constructor(x, y, radius, fillColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillColor = fillColor;
    this.strokeWidth = 0;
    this.strokeColor = null;
    this.destroyed = false;
  }

  setFillStyle(color) {
    this.fillColor = color;
    return this;
  }

  setStrokeStyle(width, color) {
    this.strokeWidth = width;
    this.strokeColor = color;
    return this;
  }

  destroy() {
    this.destroyed = true;
  }
}

/**
 * Mock Phaser Scene with events emitter and add factory
 */
export function createMockScene() {
  const events = new MockEventEmitter();

  return {
    events,
    add: {
      image: (x, y, texture) => new MockImage(x, y, texture),
      circle: (x, y, radius, fillColor) => new MockCircle(x, y, radius, fillColor)
    }
  };
}

/**
 * Create a minimal mock scene with just events (for simpler tests)
 */
export function createMinimalMockScene() {
  return {
    events: new MockEventEmitter()
  };
}
