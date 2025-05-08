2024-06-09

- feat: 秒传接口支持前端传递 chunk_md5s 并返回每个分片的 md5 校验结果
- feat: file_chunks 表和 FileChunk 模型增加 chunk_md5 字段用于存储分片 md5
- feat: 分片上传接口支持接收并存储 chunk_md5 字段
- docs: 文件上传接口文档补充 chunk_md5s 和 chunk_md5 字段说明
- perf: mergeChunks 方法优化，合并分片时校验每个分片 md5 并输出详细日志，遇到分片 md5 不一致时返回详细错误信息，便于排查问题
- feat: 数据初始化脚本新增"商品订单"主菜单及相册管理、产品管理、订单管理、物流管理四个子菜单，并为每个子菜单批量创建常用操作和权限，admin 拥有全部权限
