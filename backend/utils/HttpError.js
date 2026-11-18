// An error that carries an HTTP status code, e.g. throw new HttpError(404, 'Book not found.')
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
