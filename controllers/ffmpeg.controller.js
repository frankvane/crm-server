const { File } = require("../models");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ResponseUtil = require("../utils/response");

// 设置 FFmpeg 路径 (如果不在系统 PATH 中)
// ffmpeg.setFfmpegPath('/path/to/your/ffmpeg');
// ffmpeg.setFfprobePath('/path/to/your/ffprobe');

exports.convertFile = async (req, res, next) => {
  try {
    const { file, operations, params } = req.body;

    if (
      !file ||
      !file.file_id ||
      !file.name ||
      !operations ||
      !Array.isArray(operations) ||
      !params
    ) {
      return res.status(400).json(ResponseUtil.error("请求参数不完整", 400));
    }

    // 1. 根据 file_id 获取文件路径
    const fileRecord = await File.findOne({ where: { file_id: file.file_id } });

    if (!fileRecord || !fileRecord.file_path) {
      return res.status(404).json(ResponseUtil.error("文件未找到", 404));
    }

    const inputPath = path.join(__dirname, "../", fileRecord.file_path);
    const uploadsDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(inputPath)) {
      return res
        .status(404)
        .json(ResponseUtil.error("文件物理路径不存在", 404));
    }

    // 确保输出目录存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 统一输出文件名基础：优先用md5，无则用时间戳
    const fileMd5 = fileRecord.md5 || Date.now();
    // 获取原始扩展名
    const originalExt = path.extname(file.name);
    // 默认输出文件名
    let outputFileName = `converted_${fileMd5}${originalExt}`;
    let outputPath = path.join(uploadsDir, outputFileName);
    let outputFormat = originalExt.replace(".", "");

    // 检查是否包含cover操作
    const hasCover = operations.includes("cover");
    // 需要先处理的操作（不包括cover）
    const preOperations = operations.filter((op) => op !== "cover");

    // 如果有cover操作，先转码生成中间文件，再截图
    if (hasCover) {
      // 1. 生成最终视频文件
      const finalVideoName = `${fileMd5}_converted${originalExt}`;
      const finalVideoPath = path.join(uploadsDir, finalVideoName);
      let tempCommand = ffmpeg(inputPath);
      for (const operation of preOperations) {
        const operationParams = params[operation];
        if (!operationParams) continue;
        switch (operation) {
          case "scale":
            if (operationParams.width && operationParams.height) {
              tempCommand = tempCommand.size(
                `${operationParams.width}x${operationParams.height}`
              );
            }
            break;
          case "compress":
            if (operationParams.bitrate) {
              tempCommand = tempCommand.videoBitrate(operationParams.bitrate);
            }
            break;
          case "crop":
            if (
              operationParams.x !== undefined &&
              operationParams.y !== undefined &&
              operationParams.width &&
              operationParams.height
            ) {
              tempCommand = tempCommand.videoFilters(
                `crop=${operationParams.width}:${operationParams.height}:${operationParams.x}:${operationParams.y}`
              );
            }
            break;
          case "clip-segment":
            if (
              operationParams.start !== undefined &&
              operationParams.duration
            ) {
              tempCommand = tempCommand
                .seekInput(operationParams.start)
                .duration(operationParams.duration);
            }
            break;
          case "framerate":
            if (operationParams.fps) {
              tempCommand = tempCommand.fps(operationParams.fps);
            }
            break;
          case "volume":
            if (operationParams.volume !== undefined) {
              tempCommand = tempCommand.audioFilters(
                `volume=${operationParams.volume}`
              );
            }
            break;
          // 其它非cover操作可继续补充
        }
      }
      // 2. 保存最终视频文件
      await new Promise((resolve, reject) => {
        tempCommand.on("end", resolve).on("error", reject).save(finalVideoPath);
      });
      // 3. 用screenshots对最终视频文件截图
      const screenshotFilename = `${fileMd5}_cover_${Date.now()}.jpg`;
      const screenshotFolder = path.resolve(uploadsDir);
      const coverParams = params["cover"] || {};
      const screenshotTime =
        coverParams.time !== undefined ? coverParams.time : 1;
      await new Promise((resolve, reject) => {
        ffmpeg(finalVideoPath)
          .on("end", function () {
            resolve();
          })
          .on("error", function (err) {
            reject(err);
          })
          .screenshots({
            timestamps: [screenshotTime],
            filename: screenshotFilename,
            folder: screenshotFolder,
          });
      });
      // 4. 返回视频和截图路径
      const uploadsRelativeVideo = path
        .relative(path.join(__dirname, ".."), finalVideoPath)
        .split(path.sep)
        .join("/");
      const uploadsRelativeCover = path
        .relative(
          path.join(__dirname, ".."),
          path.join(screenshotFolder, screenshotFilename)
        )
        .split(path.sep)
        .join("/");
      return res.json(
        ResponseUtil.success(
          {
            outputVideoPath: uploadsRelativeVideo,
            outputCoverPath: uploadsRelativeCover,
          },
          "视频处理与封面提取成功"
        )
      );
    }

    // 创建 FFmpeg 命令
    let command = ffmpeg(inputPath);

    // 应用各项操作
    for (const operation of operations) {
      const operationParams = params[operation];
      if (!operationParams) {
        console.warn(`操作 ${operation} 缺少参数，跳过`);
        continue;
      }

      switch (operation) {
        case "scale":
          if (operationParams.width && operationParams.height) {
            command = command.size(
              `${operationParams.width}x${operationParams.height}`
            );
          }
          break;
        case "compress":
          if (operationParams.bitrate) {
            command = command.videoBitrate(operationParams.bitrate);
          }
          break;
        case "extract-audio":
          if (operationParams.audioFormat) {
            command = command
              .noVideo()
              .audioCodec("libmp3lame")
              .toFormat(operationParams.audioFormat);
            outputFileName = `${fileMd5}_audio.${operationParams.audioFormat}`;
            outputPath = path.join(uploadsDir, outputFileName);
            outputFormat = operationParams.audioFormat;
          } else {
            command = command
              .noVideo()
              .audioCodec("libmp3lame")
              .toFormat("mp3");
            outputFileName = `${fileMd5}_audio.mp3`;
            outputPath = path.join(uploadsDir, outputFileName);
            outputFormat = "mp3";
          }
          break;
        case "crop":
          if (
            operationParams.x !== undefined &&
            operationParams.y !== undefined &&
            operationParams.width &&
            operationParams.height
          ) {
            command = command.videoFilters(
              `crop=${operationParams.width}:${operationParams.height}:${operationParams.x}:${operationParams.y}`
            );
          }
          break;
        case "clip-segment":
          if (operationParams.start !== undefined && operationParams.duration) {
            command = command
              .seekInput(operationParams.start)
              .duration(operationParams.duration);
          }
          break;
        case "watermark":
          // 简单的文字水印示例，复杂水印（图片水印、位置等）需要更复杂的 filter 链
          if (operationParams.watermarkText) {
            // 需要安装 fontconfig 库和合适的字体文件
            // const fontPath = '/path/to/your/font.ttf'; // 替换为实际字体路径
            // if (!fs.existsSync(fontPath)) {
            //     console.warn('水印字体文件不存在，无法添加水印');
            //     break;
            // }
            const fontSize = operationParams.fontSize || 20;
            const opacity =
              operationParams.opacity !== undefined
                ? operationParams.opacity
                : 1;
            // 假设字体文件在uploads目录下，名为arial.ttf
            const fontPath = path.join(__dirname, "../uploads", "arial.ttf"); // 示例字体路径
            if (!fs.existsSync(fontPath)) {
              console.warn(`水印字体文件不存在: ${fontPath}，无法添加水印`);
              break;
            }

            command = command.videoFilters({
              filter: "drawtext",
              options: {
                text: operationParams.watermarkText,
                fontfile: fontPath, // 替换为实际字体文件路径
                fontsize: fontSize,
                fontcolor: `white@${opacity}`,
                x: "(main_w-text_w)/2", // 水平居中
                y: "main_h-text_h-10", // 底部边距10
              },
            });
          }
          break;
        case "convert":
          if (operationParams.format) {
            command = command.toFormat(operationParams.format);
            outputFileName = `${fileMd5}_converted.${operationParams.format}`;
            outputPath = path.join(uploadsDir, outputFileName);
            outputFormat = operationParams.format;
          }
          break;
        case "framerate":
          if (operationParams.fps) {
            command = command.fps(operationParams.fps);
          }
          break;
        case "volume":
          if (operationParams.volume !== undefined) {
            command = command.audioFilters(`volume=${operationParams.volume}`);
          }
          break;
        case "gif":
          if (operationParams.start !== undefined && operationParams.duration) {
            command = command
              .seekInput(operationParams.start)
              .duration(operationParams.duration)
              .toFormat("gif");
            outputFileName = `${fileMd5}_clip.gif`;
            outputPath = path.join(uploadsDir, outputFileName);
            outputFormat = "gif";
          }
          break;
        case "cover":
          if (operationParams.time !== undefined) {
            const screenshotFilename = `${fileMd5}_cover_${Date.now()}.jpg`;
            const screenshotFolder = path.resolve(uploadsDir);
            console.log("准备截图:", screenshotFilename, screenshotFolder);
            const ff = command.screenshots({
              timestamps: [operationParams.time],
              filename: screenshotFilename,
              folder: screenshotFolder,
            });
            ff.on("end", function () {
              console.log(
                "截图end事件被调用:",
                path.join(screenshotFolder, screenshotFilename)
              );
              // 以项目根目录为基准，返回uploads/xxx.jpg格式
              const uploadsRelative = path.relative(
                path.join(__dirname, ".."),
                path.join(screenshotFolder, screenshotFilename)
              );
              const outputPath = uploadsRelative.split(path.sep).join("/");
              return res.json(
                ResponseUtil.success({ outputPath }, "封面提取成功")
              );
            });
            ff.on("error", function (err) {
              console.error("截图error事件被调用:", err);
              return next(new Error("封面提取失败: " + err.message));
            });
            return;
          }
          break;

        // 添加其他操作的处理逻辑

        default:
          console.warn(`不支持的操作类型: ${operation}`);
      }
    }

    // 如果包含convert操作，确保最后toFormat调用的是convert指定的格式
    if (
      operations.includes("convert") &&
      params.convert &&
      params.convert.format
    ) {
      command = command.toFormat(params.convert.format);
      outputFileName = `${fileMd5}_converted.${params.convert.format}`;
      outputPath = path.join(uploadsDir, outputFileName);
      outputFormat = params.convert.format;
    }

    // 如果包含gif操作，确保最后toFormat调用的是gif格式
    if (operations.includes("gif")) {
      command = command.toFormat("gif");
      outputFileName = `${fileMd5}_clip.gif`;
      outputPath = path.join(uploadsDir, outputFileName);
      outputFormat = "gif";
    }

    // 如果包含extract-audio操作，确保最后toFormat调用的是音频格式
    if (
      operations.includes("extract-audio") &&
      params["extract-audio"] &&
      params["extract-audio"].audioFormat
    ) {
      command = command.toFormat(params["extract-audio"].audioFormat);
      outputFileName = `${fileMd5}_audio.${params["extract-audio"].audioFormat}`;
      outputPath = path.join(uploadsDir, outputFileName);
      outputFormat = params["extract-audio"].audioFormat;
    }

    // 执行 FFmpeg 命令
    command
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine);
        // 可以发送进度信息到客户端
        // res.write(JSON.stringify({ status: 'started', command: commandLine }) + '\n');
      })
      .on("progress", function (progress) {
        console.log("Processing: " + progress.percent + "% done");
        // 可以发送进度信息到客户端
        // res.write(JSON.stringify({ status: 'progress', progress: progress.percent }) + '\n');
      })
      .on("error", function (err, stdout, stderr) {
        console.error("FFmpeg Error:", err.message);
        console.error("FFmpeg stderr:", stderr);
        // res.write(JSON.stringify({ status: 'error', message: err.message, stderr: stderr }) + '\n');
        // res.end(); // 发生错误时结束响应
        // 调用 next 传递错误
        const ffmpegError = new Error("FFmpeg processing failed");
        ffmpegError.status = 500; // 或者其他合适的HTTP状态码
        ffmpegError.details = { message: err.message, stdout, stderr };
        next(ffmpegError);
      })
      .on("end", function (stdout, stderr) {
        console.log("FFmpeg process finished !");
        // res.write(JSON.stringify({ status: 'completed', outputPath: path.relative(__dirname, outputPath) }) + '\n');
        // res.end(); // 处理完成时结束响应
        res.json(
          ResponseUtil.success(
            { outputPath: path.relative(__dirname, outputPath) },
            "文件转换成功"
          )
        );
      })
      .save(outputPath);
  } catch (err) {
    next(err); // 捕获同步错误和文件查找错误
  }
};
