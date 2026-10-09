// 高阶 / 轻量表单 ProForm：fields schema → 栅格 + 受控 + 逐字段校验 + 提交流程。
// 四段：基础（必填/长度/正则）、异步提交（loading + 结果回显）、双列设置（switch/radio/checkbox/textarea）、命令式 actions。
import React from 'react';
import { View, Text, Button, type ProFormField, type ProFormValues, type ProFormActions } from 'react-native-flux-desktop';
import { ProForm } from 'react-native-flux-desktop-pro';
import { DemoPage, type DemoItem, type ApiRow, type TokenRow } from '../DemoPage';

/** 提交结果回显小块。 */
function Result(props: { values: ProFormValues | null }): React.ReactElement | null {
  if (!props.values) return null;
  const keys = Object.keys(props.values);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      <Text style={{ fontSize: 12, color: '#999' }}>已提交：</Text>
      {keys.map((k) => (
        <Text key={k} style={{ fontSize: 12, color: '#333' }}>
          {k}={Array.isArray(props.values![k]) ? props.values![k].join(',') : String(props.values![k])}
        </Text>
      ))}
    </View>
  );
}

const BASIC_FIELDS: ProFormField[] = [
  { name: 'name', label: '用户名', rules: [{ required: true }, { min: 2, max: 12, message: '用户名 2-12 个字符' }], fieldProps: { placeholder: '2-12 个字符' } },
  { name: 'email', label: '邮箱', rules: [{ required: true }, { pattern: /^[\w.-]+@[\w-]+\.[\w.-]+$/, message: '邮箱格式不正确' }], fieldProps: { placeholder: 'name@example.com' } },
  { name: 'age', label: '年龄', type: 'number', rules: [{ min: 18, max: 60, message: '年龄需在 18-60' }], fieldProps: { placeholder: '18 - 60' } },
  {
    name: 'city', label: '城市', type: 'select', rules: [{ required: true, requiredMessage: '请选择常驻城市' }],
    fieldProps: { options: [{ label: '杭州', value: 'hz' }, { label: '上海', value: 'sh' }, { label: '深圳', value: 'sz' }], placeholder: '单选' },
  },
];

function BasicDemo(): React.ReactElement {
  const [done, setDone] = React.useState<ProFormValues | null>(null);
  const actions = React.useRef<ProFormActions | null>(null);
  // 抓帧专用：FLUX_PF_ERR=1 预置非法值并自动提交，静态帧里验错误态回显
  React.useEffect(() => {
    if (process.env.FLUX_PF_ERR === '1') {
      const t = setTimeout(() => {
        actions.current?.setValues({ name: 'a', email: 'not-an-email', age: 7 });
        setTimeout(() => actions.current?.validate(), 50);
      }, 400);
      return () => clearTimeout(t);
    }
  }, []);
  return (
    <View style={{ width: '100%' }}>
      <ProForm fields={BASIC_FIELDS} columns={2} onFinish={(v): void => setDone(v)} actions={actions} submitter={{ submitText: '提交', resetText: '重置' }} />
      <Result values={done} />
    </View>
  );
}

/** 异步提交：onFinish 返回 Promise，期间按钮 loading。 */
function AsyncDemo(): React.ReactElement {
  const [done, setDone] = React.useState<ProFormValues | null>(null);
  return (
    <View style={{ width: '100%' }}>
      <ProForm
        fields={[
          { name: 'app', label: '应用名', rules: [{ required: true }] },
          { name: 'desc', label: '简介', type: 'textarea', fieldProps: { rows: 2, maxLength: 120, showCount: true } },
        ]}
        columns={1}
        onFinish={async (v): Promise<void> => {
          await new Promise((r) => setTimeout(r, 1200));
          setDone(v);
        }}
      />
      <Result values={done} />
    </View>
  );
}

