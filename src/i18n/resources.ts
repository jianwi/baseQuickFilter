/**
 *  [FilterOperator.Contains]: {
 *             value: FilterOperator.Contains,
 *             label: t('FilterOperator.Contains')
 *         },
 *         [FilterOperator.DoesNotContain]: {
 *             value: FilterOperator.DoesNotContain,
 *             label: t('FilterOperator.DoesNotContain')
 *         },
 *         [FilterOperator.IsEmpty]: {
 *             value: FilterOperator.IsEmpty,
 *             label: t('FilterOperator.IsEmpty')
 *         },
 *         [FilterOperator.IsNotEmpty]: {
 *             value: FilterOperator.IsNotEmpty,
 *             label: t('FilterOperator.IsNotEmpty')
 *         },
 *         [FilterOperator.Is]: {
 *             value: FilterOperator.Is,
 *             label: t('FilterOperator.Is')
 *         },
 *         [FilterOperator.IsNot]: {
 *             value: FilterOperator.IsNot,
 *             label: t('FilterOperator.IsNot')
 *         },
 *         [FilterOperator.IsGreater]: {
 *             value: FilterOperator.IsGreater,
 *             label: t('FilterOperator.IsGreater')
 *         },
 *         [FilterOperator.IsGreaterEqual]: {
 *             value: FilterOperator.IsGreaterEqual,
 *             label: t('FilterOperator.IsGreaterEqual')
 *         },
 *         [FilterOperator.IsLess]: {
 *             value: FilterOperator.IsLess,
 *             label: t('FilterOperator.IsLess')
 *         },
 *         [FilterOperator.IsLessEqual]: {
 *             value: FilterOperator.IsLessEqual,
 *             label: t('FilterOperator.IsLessEqual')
 *         },
 *
 *
 *
 */


const config = [
    ['and', '符合以下所有条件', 'must match all of the following conditions'],
    ['or', '符合以下任一条件', 'just match any of the following conditions'],
    ['savePlane', '保存当前方案', 'save current plan'],
    ['inputPlanName', '请输入方案名称', 'please input plan name'],
    ['addCondition', '添加条件', 'add condition'],
    ['FilterOperator.Contains', '包含', 'Contains'],
    ['FilterOperator.DoesNotContain', '不包含', 'DoesNotContain'],
    ['FilterOperator.IsEmpty', '为空', 'IsEmpty'],
    ['FilterOperator.IsNotEmpty', '不为空', 'IsNotEmpty'],
    ['FilterOperator.Is', '等于', 'Is'],
    ['FilterOperator.IsNot', '不等于', 'IsNot'],
    ['FilterOperator.IsGreater', '大于', 'IsGreater'],
    ['FilterOperator.IsGreaterEqual', '大于等于', 'IsGreaterEqual'],
    ['FilterOperator.IsLess', '小于', 'IsLess'],
    ['FilterOperator.IsLessEqual', '小于等于', 'IsLessEqual'],
    ['deletePlane', '删除当前方案', 'delete current plan'],
    ['applyPlane', '应用当前方案', 'apply current plan'],
    ['applyFail', '应用失败', 'apply fail'],
    ['deletePlaneConfirm', '确定删除当前方案？', 'confirm delete current plan?'],
    ['updateFail', '更新失败', 'update fail'],
    ['saveSuccess', '保存成功', 'save success'],
    ['setFilterCondition','设置筛选条件','set filter condition'],
    ['searchField','搜索字段','search field'],
]


let rr = {
    zh: {},
    en: {}
}
config.forEach(item => {
    rr.zh[item[0]] = item[1]
    rr.en[item[0]] = item[2]
})

export default rr
