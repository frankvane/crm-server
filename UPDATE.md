## 2025-05-12 16:40:23

- chore: 严格按照rules规则测试自动化日志流程

## 2025-05-12 16:36:18

- chore: 再次测试自动添加更新日志功能

## 2025-05-12 16:34:30

- chore: 测试自动添加更新日志功能

2024-06-09

- feat: 秒传接口支持前端传递 chunk_md5s 并返回每个分片的 md5 校验结果
- feat: file_chunks 表和 FileChunk 模型增加 chunk_md5 字段用于存储分片 md5
- feat: 分片上传接口支持接收并存储 chunk_md5 字段
- docs: 文件上传接口文档补充 chunk_md5s 和 chunk_md5 字段说明
- perf: mergeChunks 方法优化，合并分片时校验每个分片 md5 并输出详细日志，遇到分片 md5 不一致时返回详细错误信息，便于排查问题
- feat: 数据初始化脚本新增"商品订单"主菜单及相册管理、产品管理、订单管理、物流管理四个子菜单，并为每个子菜单批量创建常用操作和权限，admin 拥有全部权限
- feat: 新增 chat.controller.js 和 chat.routes.js，实现 /stream-chat 流式对话接口，支持 OpenAI deepseek-chat 流式输出

## 2024-06-10

### 语音识别相关配置与依赖更新

1. **Vosk 语音识别模型**

   - 中文模型下载：https://alphacephei.com/vosk/models
   - 推荐模型：vosk-model-cn-kaldi-multicn-0.15
   - 英文模型可选：https://alphacephei.com/vosk/models
   - 官方 API 文档：https://github.com/alphacep/vosk-api

2. **音频转码依赖**

   - 需安装 sox（用于 mic 采集）：https://github.com/chirlu/sox
   - 需安装 ffmpeg（用于 aac/mp3 等转 wav）：https://ffmpeg.org/
   - Windows 下需将 sox/ffmpeg 的 bin 目录加入系统 PATH

3. **Deepseek API 优化**

   - 识别结果会自动调用 deepseek API 进行标点和英文谐音词还原优化
   - 仅做标点、语句和英文词还原，不随意修改原文

4. **模型加载优化**

   - vosk 语音模型在服务启动时预加载，提升接口首次响应速度

5. **安全与规范**

   - 只允许识别 uploads 目录下的音频文件，防止路径穿越
   - 支持 wav/aac 格式，aac 会自动转为 wav 再识别

6. **接口调用示例**

   - POST /api/speech/recognize
   - body: { "wavPath": "test.wav" } // 文件需放在 uploads 目录

7. **相关依赖包**
   - npm install vosk fluent-ffmpeg wav openai
