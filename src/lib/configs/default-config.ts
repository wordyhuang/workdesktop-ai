import type { WorkDesktopConfig } from '../../types/config'
// 版本号与 package.json 同步（单一数据源，发版只改 package.json）
import { version } from '../../../package.json'

/**
 * 默认配置层（库内置，不可改）
 * PRD 5.2 / 第 7 章
 */
export const defaultConfig: WorkDesktopConfig = {
  // 库版本号，界面版本号显示统一从这里读取
  version,
  page: {
    global: {
      size: 'default'
    },
    componentDefault: {
      // Requester 请求触发组件默认值（开发者可通过全局配置覆盖）
      WdRequester: {
        method: 'post'
      }
    },
    pager: {
      size: 32,
      pageSizes: [10, 20, 50, 100, 200],
      pageSize: 20,
      layout: 'total, sizes, prev, pager, next, jumper',
      hideOnSinglePage: false,
      position: 'right'
    }
  },
  request: {
    urlPrefix: '',
    throwException: false,
    // 并发相同请求合并去重（method+url+params 一致只发一次），表列内请求组件等场景自动收敛为一次调用
    dedup: true,
    loading: {
      enable: true,
      props: {
        lock: true,
        text: '加载中...',
        background: 'rgba(255, 255, 255, 0.7)'
      }
    },
    axiosConfig: {
      timeout: 30000
    },
    pageParam: {
      pageField: 'currentPage',
      sizeField: 'pageSize',
      searchField: 'param'
    },
    transform: {}
  },
  response: {
    props: {
      codeName: 'code',
      messageName: 'message',
      dataName: 'data'
    },
    successCode: 0,
    list: {
      listName: 'list',
      totalName: 'total',
      pageSizeName: 'pageSize',
      currentPageName: 'currentPage'
    },
    success: {
      tipsMode: 'message',
      tipsType: 'success',
      showTips: false,
      props: {}
    },
    fail: {
      tipsMode: 'messagebox',
      tipsType: 'error',
      showTips: true,
      title: '操作失败',
      props: {}
    },
    exception: {
      tipsMode: 'messagebox',
      tipsType: 'error',
      showTips: true,
      title: '网络异常',
      props: {}
    },
    complete: {
      tipsType: 'message'
    }
  },
  theme: {
    colors: {},
    cssVars: {}
  }
}