const FULL_FIELDS: ProFormField[] = [
  { name: 'nick', label: '昵称', rules: [{ required: true }] },
  { name: 'level', label: '会员等级', type: 'radio', initialValue: '黄金', fieldProps: { options: ['青铜', '白银', '黄金', '钻石'], optionType: 'button' } },
  { name: 'tags', label: '兴趣标签', type: 'checkbox', initialValue: ['code'], fieldProps: { options: [{ label: '编程', value: 'code' }, { label: '设计', value: 'design' }, { label: '摄影', value: 'photo' }] } },
  { name: 'quota', label: '月度配额', type: 'number', initialValue: 100, fieldProps: { min: 0, max: 9999, suffix: 'GB' } },
  { name: 'notify', label: '邮件通知', type: 'switch', tooltip: '重要动态会发送到你的邮箱' },
  { name: 'signin', label: '个性签名', type: 'textarea', span: 2, fieldProps: { rows: 2, placeholder: '一句话介绍自己（可跨两列：span=2）' } },
];

/** 双列 + 全控件类型。 */
function FullDemo(): React.ReactElement {
  const [done, setDone] = React.useState<ProFormValues | null>(null);
  return (
    <View style={{ width: '100%' }}>
      <ProForm fields={FULL_FIELDS} columns={3} onFinish={(v): void => setDone(v)} />
      <Result values={done} />
    </View>
  );
}

/** 命令式：外部按钮触发 setValues / reset / validate。 */
function ActionsDemo(): React.ReactElement {
  const actions = React.useRef<ProFormActions | null>(null);
  const [log, setLog] = React.useState('点右侧按钮试试');
  return (
    <View style={{ width: '100%', gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <ProForm
            fields={[
              { name: 'title', label: '标题', rules: [{ required: true }] },
              { name: 'budget', label: '预算', type: 'number', rules: [{ min: 100, message: '预算至少 100' }] },
            ]}
            columns={2}
            submitter={false}
            actions={actions}
            onFinish={(v): void => setLog(`校验通过并提交：${JSON.stringify(v)}`)}
          />
        </View>
        <View style={{ width: 120, gap: 8 }}>
          <Button size="small" onPress={(): void => { actions.current?.setValues({ title: '自动填充的标题', budget: 80 }); setLog('setValues：预算填了 80（低于规则下限）'); }}>填值</Button>
          <Button size="small" onPress={(): void => setLog(actions.current?.validate() ? 'validate：通过' : 'validate：不通过（见红字）')}>校验</Button>
          <Button size="small" onPress={(): void => { actions.current?.reset(); setLog('reset：已回到初始值'); }}>重置</Button>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: '#999' }}>{log}</Text>
    </View>
  );
}

function Block(props: { node: React.ReactNode }): React.ReactElement {
  return <View style={{ width: '100%' }}>{props.node}</View>;
}

