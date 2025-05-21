// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRM Server API",
      version: "1.0.0",
      description: "API 文档",
      // x-tagGroups为自定义扩展，swagger-ui官方不支持，但可被自定义UI或插件识别
      "x-tagGroups": [
        {
          name: "系统功能",
          tags: ["认证与授权", "用户管理"],
        },
        {
          name: "业务管理",
          tags: [
            "文件管理",
            "评论管理",
            "产品管理",
            "分类管理",
            "分类类型管理",
            "角色管理",
            "资源管理",
            "资源操作管理",
          ],
        },
        {
          name: "AI能力",
          tags: ["语音识别", "对话流"],
        },
      ],
    },
    tags: [
      {
        name: "认证与授权",
        description: "登录、登出、token刷新等认证相关接口",
        "x-icon": "lock",
      },
      {
        name: "用户管理",
        description: "用户的增删改查、角色分配等",
        "x-icon": "user",
      },
      {
        name: "文件管理",
        description: "大文件上传、分片、合并、秒传等",
        "x-icon": "file",
      },
      {
        name: "评论管理",
        description: "评论的增删改查、批量操作等",
        "x-icon": "message",
      },
      {
        name: "产品管理",
        description: "产品的增删改查、批量操作等",
        "x-icon": "shopping-cart",
      },
      {
        name: "分类管理",
        description: "分类的增删改查、树结构等",
        "x-icon": "appstore",
      },
      {
        name: "分类类型管理",
        description: "分类类型的增删改查",
        "x-icon": "tags",
      },
      {
        name: "角色管理",
        description: "角色的增删改查、分配资源权限等",
        "x-icon": "team",
      },
      {
        name: "资源管理",
        description: "系统菜单、按钮等资源的管理",
        "x-icon": "menu",
      },
      {
        name: "资源操作管理",
        description: "资源下操作按钮的管理",
        "x-icon": "tool",
      },
      {
        name: "语音识别",
        description: "音频文件识别、AI润色等",
        "x-icon": "audio",
      },
      {
        name: "对话流",
        description: "AI流式对话接口",
        "x-icon": "robot",
      },
    ],
    servers: [
      {
        url: "http://localhost:3000/api", // 根据实际端口调整，已添加 /api 前缀
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // 这里指定注释扫描路径
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
