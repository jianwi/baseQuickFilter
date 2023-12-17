import "./App.css";
import {useEffect, useMemo, useState} from "react";
import {bitable, IGridView, FilterOperator, FieldType, IFilterBaseCondition, IFilterTextCondition, IFilterNumberCondition,
    IFilterDateTimeCondition,
    IFilterDateTimeValue,
} from "@lark-base-open/js-sdk";
import {Button, Card, Col, DatePicker, Input, Modal, Row, Select, Space, Table, Toast} from "@douyinfe/semi-ui";
import {IconAlarm, IconConnectionPoint1, IconCrossStroked, IconDelete, IconMinus, IconSend} from "@douyinfe/semi-icons";
import {useTranslation} from "react-i18next";
import {getFilterOperatorMap} from "./utils";


function Planes({currentPlanInfo, setCurrentPlanInfo, currentView, savedPlans, updateSavedPlans}) {
    const {t} = useTranslation()


    function deletePlane(record) {
        Modal.confirm({
            title: t('deletePlane'),
            content: t('deletePlaneConfirm'),
            onOk: async ()=>{
                let {tableId} = await bitable.base.getSelection()
                let plans = localStorage.getItem(`plans_${tableId}`) || "[]"
                let plansArray = JSON.parse(plans)
                plansArray = plansArray.filter((p)=>p.name !== record.name)
                localStorage.setItem(`plans_${tableId}`, JSON.stringify(plansArray))
                updateSavedPlans()
            }
        })

    }

    let columns = [
        {
            title: 'name',
            dataIndex: 'name'
        },
        {
            title: 'action',
            dataIndex: 'action',
            width: 100,
            render: (value, record, index) => {
                return (<Space>
                    <Button icon={<IconSend />} size='small' onClick={async ()=>{
                        console.log("使用此方案", record)
                        // 清空条件
                        let filterInfo = await currentView.getFilterInfo()
                        if (filterInfo){
                            for (let c of filterInfo.conditions){
                                await currentView.deleteFilterCondition(c.conditionId)
                            }
                        }

                        try {
                            for (let c of record.conditions){
                                await currentView.addFilterCondition(c)
                            }
                        }catch (e) {
                            Toast.error({
                                content: t("applyFail")
                            })
                        }

                        currentView.setFilterConjunction(record.conjunction)
                        setCurrentPlanInfo(record)

                    }}>{t('applyPlane')}</Button>

                    <Button type={"danger"} icon={<IconDelete />} size='small' onClick={ ()=>{
                        deletePlane(record)
                    }} >{t('deletePlane')}</Button>


                    </Space>)

            }
        }]


    return (<Card title={'已保存筛选方案'}>
        <Table columns={columns}  bordered={true}
               showHeader={false}
               pagination={false}
               dataSource={savedPlans}></Table>
    </Card>)

}

/**
 * Filter 组件，用于筛选，
 * @constructor
 */
