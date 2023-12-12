import "./App.css";
import {useEffect, useMemo, useState} from "react";
import {bitable, IGridView, FilterOperator, FieldType, IFilterBaseCondition, IFilterTextCondition, IFilterNumberCondition,
    IFilterDateTimeCondition,
    IFilterDateTimeValue,
} from "@lark-base-open/js-sdk";
import {Button, Card, Col, DatePicker, Input, Modal, Row, Select, Space, Table} from "@douyinfe/semi-ui";
import {IconAlarm, IconCrossStroked, IconDelete, IconMinus} from "@douyinfe/semi-icons";
import {useTranslation} from "react-i18next";
import {getFilterOperatorMap} from "./utils";


function Planes() {
    const [planes, setPlanes] = useState<any[]>([])
    const {t} = useTranslation()
    useEffect(() => {
        let plans = localStorage.getItem("plans") || "[]"
        plans = JSON.parse(plans)
        setPlanes(plans)
    }, []);

    return (<Card title={'已保存筛选方案'}>
        <Table columns={[]}  bordered={true}
               showHeader={false}
               pagination={false}
               dataSource={[]}></Table>
    </Card>)

}

/**
 * Filter 组件，用于筛选，
 * @constructor
 */
function Filter({ currentView, fieldList }) {

    const [currentConjunction, setCurrentConjunction] = useState<any>("and")
    const [currentConditions, setCurrentConditions] = useState<any[]>([])
    const [fieldMap, setFieldMap] = useState<any>({})

    const {t} = useTranslation()
    const {filterOperatorMap, operatorMap, conjunction} = getFilterOperatorMap(t)

    useEffect(() => {
        let map = {}
        fieldList.forEach((f) => {
            map[f.value] = f
        })
        setFieldMap(map)
    }, [fieldList]);


    async function getFilterInfo() {
        let filterInfo = await currentView.getFilterInfo()
        console.log(filterInfo)
        if (filterInfo){
            setCurrentConjunction(filterInfo.conjunction)
            setCurrentConditions(filterInfo.conditions)
        }
    }
    useEffect(() => {
        getFilterInfo()

    }, [currentView]);

    let condition = {
        conjunction: "and",
        conditions: [],
    }

    const scroll = useMemo(() => ({  x: "100%" }), []);

    function updateConjunction(value) {
        setCurrentConjunction(value)
        currentView.setFilterConjunction(value)
    }

    function updateConditionValue(item, value) {
        console.log(item, value)
        if (item.conditionId){
            item.value = value
            currentView.updateFilterCondition(item)
            setCurrentConditions([...currentConditions])
        }
    }
    async function changeFilterField(item, value) {
        console.log(item, value)
        // 改字段不生效，只变本地
        if (item.conditionId){
            let filed = fieldMap[value]
            item.fieldId = value
            item.fieldType = filed.type
            delete item.value
            delete item.operator
        }
        setCurrentConditions([...currentConditions])
    }
    async function delCondition(item) {
        console.log(item)
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
        let r = await currentView.addFilterCondition({
            fieldId: defaultField.value,
            operator: defaultOperator,
            value: ""
        })
        if (r){
            await getFilterInfo()
        }
    }

    async function changeOperator(item, value) {
        if (item.conditionId){
            item.operator = value
            if (item.value || item.operator === FilterOperator.IsEmpty || item.operator === FilterOperator.IsNotEmpty){
                await currentView.updateFilterCondition(item)
                getFilterInfo()
            }else {
                setCurrentConditions([...currentConditions])
            }

        }
    }


    // 筛选条件
    const filterOptionsColumns = [
        {
            title: 'fieldId',
            dataIndex: 'fieldId',
            render: (fieldId, c, index) => {
                return (
                        <Select filter optionList={fieldList} value={c.fieldId} onChange={(value)=>{
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
                        updateConditionValue(c, new Date(value).getTime())
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

    function saveCurrentPlane() {
        console.log(planeName)
        let plans = localStorage.getItem("plans") || "[]"
        plans = JSON.parse(plans)
        plans.push({
            name: planeName,
            conjunction: currentConjunction,
            conditions: currentConditions
        })
        localStorage.setItem("plans", JSON.stringify(plans))
        setShowSavePlaneModal(false)

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
            <Card title="快速筛选" footer={<Button onClick={() => {
                setShowSavePlaneModal(true)
            }}>{t("savePlane")}</Button>}>
                <Space vertical={true} align={'start'}>
                    <Select optionList={conjunction} value={currentConjunction}
                            onChange={(value) => {
                                updateConjunction(value)
                            }}
                    />
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
                fields = fields.map((f: any) => {
                    f.label = f.name
                    f.value = f.id
                    return f
                })
            }
            setFieldList(fields)
        }
        getInfo()

        bitable.base.onSelectionChange(async (selection) => {
            getInfo()
        })
    }, []);

    return (<>
        <Filter currentView={currentView} fieldList={fieldList}></Filter>
        <Planes></Planes>
    </>)

}

