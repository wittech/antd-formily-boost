import { RecursionField } from '@formily/react';
import { ExpandableConfig } from 'antd/lib/table/interface';
import { ArrayIndexContextProvider } from '../components/Context';
import { TableConfig } from './config';
import { flatDataInIndex, fillDataInIndex } from '../util';
import React from 'react';
import { batch } from '@formily/reactive';

function getExpandableRow(
    data: any[],
    tableConfig: TableConfig,
): ExpandableConfig<any> | undefined {
    if (!tableConfig.expandableColumn) {
        return;
    }
    let expandableColumn = tableConfig.expandableColumn;
    const expandedRowRender = (record: any, index: number) => {
        return (
            <ArrayIndexContextProvider value={record._index}>
                <RecursionField
                    name={record._index}
                    schema={expandableColumn.schema}
                    onlyRenderProperties
                />
            </ArrayIndexContextProvider>
        );
    };
    const expandedIndex = expandableColumn.expandableProps?.expandedIndex!;
    const expandedRowKeys = flatDataInIndex(
        data,
        expandedIndex,
        '',
        0,
        !!expandableColumn.expandableProps?.defaultExpand,
        tableConfig.dataConvertProps.tree,
    );
    const onExpandedRowsChange = (newExpandedRowKeys: any) => {
        batch(() => {
            fillDataInIndex(
                data,
                expandedIndex,
                expandedRowKeys,
                newExpandedRowKeys,
            );
        });
    };
    return {
        expandedRowRender: expandedRowRender,
        onExpandedRowsChange: onExpandedRowsChange,
        expandedRowKeys: expandedRowKeys,
        ...expandableColumn.expandableProps,
    };
}

export default getExpandableRow;
