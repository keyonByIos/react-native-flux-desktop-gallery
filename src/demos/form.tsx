// FORM：表单容器 + 条目校验。DemoPage 多段式，覆盖 基础(vertical) / 水平布局 / 内联 / 校验规则 / 自定义 validator。
import React from 'react';
import { Form, Input, Select, Switch, InputNumber, Button, Text, View, useToken, type FormRule } from 'react-native-flux-desktop';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 基础用法：vertical 布局 + 必填 */
function BasicDemo(): React.ReactElement {
  const { token } = useToken();
  const [result, setResult] = React.useState<Record<string, any> | null>(null);
  return (
    <View>
      <Form
        layout="vertical"
        initialValues={{ username: '', notice: false }}
        onFinish={(v) => setResult(v)}
        onFinishFailed={(e) => setResult({ errors: e })}
      >
        <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '请输入邮箱' }, { pattern: /.+@.+\..+/, message: '邮箱格式不对' }]}>
          <Input placeholder="name@example.com" />
        </Form.Item>
        <Form.Item label="接收通知" name="notice">
          <Switch />
        </Form.Item>
        <Form.Submit />
      </Form>
      {result ? (
        <Text style={{ marginTop: token.margin, fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          提交结果: {JSON.stringify(result)}
        </Text>
      ) : null}
    </View>
  );
}

/** 水平布局 */
function HorizontalDemo(): React.ReactElement {
  return (
    <Form layout="horizontal" labelWidth={80}>
      <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
        <Input placeholder="请输入姓名" />
      </Form.Item>
      <Form.Item label="年龄" name="age">
        <InputNumber placeholder="数字" />
      </Form.Item>
      <Form.Item label="城市" name="city">
        <Select placeholder="选择城市" options={[{value:'北京',label:'北京'},{value:'上海',label:'上海'},{value:'广州',label:'广州'},{value:'深圳',label:'深圳'}]} />
      </Form.Item>
      <Form.Submit />
    </Form>
  );
}

/** 内联布局 */
function InlineDemo(): React.ReactElement {
  return (
    <Form layout="inline">
      <Form.Item label="关键词" name="kw">
        <Input placeholder="搜索" style={{ width: 160 }} />
      </Form.Item>
      <Form.Item label="类型" name="type">
        <Select placeholder="全部" options={[{value:'文章',label:'文章'},{value:'视频',label:'视频'},{value:'图片',label:'图片'}]} style={{ width: 120 }} />
      </Form.Item>
      <Form.Submit text="查询" />
    </Form>
  );
}

/** 校验规则展示：min/max/pattern */
function ValidationDemo(): React.ReactElement {
  const { token } = useToken();
  const [errs, setErrs] = React.useState<Record<string, string> | null>(null);
  return (
    <View>
      <Form onFinish={() => setErrs(null)} onFinishFailed={(e) => setErrs(e)}>
        <Form.Item label="昵称(2-10字)" name="nick" rules={[{ min: 2, max: 10, message: '昵称 2~10 个字符' }]}>
          <Input placeholder="2-10 字" />
        </Form.Item>
        <Form.Item label="手机号" name="phone" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入合法手机号' }]}>
          <Input placeholder="11 位手机号" />
        </Form.Item>
        <Form.Submit text="校验" />
      </Form>
      {errs ? (
        <Text style={{ marginTop: token.margin, fontSize: token.fontSizeSM, color: token.colorError }}>
          校验失败: {Object.values(errs).join('; ')}
        </Text>
      ) : null}
    </View>
  );
}

