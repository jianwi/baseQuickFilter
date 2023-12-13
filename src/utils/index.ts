import {FieldType, FilterOperator} from "@lark-base-open/js-sdk";


export function getFilterOperatorMap(t) {
    const conjunction = [{
        value: "and",
        label: t('and')
    }, {
        value: "or",
        label: t('or')
    }]

    const operatorMap = {
        [FilterOperator.Contains]: {
            value: FilterOperator.Contains,
            label: t('FilterOperator.Contains')
        },
        [FilterOperator.DoesNotContain]: {
            value: FilterOperator.DoesNotContain,
            label: t('FilterOperator.DoesNotContain')
        },
        [FilterOperator.IsEmpty]: {
            value: FilterOperator.IsEmpty,
            label: t('FilterOperator.IsEmpty')
        },
        [FilterOperator.IsNotEmpty]: {
            value: FilterOperator.IsNotEmpty,
            label: t('FilterOperator.IsNotEmpty')
        },
        [FilterOperator.Is]: {
            value: FilterOperator.Is,
            label: t('FilterOperator.Is')
        },
        [FilterOperator.IsNot]: {
            value: FilterOperator.IsNot,
            label: t('FilterOperator.IsNot')
        },
        [FilterOperator.IsGreater]: {
            value: FilterOperator.IsGreater,
            label: t('FilterOperator.IsGreater')
        },
        [FilterOperator.IsGreaterEqual]: {
            value: FilterOperator.IsGreaterEqual,
            label: t('FilterOperator.IsGreaterEqual')
        },
        [FilterOperator.IsLess]: {
            value: FilterOperator.IsLess,
            label: t('FilterOperator.IsLess')
        },
        [FilterOperator.IsLessEqual]: {
            value: FilterOperator.IsLessEqual,
            label: t('FilterOperator.IsLessEqual')
        },
    }
    let baseFilter = [operatorMap[FilterOperator.Contains], operatorMap[FilterOperator.DoesNotContain], operatorMap[FilterOperator.IsEmpty], operatorMap[FilterOperator.IsNotEmpty], operatorMap[FilterOperator.Is], operatorMap[FilterOperator.IsNot]]
    let filterOperatorMap = {
        [FieldType.Text]: baseFilter,
        // FilterOperator$1.Is | FilterOperator$1.IsGreater | FilterOperator$1.IsLess | FilterOperator$1.IsEmpty | FilterOperator$1.IsNotEmpty;
        [FieldType.Number]: [operatorMap[FilterOperator.Is], operatorMap[FilterOperator.IsNot], operatorMap[FilterOperator.IsGreater], operatorMap[FilterOperator.IsGreaterEqual], operatorMap[FilterOperator.IsLess], operatorMap[FilterOperator.IsLessEqual], operatorMap[FilterOperator.IsEmpty], operatorMap[FilterOperator.IsNotEmpty]],
        // FilterOperator$1.Is | FilterOperator$1.IsGreater | FilterOperator$1.IsLess | FilterOperator$1.IsEmpty | FilterOperator$1.IsNotEmpty;
        [FieldType.DateTime]: [operatorMap[FilterOperator.Is], operatorMap[FilterOperator.IsNot], operatorMap[FilterOperator.IsGreater], operatorMap[FilterOperator.IsGreaterEqual], operatorMap[FilterOperator.IsLess], operatorMap[FilterOperator.IsLessEqual], operatorMap[FilterOperator.IsEmpty], operatorMap[FilterOperator.IsNotEmpty]],
        [FieldType.Phone]: baseFilter,
        [FieldType.Email]: baseFilter,
        [FieldType.Url]: baseFilter,
        [FieldType.SingleSelect]: baseFilter,
        [FieldType.MultiSelect]: baseFilter,
        [FieldType.Attachment]: [operatorMap[FilterOperator.IsEmpty], operatorMap[FilterOperator.IsNotEmpty]],
        [FieldType.Formula]: [...baseFilter, operatorMap[FilterOperator.IsLess], operatorMap[FilterOperator.IsLessEqual], operatorMap[FilterOperator.IsGreater], operatorMap[FilterOperator.IsGreaterEqual]],
    }

    return {filterOperatorMap, operatorMap, FilterOperator, conjunction}
}