import type { WorkDesktopConfig } from '../../types/config'

/**
 * 默认配置层（库内置，不可改）
 * PRD 5.2 / 第 7 章
 */
export const defaultConfig: WorkDesktopConfig = {
  page: {
    global: {
      size: 'default'
    },
    componentDefault: {},
    pager: {
      size: 32,
      pageSizes: [10, 20, 50, 100, 200],
      pageSize: 20,
      layout: 'total, sizes, prev, pager, next, jumper',
      hideOnSinglePage: false
    }
  },
  request: {
    urlPrefix: '',
    throwException: false,
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
      tipsType: 'success',
      showTips: false,
      props: {}
    },
    fail: {
      tipsType: 'warning',
      showTips: true,
      props: {}
    },
    exception: {
      tipsType: 'error',
      showTips: true,
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