/** 自定义异步 validator */
function AsyncDemo(): React.ReactElement {
  const { token } = useToken();
  const [msg, setMsg] = React.useState('');
  const asyncRule: FormRule = {
    validator: (v) => new Promise((resolve) => {
      setTimeout(() => {
        if (v === 'admin') resolve('该用户名已被占用');
        else if (!v) resolve(true);
        else resolve(true);
      }, 500);
    }),
    message: '该用户名已被占用',
  };
  return (
    <View>
      <Form onFinish={() => setMsg('通过')}>
        <Form.Item label="用户名" name="u" rules={[asyncRule]}>
          <Input placeholder="试试 admin" />
        </Form.Item>
        <Form.Submit text="异步校验" />
      </Form>
      {msg ? <Text style={{ marginTop: token.margin, fontSize: token.fontSizeSM, color: token.colorSuccess }}>{msg}</Text> : null}
    </View>
  );
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: 'vertical 布局，必填 + 邮箱正则校验',
    node: <BasicDemo />,
    code: [
      'import { Form, Input, Switch } from "react-native-flux-desktop";',
      '',
      '<Form layout="vertical" initialValues={{ username: \'\', notice: false }} onFinish={(v) => console.log(v)}>',
      '  <Form.Item label="用户名" name="username" rules={[{ required: true, message: \'请输入用户名\' }]}>',
      '    <Input placeholder="请输入" />',
      '  </Form.Item>',
      '  <Form.Item label="邮箱" name="email" rules={[{ required: true }, { pattern: /.+@.+\\..+/, message: \'邮箱格式不对\' }]}>',
      '    <Input placeholder="name@example.com" />',
      '  </Form.Item>',
      '  <Form.Item label="接收通知" name="notice"><Switch /></Form.Item>',
      '  <Form.Submit />',
      '</Form>',
    ].join('\n'),
  },
  {
    name: '水平布局',
    desc: 'horizontal + labelWidth 标签等宽右对齐',
    node: <HorizontalDemo />,
    code: [
      'import { Form, Input, InputNumber, Select } from "react-native-flux-desktop";',
      '',
      '// layout=horizontal 配合 labelWidth 使标签等宽右对齐',
      '<Form layout="horizontal" labelWidth={80}>',
      '  <Form.Item label="姓名" name="name" rules={[{ required: true }]}>',
      '    <Input placeholder="请输入姓名" />',
      '  </Form.Item>',
      '  <Form.Item label="年龄" name="age"><InputNumber placeholder="数字" /></Form.Item>',
      '  <Form.Submit />',
      '</Form>',
    ].join('\n'),
  },
  {
    name: '内联布局',
    desc: 'inline 单行排列，适合搜索栏',
    node: <InlineDemo />,
    code: [
      'import { Form, Input, Select } from "react-native-flux-desktop";',
      '',
      '// layout=inline 单行排列，适合搜索栏',
      '<Form layout="inline">',
      '  <Form.Item label="关键词" name="kw"><Input placeholder="搜索" style={{ width: 160 }} /></Form.Item>',
      '  <Form.Item label="类型" name="type"><Select placeholder="全部" style={{ width: 120 }} /></Form.Item>',
      '  <Form.Submit text="查询" />',
      '</Form>',
    ].join('\n'),
  },
  {
    name: '校验规则',
    desc: 'min/max 长度 + pattern 正则',
    node: <ValidationDemo />,
    code: [
      'import { Form, Input } from "react-native-flux-desktop";',
      '',
      '// rules 支持 required / min / max / pattern',
      '<Form onFinish={(v) => save(v)} onFinishFailed={(e) => show(e)}>',
      '  <Form.Item label="昵称(2-10字)" name="nick" rules={[{ min: 2, max: 10, message: \'昵称 2~10 个字符\' }]}>',
      '    <Input placeholder="2-10 字" />',
      '  </Form.Item>',
      '  <Form.Item label="手机号" name="phone" rules={[{ pattern: /^1[3-9]\\d{9}$/, message: \'请输入合法手机号\' }]}>',
      '    <Input placeholder="11 位手机号" />',
      '  </Form.Item>',
      '  <Form.Submit text="校验" />',
      '</Form>',
    ].join('\n'),
  },
  {
    name: '异步校验',
    desc: 'validator 返回 Promise（模拟唯一性检查）',
    node: <AsyncDemo />,
    code: [
      'import { Form, Input } from "react-native-flux-desktop";',
      '',
      '// validator 返回 Promise（resolve 错误信息或 true）',
      'const asyncRule = {',
      '  validator: (v) => new Promise((resolve) => {',
      '    setTimeout(() => resolve(v === \'admin\' ? \'该用户名已被占用\' : true), 500);',
      '  }),',
      '  message: \'该用户名已被占用\',',
      '};',
      '<Form.Item label="用户名" name="u" rules={[asyncRule]}><Input placeholder="试试 admin" /></Form.Item>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'layout', desc: '布局模式', type: "'vertical'|'horizontal'|'inline'", default: "'vertical'" },
  { name: 'labelWidth', desc: '水平布局标签宽', type: 'number', default: '96' },
  { name: 'initialValues', desc: '初始值', type: 'Record<string, any>', default: '{}' },
  { name: 'onFinish', desc: '校验通过回调', type: '(values) => void', default: '–' },
  { name: 'onFinishFailed', desc: '校验失败回调', type: '(errors) => void', default: '–' },
  { name: 'Form.Item.rules', desc: '校验规则数组', type: 'FormRule[]', default: '[]' },
  { name: 'Form.Item.name', desc: '绑定字段名', type: 'string', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'margin', desc: '条目间距', default: '16' },
  { name: 'colorError', desc: '校验失败红', default: '#ff4d4f' },
  { name: 'fontSizeSM', desc: '辅助文字', default: '12' },
];

export function FormDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
