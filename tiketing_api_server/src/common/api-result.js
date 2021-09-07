export class ApiResult {
  success;
  status;
  message;
  data;

  constructor({ success, data, status, message }) {
    this.success = success;
    this.data = data;
    this.status = status;
    this.message = message;
  }

  static success({ data, status, message }) {
    return new ApiResult({ data, status, message, success: true });
  }
  static error({ status, message }) {
    return new ApiResult({ status, message, data: null, success: false });
  }
}
