export class ConfigurationError extends Error {
  /**
   * @param {string[]} invalidKeys
   */
  constructor(invalidKeys) {
    super("Application configuration is invalid.");
    this.name = "ConfigurationError";
    this.invalidKeys = [...new Set(invalidKeys)].sort();
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      invalidKeys: this.invalidKeys,
    };
  }
}
