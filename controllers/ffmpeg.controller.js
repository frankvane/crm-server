const { File } = require("../models");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ResponseUtil = require("../utils/response");

// Operation handlers for modularity
const operationHandlers = {
  "clip-segment": (command, params) => {
    if (params.start !== undefined && params.duration) {
      return command.seekInput(params.start).duration(params.duration);
    }
    return command;
  },
  scale: (command, params) => {
    if (params.width && params.height) {
      return command.size(`${params.width}x${params.height}`);
    }
    return command;
  },
  compress: (command, params) => {
    if (params.bitrate) {
      return command.videoBitrate(params.bitrate);
    }
    return command;
  },
  crop: (command, params) => {
    if (
      params.x !== undefined &&
      params.y !== undefined &&
      params.width &&
      params.height
    ) {
      return command.videoFilters(
        `crop=${params.width}:${params.height}:${params.x}:${params.y}`
      );
    }
    return command;
  },
  framerate: (command, params) => {
    if (params.fps) {
      return command.fps(params.fps);
    }
    return command;
  },
  volume: (command, params) => {
    if (params.volume !== undefined) {
      return command.audioFilters(`volume=${params.volume}`);
    }
    return command;
  },
  watermark: (command, params, outputFormat) => {
    if (params.watermarkText) {
      const fontSize = params.fontSize || 20;
      const opacity = params.opacity !== undefined ? params.opacity : 1;
      const fontPath = "C\\:/Windows/Fonts/arial.ttf";
      const drawtext = `drawtext=fontfile='${fontPath}':text='${params.watermarkText}':fontsize=${fontSize}:fontcolor=white@${opacity}:x=10:y=10`;
      command = command
        .videoFilters(drawtext)
        .outputOptions(["-c:v libx264", "-c:a aac", "-movflags +faststart"]);
      outputFormat.format = "mp4"; // Force mp4 for watermark
    }
    return { command, outputFormat };
  },
  convert: (command, params, outputFormat) => {
    if (params.format) {
      command = command.toFormat(params.format);
      outputFormat.format = params.format;
    }
    return { command, outputFormat };
  },
  "extract-audio": (command, params, outputFormat) => {
    const audioFormat = params.audioFormat || "mp3";
    command = command.noVideo().audioCodec("libmp3lame").toFormat(audioFormat);
    outputFormat.format = audioFormat;
    return { command, outputFormat };
  },
  gif: async (
    inputPath,
    params,
    fileMd5,
    uploadsDir,
    sendProgress,
    finishedTasks,
    sendStageProgress
  ) => {
    if (params.start !== undefined && params.duration) {
      const gifFileName = `${fileMd5}_clip.gif`;
      const gifPath = path.join(uploadsDir, gifFileName);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(params.start)
          .duration(params.duration)
          .toFormat("gif")
          .on("start", (cmd) => {})
          .on("progress", (progress) => {
            sendStageProgress &&
              sendStageProgress("gif", progress.percent / 100);
            sendProgress && sendProgress(progress.percent / 100);
          })
          .on("end", () => {
            finishedTasks.value++;
            sendStageProgress && sendStageProgress("gif", 1);
            sendProgress && sendProgress(0);
            resolve();
          })
          .on("error", (err) => {
            finishedTasks.value++;
            sendStageProgress && sendStageProgress("gif", 1);
            sendProgress && sendProgress(0);
            reject(err);
          })
          .save(gifPath);
      });
      return {
        outputGifPath: path
          .relative(path.join(__dirname, ".."), gifPath)
          .split(path.sep)
          .join("/"),
        message: "GIF提取成功",
      };
    }
    return null;
  },
  cover: async (
    inputPath,
    params,
    fileMd5,
    uploadsDir,
    sendProgress,
    finishedTasks,
    sendStageProgress
  ) => {
    const coverParams = params || {};
    const screenshotFilename = `${fileMd5}_cover_${Date.now()}.jpg`;
    const screenshotFolder = path.resolve(uploadsDir);
    const screenshotTime =
      coverParams.time !== undefined ? coverParams.time : 1;
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .on("start", (cmd) => {})
        .on("progress", (progress) => {
          sendStageProgress &&
            sendStageProgress("cover", progress.percent / 100);
          sendProgress && sendProgress(progress.percent / 100);
        })
        .on("end", () => {
          finishedTasks.value++;
          sendStageProgress && sendStageProgress("cover", 1);
          sendProgress && sendProgress(0);
          resolve();
        })
        .on("error", (err) => {
          finishedTasks.value++;
          sendStageProgress && sendStageProgress("cover", 1);
          sendProgress && sendProgress(0);
          reject(err);
        })
        .screenshots({
          timestamps: [screenshotTime],
          filename: screenshotFilename,
          folder: screenshotFolder,
        });
    });
    return {
      outputCoverPath: path
        .relative(
          path.join(__dirname, ".."),
          path.join(screenshotFolder, screenshotFilename)
        )
        .split(path.sep)
        .join("/"),
      message: "封面提取成功",
    };
  },
};

