// import { graphDataApi } from '@/api/memoryGraph'
import graphData from '@/mock/graphData'
import { ElMessage } from 'element-plus'

export const getCurrentSchemaApi = async () => {
  try {
    const res: { code: string; msg: string; data: { schema: string } } = await new Promise((resolve) =>
      setTimeout(() => resolve({ code: '200', msg: '获取当前Schema成功', data: { schema: 'A' } }), 1000)
    )
    if (res.code !== '200') {
      ElMessage.error(res.msg)
      return null
    }
    return res.data.schema
  } catch (error) {
    console.error('获取当前Schema失败:', error)
    return null
  }
}

export const getGraphVersionApi = async () => {
  try {
    const res: { code: string; msg: string; data: { version: string } } = await new Promise((resolve) =>
      setTimeout(() => resolve({ code: '200', msg: '获取图谱版本成功', data: { version: 'V6.0' } }), 1000)
    )
    if (res.code !== '200') {
      ElMessage.error(res.msg)
      return null
    }
    return res.data.version
  } catch (error) {
    console.error('获取图谱版本失败:', error)
    return null
  }
}

/** 获取图谱数据 */
export const getGraphDataApi = async () => {
  try {
    // const res = await getGraphData()
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 可以通过修改这里来测试空状态
    // 使用 emptyGraphData 来测试空状态显示
    const res = {
      data: {
        msg: '200',
        data: graphData // 改为 emptyGraphData 可测试空状态
      }
    }

    if (res.data.msg !== '200') {
      ElMessage.error(res.data.msg)
      return null
    }
    return res.data.data
  } catch (error) {
    console.error('获取图数据失败:', error)
    return null
  }
}

/** 获取图谱编辑状态 */
export const getGraphEditStatusApi = async () => {
  try {
    const res: { code: string; msg: string; data: { canEdit: boolean } } = await new Promise(
      (resolve) =>
        setTimeout(
          () =>
            resolve({ code: '200', msg: '图谱正在发布中，暂时无法编辑', data: { canEdit: true } }),
          1000
        )
    )
    if (res.code !== '200') {
      ElMessage.error(res.msg)
      return false
    }
    return res.data.canEdit
  } catch (error) {
    console.error('状态获取失败:', error)
    return false
  }
}

export const deleteEntityApi = async (entityId: string) => {
  try {
    const res: { code: string; msg: string; data: { entityId: string } } = await new Promise(
      (resolve) =>
        setTimeout(() => resolve({ code: '200', msg: '删除实体成功', data: { entityId } }), 1000)
    )
    if (res.code !== '200') {
      ElMessage.error(res.msg)
      return false
    }
    return true
  } catch (error) {
    ElMessage.warning('删除失败')
    console.error('删除实体失败:', error)
    return false
  }
}
