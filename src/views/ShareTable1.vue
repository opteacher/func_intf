<script setup lang="ts">
import FlexDivider from '@lib/components/FlexDivider.vue'
import { TinyEmitter } from 'tiny-emitter'
import { computed, createVNode, nextTick, onMounted, reactive, ref, watch } from 'vue'
import EditableTable from '@lib/components/EditableTable.vue'
import api from '@/api'
import STable, { avaCmpTypes, extraDict } from '@/types/sTable'
import Mapper, {
  newObjByMapper,
  BaseMapper,
  mapTypeTemps,
  type MapperType
} from '@lib/types/mapper'
import Column from '@lib/types/column'
import FormDialog from '@lib/components/FormDialog.vue'
import { compoOpns, Cond, type CompoType } from '@lib/types'
import { getProp, newOne, pickOrIgnore, replaceObjProps, setProp, swchBoolProp } from '@lib/utils'
import {
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SettingOutlined,
  EyeOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import MemMgrList from '@/components/MemMgrLst.vue'
import TblDirTree from '@/components/TblDirTree.vue'
import type StUser from '@/types/stUser'
import Auth from '@/types/stAuth'
import router from '@/router'
import { operDict } from '@/types/stOpLog'

const layout = reactive({
  rgtEmitter: new TinyEmitter(),
  lftEmitter: new TinyEmitter(),
  leftWid: 200,
  rightWid: 300,
  leftVsb: true,
  rightVsb: true
})
const stableRef = ref()
const shareTable = reactive({
  selected: new STable(),
  tables: [] as STable[],
  emitter: new TinyEmitter(),
  mapper: new Mapper({
    name: {
      type: 'Input',
      label: '表格名称',
      rules: [{ required: true, message: '请输入表格名称' }]
    },
    path: {
      type: 'Cascader',
      label: '存储目录'
    },
    edtMod: {
      type: 'Radio',
      label: '表单类型',
      options: [
        { label: '直接修改', value: 'direct' },
        { label: '表单修改', value: 'form' }
      ]
    },
    size: {
      type: 'Radio',
      label: '尺寸',
      options: [
        { label: '大', value: 'large' },
        { label: '中', value: 'middle' },
        { label: '小', value: 'small' }
      ]
    },
    usrAuth: {
      type: 'Switch',
      label: '用户授权',
      chkLabels: ['不需要', '需要']
    },
    usrReg: {
      type: 'Switch',
      label: '用户注册',
      placeholder: '允许用户自己注册',
      chkLabels: ['不允许', '允许'],
      disabled: [Cond.create('usrAuth', '!=', true)]
    }
  }),
  path: {
    options: [],
    visible: false,
    value: ''
  },
  preview: {
    visible: false,
    selUser: 'admin',
    auth: new Auth(),
    tblProps: {
      count: 0,
      addable: true,
      editable: true as boolean | Function,
      delable: true as boolean | Function,
      filter: (record: any) => {
        if (
          !shareTable.preview.visible ||
          !shareTable.selected.usrAuth ||
          shareTable.preview.selUser === 'admin'
        ) {
          return true
        }
        const auth = shareTable.preview.auth
        if (!auth.queriable) {
          return false
        }
        if (auth.canQryRows.length && !auth.canQryRows[0].prop && !auth.canQryRows[0].value) {
          // 具有全查询权限
          return true
        } else if (auth.qryOnlyOwn) {
          return record.fkUser === shareTable.preview.selUser
        } else {
          return auth.canOperRow('canQryRows', record)
        }
      }
    }
  },
  type: 'data' as 'data' | 'opLog'
})
const emitter = new TinyEmitter()
const columns = computed<Column[]>(() =>
  Object.entries(shareTable.selected.form).map(([key, value]) =>
    setProp(new Column(value.label, key), 'mapper', value)
  )
)
const mapper = computed(() => new Mapper(shareTable.selected.form))
const addColumn = reactive({
  mapper: new Mapper({
    demo: {
      type: 'FormGroup',
      label: '演示',
      canFold: false
    },
    label: {
      type: 'Input',
      label: '列名',
      placeholder: '请输入列名（中文）',
      rules: [{ required: true, message: '必须填写列名！' }],
      onChange: onAddColChange
    },
    key: {
      type: 'Input',
      label: '唯一标识',
      placeholder: '输入标识（英文）',
      rules: [{ required: true, message: '必须填写标识！' }],
      disabled: (form: any) => form.key in shareTable.selected.form,
      onChange: onAddColChange
    },
    type: {
      type: 'Select',
      label: '类型',
      placeholder: '选择类型',
      options: compoOpns.filter(opn => avaCmpTypes.includes(opn.value)),
      rules: [{ required: true, message: '必须选择填入类型！' }],
      onChange: (record: any, ctype: CompoType) => {
        const tmpMapper = getProp(extraDict, ctype) || {}
        const fixMapper = Object.entries(tmpMapper).map(([key, val]) => [
          key,
          setProp(val, 'onChange', onAddColChange)
        ])
        addColumn.emitter.emit('update:mprop', {
          'extra.items': new Mapper(Object.fromEntries(fixMapper))
        })
        addColumn.emitter.emit('update:dprop', extPropsOfType(ctype))
        onAddColChange(record)
      }
    },
    placeholder: {
      type: 'Input',
      label: '提示',
      placeholder: '输入表单框中提示',
      onChange: onAddColChange
    },
    'rules[0].required': {
      type: 'Switch',
      label: '必填/必选',
      onChange: onAddColChange
    },
    desc: {
      type: 'Textarea',
      label: '补充说明',
      placeholder: '输入补充说明',
      onChange: onAddColChange
    },
    extra: {
      type: 'FormGroup',
      label: '额外参数',
      canFold: false,
      display: [Cond.create('type', '!=', undefined)]
    },
    delCol: {
      type: 'Button',
      inner: '删除该列',
      danger: true,
      offset: 4,
      display: ({ key }: any) => key in shareTable.selected.form,
      onClick: (form: MapperType) =>
        Modal.confirm({
          title: '确认删除该列？',
          icon: createVNode(ExclamationCircleOutlined),
          content: '删除该列的同时，列数据也将丢失！',
          onOk: async () => {
            await api.shareTable.stable.update({
              key: shareTable.selected.key,
              form: pickOrIgnore(shareTable.selected.form, [form.key])
            })
            addColumn.emitter.emit('update:visible', false)
            await refresh(shareTable.selected.key)
          }
        })
    }
  }),
  emitter: new TinyEmitter()
})
const userOpns = computed<{ label: string; value: string }[]>(() =>
  [{ label: '管理员', value: 'admin' }].concat(
    (shareTable.selected.fkUsers as StUser[]).map(usr => ({ label: usr.lgnIden, value: usr.key }))
  )
)

onMounted(refresh)
watch(
  () => shareTable.preview.visible,
  () => {
    emitter.emit('refresh')
    if (!shareTable.preview.visible) {
      onPrevUsrSelect('admin')
    } else {
      shareTable.preview.selUser = 'admin'
    }
  }
)

async function refresh(key?: string) {
  shareTable.selected.reset()
  shareTable.tables = await api.shareTable.stable.all()
  if (key) {
    STable.copy(await api.shareTable.stable.get(key), shareTable.selected, true)
  } else if (shareTable.tables.length) {
    STable.copy(
      await api.shareTable.stable.get(shareTable.tables[0].key),
      shareTable.selected,
      true
    )
  }
  onPrevUsrSelect('admin')
  emitter.emit('refresh')
}
function onMouseUp() {
  layout.rgtEmitter.emit('mouseup')
  layout.lftEmitter.emit('mouseup')
}
function onMouseMove(e: MouseEvent) {
  layout.rgtEmitter.emit('mousemove', e)
  layout.lftEmitter.emit('mousemove', e)
}
function onStableTabEdit(key: string, action: string) {
  if (action === 'add') {
    shareTable.emitter.emit('update:visible', true)
  } else {
    Modal.confirm({
      title: '确定删除该表？',
      icon: createVNode(ExclamationCircleOutlined),
      content: '删除表的同时，数据和成员也将丢失！请再三确认！',
      onOk: () => api.shareTable.stable.remove(STable.copy({ key })).then(() => refresh())
    })
  }
}
function onStablesDelete(keys: string[]) {
  return Promise.all(keys.map(key => onStableTabEdit(key, 'delete')))
}
function onEdtColClick(column: any) {
  addColumn.emitter.emit('update:mprop', {
    'extra.items': new Mapper(getProp(extraDict, column.mapper.type) || {})
  })
  addColumn.emitter.emit('update:visible', {
    show: true,
    object: column.mapper
  })
}
function extPropsOfType(type: CompoType) {
  return pickOrIgnore(mapTypeTemps[type](), Object.keys(new BaseMapper()))
}
function onAddColChange(record: any) {
  nextTick(() =>
    addColumn.emitter.emit('update:mprop', {
      'demo.items': new Mapper({ $: record })
    })
  )
}
function onAddPathClick(path: string[]) {
  if (shareTable.path.visible) {
    const key = path.length
      ? path.map((p, idx) => (idx ? '.children' : 'path.options') + `[{value:${p}}]`).join('') +
        '.children'
      : 'path.options'
    shareTable.emitter.emit('update:mprop', {
      [key]: getProp(shareTable.mapper, key, []).concat([
        {
          label: shareTable.path.value,
          value: shareTable.path.value
        }
      ])
    })
    shareTable.emitter.emit('update:dprop', { path: path.concat([shareTable.path.value]) })
    shareTable.path.value = ''
    shareTable.path.visible = false
  } else {
    shareTable.path.visible = true
  }
}
function newColumn() {
  return replaceObjProps(newOne(BaseMapper), {
    rules: [{ required: true, message: '必须输入或选择有效项！' }]
  })
}
async function onEdtColSubmit(form: any, callback: Function) {
  if (form.key in shareTable.selected.form) {
    await api.shareTable.stable.update({
      key: shareTable.selected.key,
      form: replaceObjProps(shareTable.selected.form, {
        [form.key]: pickOrIgnore(form, ['$', 'delCol'])
      })
    })
  } else {
    await api.shareTable.stable.update({
      key: shareTable.selected.key,
      form: Object.fromEntries(
        Object.entries(shareTable.selected.form).concat([
          [form.key, pickOrIgnore(form, ['$', 'delCol'])]
        ])
      )
    })
  }
  callback()
  await refresh(shareTable.selected.key)
}
function addColDemoChange(show: boolean) {
  addColumn.emitter.emit('update:mprop', { 'demo.display': show })
}
async function onEdtStblSubmit(form: STable, callback: Function) {
  const oper = form.key ? 'update' : 'add'
  await api.shareTable.stable[oper](form)
  callback()
  await refresh(form.key)
}
function onEdtStblClick(stbl: any = shareTable.selected) {
  shareTable.emitter.emit('update:visible', {
    show: true,
    object: STable.copy(stbl)
  })
}
async function onPrevUsrSelect(key: string) {
  const prev = shareTable.preview
  if (key === 'admin') {
    prev.auth.reset()
    prev.auth.canAddNum = '*'
    prev.tblProps.addable = true
    prev.tblProps.editable = true
    prev.tblProps.delable = true
    prev.tblProps.count = 0
    emitter.emit('refresh')
    return
  }
  const user = (shareTable.selected.fkUsers as StUser[]).find(usr => usr.key === key) as StUser
  Auth.copy(user.auth, prev.auth, true)
  prev.tblProps.count = await api.shareTable.data(shareTable.selected.key).count(key)
  prev.tblProps.addable =
    !prev.visible ||
    (prev.auth.addable &&
      (prev.auth.canAddNum === '*' || prev.tblProps.count < prev.auth.canAddNum))
  if (prev.visible) {
    if (prev.auth.updOnlyOwn) {
      const keys = await api.shareTable
        .data(shareTable.selected.key)
        .all({ axiosConfig: { params: { uid: user.key } } })
        .then(records => records.map(record => record.key))
      prev.tblProps.editable = (record: any) => keys.includes(record.key)
    } else {
      prev.tblProps.editable = (record: any) => prev.auth.canOperRow('canUpdRows', record)
    }
    if (prev.auth.delOnlyOwn) {
      const keys = await api.shareTable
        .data(shareTable.selected.key)
        .all({ axiosConfig: { params: { uid: user.key } } })
        .then(records => records.map(record => record.key))
      prev.tblProps.delable = (record: any) => keys.includes(record.key)
    } else {
      prev.tblProps.delable = (record: any) => prev.auth.canOperRow('canDelRows', record)
    }
  } else {
    prev.tblProps.editable = !prev.visible || prev.auth.updatable
    prev.tblProps.delable = !prev.visible || prev.auth.deletable
  }
  emitter.emit('refresh')
}
function onShareTableClick() {
  const url = router.resolve({
    path: '/func_intf/share_table/data',
    query: { tid: shareTable.selected.key, fullView: 1 }
  })
  window.open(url.href, '_blank')
}
</script>

<template>
  <a-layout class="h-full" @mouseup="onMouseUp" @mousemove="onMouseMove">
    <template v-if="!shareTable.preview.visible">
      <a-layout-sider v-show="layout.leftVsb" class="pr-3" theme="light" :width="layout.leftWid">
        <TblDirTree
          :stables="shareTable.tables"
          :sel-key="shareTable.selected.key"
          @update:sel-key="(key: string) => refresh(key)"
          @add-table="(obj: object) => onEdtStblClick(obj)"
          @del-tables="onStablesDelete"
        />
      </a-layout-sider>
      <FlexDivider
        orientation="vertical"
        v-model:wid-hgt="layout.leftWid"
        :emitter="layout.lftEmitter"
        ctrl-side="leftTop"
        bg-color="white"
        hbtn-txt="共享表格"
        :hide-btn="true"
        :hbtn-pos="{ bottom: '10px' }"
        :is-hide="!layout.leftVsb"
        @hbtn-click="() => swchBoolProp(layout, 'leftVsb')"
      />
    </template>
    <a-layout-content class="flex flex-col bg-white px-3">
      <a-tabs
        v-if="!shareTable.preview.visible"
        v-model:activeKey="shareTable.selected.key"
        type="editable-card"
        @change="refresh"
        @edit="onStableTabEdit"
      >
        <template #addIcon>
          <a-tooltip>
            <template #title>新增表格</template>
            <PlusOutlined />
          </a-tooltip>
        </template>
        <template #rightExtra>
          <a-space v-if="shareTable.selected.key">
            <a-button type="link" @click="() => onEdtStblClick()">
              <template #icon><SettingOutlined /></template>
              配置表格
            </a-button>
            <a-button type="primary" @click="() => (shareTable.preview.visible = true)">
              <template #icon><EyeOutlined /></template>
              浏览
            </a-button>
          </a-space>
        </template>
        <a-tab-pane v-for="stable in shareTable.tables" :key="stable.key" :tab="stable.name" />
      </a-tabs>
      <a-page-header
        v-else
        class="px-0 pt-0 pb-3"
        title="返回一页表"
        @back="() => (shareTable.preview.visible = false)"
      >
        <template #subTitle>
          当前用户：
          <a-select
            :options="userOpns"
            v-model:value="shareTable.preview.selUser"
            @select="onPrevUsrSelect"
          />
          。如果设有权限控制，则实际有登录页面
        </template>
        <template #extra>
          <a-button type="primary" @click="onShareTableClick">
            <template #icon><ShareAltOutlined /></template>
            查看共享表格
          </a-button>
        </template>
      </a-page-header>
      <div v-if="shareTable.selected.key" class="flex-1">
        <EditableTable
          v-if="shareTable.type === 'opLog'"
          thd-class="px-0 py-2"
          size="small"
          :pagable="true"
          :api="api.shareTable.opLog(shareTable.selected.key)"
          :columns="[
            new Column('用户', 'fkUser'),
            new Column('操作类型', 'otype'),
            new Column('操作前记录', 'former'),
            new Column('操作后记录', 'latter')
          ]"
          :emitter="emitter"
          :addable="false"
          :editable="false"
          :delable="false"
        >
          <template #title>
            <a-radio-group v-model:value="shareTable.type" @change="() => emitter.emit('refresh')">
              <a-radio-button value="data">数据表</a-radio-button>
              <a-radio-button value="opLog">操作日志</a-radio-button>
            </a-radio-group>
          </template>
          <template #otype="{ record }: any">
            <a-tag :color="operDict[record.otype].color">{{ operDict[record.otype].label }}</a-tag>
          </template>
          <template #fkUser="{ record }: any">
            {{ record.fkUser || '管理员' }}
          </template>
          <template #former="{ record }: any">
            <template v-if="!record.former">无</template>
            <pre v-else class="whitespace-pre-wrap break-words">{{
              JSON.stringify(record.former)
            }}</pre>
          </template>
          <template #latter="{ record }: any">
            <template v-if="!record.latter">无</template>
            <pre v-else class="whitespace-pre-wrap break-words">{{
              JSON.stringify(record.latter)
            }}</pre>
          </template>
        </EditableTable>
        <EditableTable
          v-else
          thd-class="px-0 py-2"
          ref="stableRef"
          :title="shareTable.preview.visible ? shareTable.selected.name : undefined"
          :rounded="false"
          :size="shareTable.selected.size"
          :pagable="true"
          :im-export="
            shareTable.preview.visible
              ? false
              : {
                  expable: true,
                  impable: true,
                  uploadUrl: '/share-table/api/v1/file/upload',
                  expName: shareTable.selected.name
                }
          "
          :edit-mode="shareTable.selected.edtMod"
          :emitter="emitter"
          :api="api.shareTable.data(shareTable.selected.key)"
          :filter="shareTable.preview.tblProps.filter"
          :mapper="mapper"
          :columns="columns"
          :addable="shareTable.preview.tblProps.addable"
          :editable="shareTable.preview.tblProps.editable"
          :delable="shareTable.preview.tblProps.delable"
          :new-fun="() => newObjByMapper(mapper)"
        >
          <template v-if="!shareTable.preview.visible" #title>
            <a-radio-group v-model:value="shareTable.type" @change="() => emitter.emit('refresh')">
              <a-radio-button value="data">数据表</a-radio-button>
              <a-radio-button value="opLog">操作日志</a-radio-button>
            </a-radio-group>
          </template>
          <template v-for="col in columns" #[`${col.key}HD`]="{ column }: any">
            <a-button
              v-if="!shareTable.preview.visible"
              class="p-0 border-0"
              type="link"
              @click="() => onEdtColClick(column)"
            >
              <template #icon><EditOutlined /></template>
              {{ column.title }}
            </a-button>
            <template v-else>{{ column.title }}</template>
          </template>
          <template #right="{ height }: { height: number }">
            <a-tooltip>
              <template #title>添加列</template>
              <a-button
                v-if="!shareTable.preview.visible"
                class="bg-[#fafafa] hover:bg-[#00000010] rounded-l-none border-l-0 border-[#f0f0f0]"
                :style="{ height: height + 'px' }"
                @click="() => addColumn.emitter.emit('update:visible', true)"
              >
                <template #icon><PlusOutlined /></template>
              </a-button>
            </a-tooltip>
          </template>
        </EditableTable>
      </div>
      <FormDialog
        title="添加列"
        :mapper="addColumn.mapper"
        :emitter="addColumn.emitter"
        :new-fun="newColumn"
        :ign-props="['$']"
        @update:visible="() => addColumn.emitter.emit('update:mprop', { 'demo.items': {} })"
        @before-submit="() => addColDemoChange(false)"
        @submit="onEdtColSubmit"
      >
        <template #keySFX="{ formState }: any">
          <a-button
            v-if="!(formState.key in shareTable.selected.form)"
            @click="() => (formState.key = formState.label)"
          >
            同列名
          </a-button>
        </template>
        <template #rules[0].requiredSFX="{ formState }: any">
          <a-form-item-rest>
            <a-input
              :disabled="!formState.rules[0].required"
              placeholder="输入错误提示信息"
              v-model:value="formState.rules[0].message"
            />
          </a-form-item-rest>
        </template>
      </FormDialog>
      <FormDialog
        title="添加表"
        :mapper="shareTable.mapper"
        :emitter="shareTable.emitter"
        :new-fun="() => newOne(STable)"
        @submit="onEdtStblSubmit"
      >
        <template #path="{ formState }: any">
          <a-form-item-rest>
            <div class="flex space-x-2">
              <a-cascader
                class="flex-1"
                :options="shareTable.mapper.path.options"
                :placeholder="shareTable.mapper.path.placeholder || '请选择'"
                :value="formState.path"
                change-on-select
                @change="(newVal: any) => (formState.path = newVal)"
              />
              <a-input
                v-if="shareTable.path.visible"
                class="w-40"
                placeholder="空目录不会被创建"
                v-model:value="shareTable.path.value"
                allow-clear
              />
              <a-button
                type="primary"
                :ghost="!shareTable.path.visible"
                @click="() => onAddPathClick(formState.path)"
              >
                创建目录
              </a-button>
            </div>
          </a-form-item-rest>
        </template>
      </FormDialog>
    </a-layout-content>
    <template v-if="!shareTable.preview.visible && shareTable.selected.usrAuth">
      <FlexDivider
        orientation="vertical"
        v-model:wid-hgt="layout.rightWid"
        :emitter="layout.rgtEmitter"
        ctrl-side="rightBottom"
        bg-color="white"
        hbtn-txt="成员管理"
        :hide-btn="true"
        :is-hide="!layout.rightVsb"
        :hbtn-pos="{ bottom: '10px' }"
        @hbtn-click="() => swchBoolProp(layout, 'rightVsb')"
      />
      <a-layout-sider v-show="layout.rightVsb" theme="light" class="pl-3" :width="layout.rightWid">
        <MemMgrList
          :stable="shareTable.selected"
          @refresh="() => refresh(shareTable.selected.key)"
        />
      </a-layout-sider>
    </template>
  </a-layout>
</template>
