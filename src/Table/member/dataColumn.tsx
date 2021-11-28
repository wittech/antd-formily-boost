import { observer, RecursionField } from '@formily/react';
import { toJS } from '@formily/reactive';
import { ColumnGroupType, ColumnType } from 'antd/lib/table';
import {
    ArrayIndexContextProvider,
    ArrayRecursiveContextProvider,
} from '../components/Context';
import { ColumnSchema, RowRenderType, TableConfig } from './config';
import React from 'react';
import { getDataInIndex } from '../util';
import { DataSourceType } from './virtual';
import { Schema } from '@formily/json-schema';
import { ReactElement } from 'react';
const ST = require('@withub/stjs');

type FastLabelProps = {
    rowData: any;
    labelIndex: string;
};

const FastLabel: React.FC<FastLabelProps> = observer((props) => {
    let result = undefined;
    if (props.rowData instanceof Object) {
        result = props.rowData[props.labelIndex];
    }
    if (result === undefined) {
        return <></>;
    } else {
        return result;
    }
});

type FastRenderProps = {
    rowData: any;
    index: string;
    render: (data: any, index: string) => JSX.Element;
};

const FastRender: React.FC<FastRenderProps> = observer((props) => {
    return props.render(props.rowData, props.index);
});

function getSplitIndex(
    index: string,
    splitLevel: number,
): { realIndex: string } {
    let currentFind = 0;
    let i = index.length - 1;
    for (; i >= 0; i--) {
        if (index[i] != '.') {
            continue;
        }
        currentFind++;
        if (currentFind == splitLevel * 2) {
            break;
        }
    }
    let realIndex = index.substring(0, i);
    if (realIndex == '') {
        // 容错逻辑，一般情况下不会出现
        return { realIndex: index };
    }
    return { realIndex: realIndex };
}

function getDataColumns(
    data: any[],
    tableConfig: TableConfig,
): (ColumnGroupType<object> | ColumnType<object>)[] {
    const convertColumn = (column: ColumnSchema) => {
        if (
            column.columnProps &&
            column.columnProps.children &&
            column.columnProps.children.length != 0
        ) {
            let single: ColumnGroupType<object> = {
                ...column,
                ...column.columnProps,
                children: column.columnProps.children
                    .filter((column) => {
                        return column.type == 'column';
                    })
                    .map(convertColumn),
                render: undefined,
            };
            return single;
        } else {
            let single: ColumnType<object> = {
                ...column,
                ...column.columnProps,
                render: (value: any, record: any, index: number) => {
                    let level: number;
                    if (record._isRecursive) {
                        level = 0;
                    } else {
                        level = record._currentLevel;
                    }
                    const rowRender: RowRenderType =
                        column.columnProps!.rowRender[level];
                    let nextChildIndex = '';
                    if (tableConfig.dataConvertProps.tree.type == 'recursive') {
                        nextChildIndex =
                            tableConfig.dataConvertProps.tree.dataIndex;
                    } else {
                        nextChildIndex =
                            tableConfig.dataConvertProps!.list[level];
                    }

                    function renderNormal(
                        columnSchema: ColumnSchema,
                        index: string,
                        nextChildIndex: string,
                    ) {
                        // 直接返回数据，绕过field，这样做会失去effect，但是效率较高
                        const rowData = getDataInIndex(data, index);

                        //  TODO:如果rowRender.schema里面包括逻辑表达式，则做对应的处理后再继续渲染；
                        const fieldSchema = columnSchema.columnProps?.enableExpr
                            ? new Schema(
                                  ST.transform(
                                      columnSchema.schema.toJSON(),
                                      toJS(rowData),
                                  ),
                              )
                            : columnSchema.schema;

                        // 普通渲染方式
                        const labelIndex = columnSchema.columnProps?.labelIndex;
                        const renderIndex = columnSchema.columnProps?.render;
                        if (labelIndex) {
                            return (
                                <FastLabel
                                    rowData={rowData}
                                    labelIndex={labelIndex}
                                />
                            );
                        } else if (renderIndex) {
                            return (
                                <FastRender
                                    rowData={rowData}
                                    index={index}
                                    render={renderIndex}
                                />
                            );
                        } else {
                            // 正常渲染模式
                            return (
                                <ArrayRecursiveContextProvider
                                    value={nextChildIndex}
                                >
                                    <ArrayIndexContextProvider value={index}>
                                        <RecursionField
                                            name={index}
                                            schema={fieldSchema}
                                            onlyRenderProperties
                                        />
                                    </ArrayIndexContextProvider>
                                </ArrayRecursiveContextProvider>
                            );
                        }
                    }
                    if (rowRender.type == 'none') {
                        // 不渲染
                        return <></>;
                    } else if (rowRender.type == 'normal') {
                        // 普通渲染
                        return renderNormal(
                            rowRender.schema,
                            record._index,
                            nextChildIndex,
                        );
                    } else if (rowRender.type == 'splitRow') {
                        // 合并行渲染
                        const { realIndex } = getSplitIndex(
                            record._index,
                            rowRender.level,
                        );
                        let rowSpan =
                            record._rowSpan[
                                record._rowSpan.length - rowRender.level
                            ];
                        if (rowSpan == 0) {
                            return {
                                children: <></>,
                                props: {
                                    rowSpan: 0,
                                },
                            };
                        } else {
                            return {
                                children: renderNormal(
                                    rowRender.schema,
                                    realIndex,
                                    nextChildIndex,
                                ),
                                props: {
                                    rowSpan: rowSpan,
                                },
                            };
                        }
                    }
                },
            };
            return single;
        }
    };
    return tableConfig.renderColumn.map(convertColumn);
}

export default getDataColumns;
