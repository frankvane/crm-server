class ResponseUtil {
  static success(data = null, message = "Success") {
    return {
      code: 200,
      message,
      data,
    };
  }

  static error(message = "Error", code = 500) {
    return {
      code,
      message,
      data: null,
    };
  }

  static page(data, total, currentPage, pageSize) {
    return {
      code: 200,
      message: "Success",
      data: {
        list: data,
        pagination: {
          total,
          current: currentPage,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }
}

module.exports = ResponseUtil;
