import { inherits } from 'util';

export function BuildError(message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

inherits(BuildError, Error);