function Filter({   currentView,
                    fieldList,
                    currentConjunction,
                    setCurrentConjunction,
                    currentConditions,
                    setCurrentConditions,
                    updateSavedPlans,
                    getFilterInfo,
                    currentPlanInfo,
                    setCurrentPlanInfo,
                    fieldMap }) {
    const {t} = useTranslation()
    const {filterOperatorMap, operatorMap, conjunction} = getFilterOperatorMap(t)

    useEffect(() => {
        if (currentPlanInfo){
            getFilterInfo()
        }
    }, [currentPlanInfo]);

    function updateConjunction(value) {
        setCurrentConjunction(value)
        currentView.setFilterConjunction(value)
    }

    async function updateConditionValue(item, value) {
        if (item.conditionId && !item.conditionId.startsWith("fakeId_")){
            item.value = value
            currentView.updateFilterCondition(item)
            setCurrentConditions([...currentConditions])
            return
        }else {
            // 本地更新
            item.value = value
            await currentView.addFilterCondition(item)
            await getFilterInfo()
        }
    }
    async function changeFilterField(item, value) {
        // 改字段不生效，只变本地
        let filed = fieldMap[value]
        item.fieldId = value
        item.fieldType = filed.type
        delete item.value
        delete item.operator
        setCurrentConditions([...currentConditions])
    }
    async function delCondition(item) {
        console.log(item)
        if (!item.conditionId){
            return
        }
        if (item.conditionId.startsWith("fakeId_")){
            setCurrentConditions([...currentConditions.filter((c)=>c.conditionId !== item.conditionId)])
            return
        }
        let r = await currentView.deleteFilterCondition(item.conditionId)
        if (r){
            setCurrentConditions([...currentConditions.filter((c)=>c.conditionId !== item.conditionId)])
        }
        console.log(r)
    }

    async function addCondition() {
        let defaultField = fieldList[0]
        let defaultOperator = FilterOperator.IsNotEmpty
        if (defaultField.type === FieldType.Text){
            defaultOperator = FilterOperator.Contains
        }
        console.log(defaultField)
        let condition = {
            conditionId: "fakeId_"+ Math.floor(Math.random()*1000000),
            fieldId: "",
            operator: defaultOperator,
            value: ""
        }
        setCurrentConditions([...currentConditions, condition])

        // let r = await currentView.addFilterCondition({
        //     fieldId: defaultField.value,
        //     operator: defaultOperator,
        //     value: ""
        // })
        // if (r){
        //     await getFilterInfo()
        // }
    }

    async function changeOperator(item, value) {
        if (item.conditionId && !item.conditionId.startsWith("fakeId_")){
            item.operator = value
            if (item.value || item.operator === FilterOperator.IsEmpty || item.operator === FilterOperator.IsNotEmpty){
                try {
                    await currentView.updateFilterCondition(item)
                }catch (e) {
                    Toast.error({
                        content: t("updateFail")
                    })
                }
                getFilterInfo()
            }else {
                setCurrentConditions([...currentConditions])
            }

        }else {
            if (value === FilterOperator.IsEmpty || value === FilterOperator.IsNotEmpty){
                item.value = value
                item.operator = value
                await currentView.addFilterCondition(item)
                await getFilterInfo()
                return
            }
            item.operator = value
            setCurrentConditions([...currentConditions])
        }
    }


    // 筛选条件
    const filterOptionsColumns = [
        {
            title: 'fieldId',
            dataIndex: 'fieldId',
            width: 200,
            render: (fieldId, c, index) => {
                return (
                        <Select filter
                                placeholder={t("searchField")}
                                optionList={fieldList} value={c.fieldId} onChange={(value)=>{
                            changeFilterField(c, value)
                        }}></Select>
                );
            },
        },
        {
            title: 'type',
            dataIndex: 'type',
            render: (type, c, index) => {
                return (<Select optionList={filterOperatorMap[c.fieldType] || [operatorMap.isEmpty,operatorMap.isNotEmpty]} value={c.operator} defaultValue={FilterOperator.Contains}
                                onChange={(value)=>{
                                    changeOperator(c, value)
                                }}
                ></Select>)
            }
        },
        {
            title: 'value',
            dataIndex: 'value',
            render: (value, c, index) => {
                if (c.operator === FilterOperator.IsEmpty || c.operator === FilterOperator.IsNotEmpty){
                    return null
                }

                if (c.fieldType === FieldType.SingleSelect || c.fieldType === FieldType.MultiSelect){
                    // 选项
                    console.log(fieldMap)
                    let fieldInfo = fieldMap[c.fieldId]
                    if (!fieldInfo){
                        return null
                    }
                    console.log(fieldInfo)
                    let options = fieldInfo.property.options.map(item=>{
                        return {
                            label: item.name,
                            value: item.id
                        }
                    })
                    console.log("单选的值", c.value)
                    if (typeof c.value === "string"){
                        c.value = [c.value]
                    }
                    return (<Select multiple={true} filter={true} optionList={options} value={c.value} onChange={(value)=>{
                        updateConditionValue(c, value)
                    }}></Select>)
                }

                if (c.fieldType === FieldType.Number){
                    return (<Input type='number' value={c.value} onChange={(value)=>{
                        updateConditionValue(c, Number(value))
                    }}/>)
                }
                if (c.fieldType === FieldType.DateTime){
                    return (<DatePicker value={c.value} onChange={(value)=>{
                        if (!value) return
                        updateConditionValue(c, new Date(value+"").getTime())
                    }}></DatePicker>)
                }

                return (<Input  value={c.value} onChange={(value)=>{
                    updateConditionValue(c, value)
                }}></Input>)
            }
        },
        {
            title: "action",
            dataIndex: "action",
            render: (value, c, index) => {
                return (<Button icon={<IconCrossStroked />} size='small' onClick={()=>{
                    delCondition(c)
                }} ></Button>)

            }
        }]

    const [planeName, setPlaneName] = useState("")

    async function saveCurrentPlane() {
        let {tableId} = await bitable.base.getSelection()
        let plans = localStorage.getItem(`plans_${tableId}`) || "[]"
        let plansArray = JSON.parse(plans)
        plansArray.push({
            name: planeName,
            conjunction: currentConjunction,
            conditions: currentConditions
        })
        localStorage.setItem(`plans_${tableId}`, JSON.stringify(plansArray))
        setShowSavePlaneModal(false)
        updateSavedPlans()
        Toast.success({
            content: t("saveSuccess")
        })
    }

    const [showSavePlaneModal, setShowSavePlaneModal] = useState(false)

    return (
        <>
            <Modal width={300} visible={showSavePlaneModal} onOk={saveCurrentPlane} onCancel={()=>{
                setShowSavePlaneModal(false)
            }}>
                <div>
                    {t("inputPlanName")}: <Input onChange={(v)=>setPlaneName(v)}></Input>
                </div>
            </Modal>
            <Card footer={<Button theme={true} onClick={() => {
                setShowSavePlaneModal(true)
            }}>{t("savePlane")}</Button>} >
                <Space vertical={true} align={'start'}>
                    <div style={{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center"}}>
                        <h3>{t('setFilterCondition')}</h3>
                        <Select
                            optionList={conjunction} value={currentConjunction}
                            style={{width: 200}}
                                onChange={(value) => {
                                    updateConjunction(value)
                                }}
                        />
                    </div>
                    <Table
                        bordered={true}
                        showHeader={false}
                        pagination={false} columns={filterOptionsColumns}
                        dataSource={currentConditions}></Table>
                </Space>

                <div style={{marginTop: 13}}>
                    <Button onClick={() => {
                        addCondition()
                    }}>{t("addCondition")}</Button>
                </div>
            </Card>
        </>)
}


export default function App() {
    const [currentView, setCurrentView] = useState<IGridView>(null);
    const [fieldList, setFieldList] = useState<any[]>([])

    const [currentConjunction, setCurrentConjunction] = useState<any>("and")
    const [currentConditions, setCurrentConditions] = useState<any[]>([])
    const [fieldMap, setFieldMap] = useState<any>({})
    const [savedPlanes, setSavedPlanes] = useState<any[]>([])
    const [currentPlanInfo, setCurrentPlanInfo] = useState<any>(null)

    async function updateSavedPlans() {
        // 仅查找当前表格的筛选条件
        let {tableId} = await bitable.base.getSelection()
        let plans = localStorage.getItem(`plans_${tableId}`) || "[]"
        let plansArray = JSON.parse(plans)
        setSavedPlanes(plansArray)
    }

    async function getFilterInfo() {
        let filterInfo = await currentView.getFilterInfo()
        if (filterInfo){
            setCurrentConditions(filterInfo.conditions)
            setCurrentConjunction(filterInfo.conjunction)
        }
    }


    useEffect(() => {
        // 获取当前视图id 和 已保存的视图
        async function getInfo() {
            let selection = await bitable.base.getSelection()
            console.log(selection)
            let {viewId, tableId} = selection
            let table = await bitable.base.getTable(tableId)
            let view: IGridView = (await table.getViewById(viewId)) as IGridView
            setCurrentView(view)

            let fields = await table.getFieldMetaList()
            if (fields) {
                console.log(fields)
                let map = {}
                fields = fields.map((f: any) => {
                    f.label = f.name
                    f.value = f.id
                    map[f.value] = f
                    return f
                })
                setFieldMap(map)
            }
            setFieldList(fields)
        }
        getInfo()
        getFilterInfo()
        updateSavedPlans()

        bitable.base.onSelectionChange(async (selection) => {
            getInfo()
        })
    }, []);

    return (<>
        <Filter currentConditions={currentConditions}
                setCurrentConditions={setCurrentConditions}
                currentConjunction={currentConjunction}
                setCurrentConjunction={setCurrentConjunction}
                currentView={currentView}
                fieldList={fieldList}
                fieldMap={fieldMap}
                getFilterInfo={getFilterInfo}
                updateSavedPlans={updateSavedPlans}
                currentPlanInfo={currentPlanInfo}
                setCurrentPlanInfo={setCurrentPlanInfo}
        ></Filter>
        <div style={{marginTop:"30px"}}></div>
        <Planes
            currentPlanInfo={currentPlanInfo}
            setCurrentPlanInfo={setCurrentPlanInfo}
            currentView={currentView}
            savedPlans={savedPlanes}
            updateSavedPlans={updateSavedPlans}
        ></Planes>
    </>)

}