const DEMOS: DemoItem[] = [
  {
    name: '基础用法',
    desc: '必填红星 + 长度/正则/数值区间校验；提交不过时按钮旁提示错误数',
    node: <BasicDemo />,
    code: [
      'import { ProForm } from "react-native-flux-desktop";',
      '',
      '// fields schema → 栅格 + 逐字段校验；columns 每行列数',
      'const fields = [',
      '  { name: \'name\', label: \'用户名\', rules: [{ required: true }, { min: 2, max: 12, message: \'2-12 个字符\' }] },',
      '  { name: \'email\', label: \'邮箱\', rules: [{ required: true }, { pattern: /^[\\w.-]+@[\\w-]+\\.[\\w.-]+$/, message: \'邮箱格式不正确\' }] },',
      '  { name: \'age\', label: \'年龄\', type: \'number\', rules: [{ min: 18, max: 60 }] },',
      '];',
      '<ProForm fields={fields} columns={2} onFinish={(v) => save(v)} submitter={{ submitText: \'提交\', resetText: \'重置\' }} />',
    ].join('\n'),
  },
  {
    name: '异步提交',
    desc: 'onFinish 返回 Promise → 提交按钮自动 loading 并拦截重复点击',
    node: <AsyncDemo />,
    code: [
      'import { ProForm } from "react-native-flux-desktop";',
      '',
      '// onFinish 返回 Promise → 期间提交按钮 loading 并拦截重复点击',
      '<ProForm',
      '  fields={[',
      '    { name: \'app\', label: \'应用名\', rules: [{ required: true }] },',
      '    { name: \'desc\', label: \'简介\', type: \'textarea\', fieldProps: { rows: 2, maxLength: 120, showCount: true } },',
      '  ]}',
      '  columns={1}',
      '  onFinish={async (v) => { await submit(v); }}',
      '/>',
    ].join('\n'),
  },
  {
    name: '全控件类型',
    desc: 'text / textarea / number / select / radio / checkbox / switch 一表打通',
    node: <FullDemo />,
    code: [
      'import { ProForm } from "react-native-flux-desktop";',
      '',
      '// type 支持 text/textarea/number/select/radio/checkbox/switch',
      '// span 控制跨列宽（span=2 跨两列）',
      'const fields = [',
      '  { name: \'level\', label: \'会员等级\', type: \'radio\', fieldProps: { options: [\'青铜\', \'白银\', \'黄金\'], optionType: \'button\' } },',
      '  { name: \'tags\', label: \'兴趣标签\', type: \'checkbox\', fieldProps: { options: [{ label: \'编程\', value: \'code\' }] } },',
      '  { name: \'notify\', label: \'邮件通知\', type: \'switch\' },',
      '  { name: \'signin\', label: \'个性签名\', type: \'textarea\', span: 2 },',
      '];',
      '<ProForm fields={fields} columns={3} onFinish={(v) => save(v)} />',
    ].join('\n'),
  },
  {
    name: '命令式 actions',
    desc: '外部 ref 句柄：setValues / validate / reset / clearValidate',
    node: <ActionsDemo />,
    code: [
      'import { ProForm, type ProFormActions } from "react-native-flux-desktop";',
      '',
      '// actions ref 句柄：setValues / validate / reset / clearValidate',
      'const actions = React.useRef<ProFormActions | null>(null);',
      '<ProForm fields={fields} columns={2} submitter={false} actions={actions} onFinish={save} />',
      "<Button onPress={() => actions.current?.setValues({ title: '自动填充', budget: 80 })}>填值</Button>",
      '<Button onPress={() => actions.current?.validate()}>校验</Button>',
      '<Button onPress={() => actions.current?.reset()}>重置</Button>',
    ].join('\n'),
  },
];

const API: ApiRow[] = [
  { name: 'fields', desc: '字段 schema 数组（name/label/type/rules/fieldProps/span/render）', type: 'ProFormField[]', default: '–' },
  { name: 'columns', desc: '每行列数（字段按 flexBasis 等分，窄容器自动换行）', type: 'number', default: '2' },
  { name: 'values / defaultValue', desc: '受控 / 初始值；不传 values 即非受控', type: 'Record<string, any>', default: '–' },
  { name: 'onValuesChange', desc: '(本次 patch, 全量 values)', type: 'fn', default: '–' },
  { name: 'onFinish', desc: '校验通过后的提交回调；返回 Promise 期间按钮 loading', type: 'fn', default: '–' },
  { name: 'onFinishFailed', desc: '校验失败回调（errors 映射）', type: 'fn', default: '–' },
  { name: 'submitter', desc: '底部「重置 + 提交」；false 关闭，对象改文案', type: "false | { resetText, submitText }", default: '–' },
  { name: 'actions', desc: '父级 ref 句柄：reset / clearValidate / setValues / validate', type: 'Ref<ProFormActions>', default: '–' },
];

const TOKENS: TokenRow[] = [
  { name: 'label', desc: '字段标签 fontSizeSM + colorTextSecondary，必填前缀 colorError 星号', default: '–' },
  { name: 'error', desc: '错误文案 colorError；控件同步 status=error 描红', default: '–' },
  { name: 'tooltip', desc: '说明文字 colorTextTertiary（无错误时显示）', default: '–' },
  { name: 'gap', desc: '列间隙 marginLG、行间隙 marginSM', default: '–' },
];

export function ProFormDemo(): React.ReactElement {
  return <DemoPage demos={DEMOS} api={API} tokens={TOKENS} />;
}
