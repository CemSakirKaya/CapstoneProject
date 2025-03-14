export default class Process {
    constructor(type, time, distance, description) {
      this.type = type;
      this.time = time;
      this.distance = distance;
      this.description = description;
    }
  
    static ProcessTypes = ["OPERATION", "TRANSPORTATION", "DELAY", "STORAGE", "INSPECTION"];
  }
  