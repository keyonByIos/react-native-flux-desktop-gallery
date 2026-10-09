// ⚠️ 必须作为入口第一行副作用导入：在 react 被 require 之前决定用哪个构建。
// 动机：此前 gallery/打包启动全程跑 React development 构建（start 脚本设了 FLUX_PACKAGED=1 却没设 NODE_ENV）。
// production 构建去掉 fiber 调试字段与 warning 字符串：大组件树省 20~40MB heap + reconcile 快 2~3×，零画质损失。
// 仅当「打包态且未显式指定 NODE_ENV」时切 production；显式设过（含 =development）一律尊重，便于随时切回落告警。
if (process.env.FLUX_PACKAGED === '1' && !process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}
export {};