exports.convertFile = async (req, res, next) => {
  try {
    const { file, operations, params, taskId } = req.body;
    const wsClients = req.app.get("wsClients");
    // ws 状态推送方法
    function sendStatus(status) {
      if (wsClients && wsClients.has(taskId)) {
        const ws = wsClients.get(taskId);
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ type: "status", status }));
        }
      }
    }
    // 可选：初始化时推送 idle
    sendStatus("idle");
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
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const fileMd5 = fileRecord.md5 || Date.now();
    const originalExt = path.extname(file.name);
    let outputFileName = `converted_${fileMd5}${originalExt}`;
    let outputPath = path.join(uploadsDir, outputFileName);
    let outputFormat = { format: originalExt.replace(".", "") };
    let tempInputPath = inputPath;
    let tempMp4Path = null;
    if (
      operations.includes("watermark") &&
      path.extname(inputPath).toLowerCase() !== ".mp4"
    ) {
      tempMp4Path = path.join(uploadsDir, `${fileMd5}_temp.mp4`);
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions(["-c:v libx264", "-c:a aac", "-movflags +faststart"])
          .on("progress", (progress) =>
            sendStageProgress("preprocess", progress.percent / 100)
          )
          .on("end", () => {
            sendStageProgress("preprocess", 1);
            resolve();
          })
          .on("error", (err) => {
            sendStageProgress("preprocess", 1);
            reject(err);
          })
          .save(tempMp4Path);
      });
      tempInputPath = tempMp4Path;
    }
    const result = {};
    const messages = [];
    const tasks = [];
    const operationOrder = [
      "clip-segment",
      "scale",
      "compress",
      "framerate",
      "watermark",
      "convert",
      "cover",
    ];
    const sortedOps = operations
      .slice()
      .sort((a, b) => operationOrder.indexOf(a) - operationOrder.indexOf(b));
    let finishedTasks = { value: 0 };
    function sendProgress(subProgress = 0) {
      let progress = ((finishedTasks.value + subProgress) / tasks.length) * 100;
      if (progress > 100) progress = 100;
      if (progress < 0) progress = 0;
    }
    function sendStageProgress(stage, subProgress = 0) {
      let progress = Number.isFinite(subProgress) ? subProgress * 100 : 0;
      progress = Math.max(0, Math.min(100, progress));
      if (wsClients && wsClients.has(taskId)) {
        const ws = wsClients.get(taskId);
        if (ws && ws.readyState === 1) {
          ws.send(JSON.stringify({ type: "progress", stage, progress }));
        }
      }
    }
    sendStatus("converting"); // 任务开始
    for (const operation of sortedOps) {
      if (["gif", "cover"].includes(operation)) {
        tasks.push(
          operationHandlers[operation](
            tempInputPath,
            params[operation],
            fileMd5,
            uploadsDir,
            sendProgress,
            finishedTasks,
            sendStageProgress
          ).then((opResult) => {
            if (opResult) {
              Object.assign(result, opResult);
              messages.push(opResult.message);
            }
          })
        );
      }
    }
    const videoOps = sortedOps.filter((op) => !["gif", "cover"].includes(op));
    if (videoOps.length > 0) {
      tasks.push(
        (async () => {
          let command = ffmpeg(tempInputPath);
          for (const operation of videoOps) {
            const handler = operationHandlers[operation];
            if (handler) {
              const handlerResult = handler(
                command,
                params[operation],
                outputFormat
              );
              if (handlerResult.command) {
                command = handlerResult.command;
                outputFormat = handlerResult.outputFormat || outputFormat;
              }
            }
          }
          outputFileName = `converted_${fileMd5}.${outputFormat.format}`;
          outputPath = path.join(uploadsDir, outputFileName);
          await new Promise((resolve, reject) => {
            command
              .on("start", (cmd) => {})
              .on("progress", (progress) => {
                sendStageProgress("main", progress.percent / 100);
                sendProgress(progress.percent / 100);
              })
              .on("end", () => {
                finishedTasks.value++;
                sendStageProgress("main", 1);
                sendProgress(0);
                resolve();
              })
              .on("error", (err) => {
                finishedTasks.value++;
                sendStageProgress("main", 1);
                sendProgress(0);
                reject(err);
              })
              .save(outputPath);
          });
          result.outputVideoPath = path
            .relative(path.join(__dirname, ".."), outputPath)
            .split(path.sep)
            .join("/");
          messages.push("视频处理成功");
        })()
      );
    }
    await Promise.all(tasks);
    sendProgress(0);
    if (tempMp4Path && fs.existsSync(tempMp4Path)) {
      fs.unlink(tempMp4Path, (err) => {
        if (err) {
          console.warn("删除水印临时文件失败:", tempMp4Path, err);
        }
      });
    }
    sendStatus("completed"); // 任务完成
    return res.json(
      ResponseUtil.success(result, messages.join("、") || "处理成功")
    );
  } catch (err) {
    // 任务失败时推送 failed
    const wsClients = req.app.get("wsClients");
    const { taskId } = req.body || {};
    if (wsClients && wsClients.has(taskId)) {
      const ws = wsClients.get(taskId);
      if (ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: "status", status: "failed" }));
      }
    }
    next(err);
  }
};
