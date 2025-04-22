/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 11:49:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 17:27:18
 * @FilePath: /sbng_cake/shareholder_services/src/common/utils/opentelemetry.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// "use strict";

// const { Resource } = require("@opentelemetry/resources");
// const {
//     OTLPTraceExporter,
// } = require("@opentelemetry/exporter-trace-otlp-proto");

// const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
// const {
//   ExpressInstrumentation,
// } = require("@opentelemetry/instrumentation-express");
// const { registerInstrumentations } = require("@opentelemetry/instrumentation");
// const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
// const {
//   SemanticResourceAttributes,
// } = require("@opentelemetry/semantic-conventions");
// const grpc = require("@grpc/grpc-js");
// const {
//     SimpleSpanProcessor,
//     ConsoleSpanExporter,
//     BatchSpanProcessor
//   } = require("@opentelemetry/sdk-trace-base");

// const provider = new NodeTracerProvider({
//   resource: new Resource({
//     [SemanticResourceAttributes.HOST_NAME]: require("os").hostname(), // 主机名
//     [SemanticResourceAttributes.SERVICE_NAME]: "shareholder_services",
//     [SemanticResourceAttributes.SERVICE_VERSION]: "v1.0.0",
//     [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: "production",
//   }),
// });

// registerInstrumentations({
//   tracerProvider: provider,
//   instrumentations: [new HttpInstrumentation(), ExpressInstrumentation],
// });

// // 通过HTTP上报Trace数据
// const exporter = new OTLPTraceExporter({ url: "http://tracing-analysis-dc-sg-internal.aliyuncs.com/adapt_ggxsl4z02x@1a673e9921f66e4_ggxsl4z02x@53df7ad2afe8301/api/otlp/traces", headers: {},});

// provider.addSpanProcessor(new BatchSpanProcessor(exporter));
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); // 可选，Trace数据打印到终端
// provider.register();

// // 应用代码
// const api = require("@opentelemetry/api");
// const axios = require("axios").default;
// const express = require("express");
// const app = express();

// app.get("/", async (req, res) => {
//   const result = await axios.get("http://localhost:7001/api");
//   return res.status(201).send(result.data);
// });

// app.get("/api", async (req, res) => {
//   const currentSpan = api.trace.getSpan(api.context.active());
//   currentSpan.addEvent("timestamp", { value: Date.now() });
//   currentSpan.setAttribute("tagKey-01", "tagValue-01");
//   res.json({ code: 200, msg: "success" });
// });

// app.use(express.json());

// app.listen(7001, () => {
//   console.log("Listening on http://localhost:7001");
// });
