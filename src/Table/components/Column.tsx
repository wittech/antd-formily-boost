import React, { Fragment, ReactElement } from 'react';
import { KeyProps } from './KeyProps';

// 编译时类型信息
type ColumnProps = {
    width?: number;
    ellipsis?: boolean;
    fixed?: 'left' | 'right';
    labelIndex?: string;
    refColumnName?: string;
    render?: (data: any, index: string) => JSX.Element;
    // 是否启用表达式解析？默认false；
    enableExpr?: boolean;
    // 列显示内容的前缀和后缀
    prefix?: any;
    suffix?: any;
};

// 运行时类型信息
class ColumnPropsKeys implements KeyProps<ColumnProps> {
    render = true;
    refColumnName = true;
    width = true;
    ellipsis = true;
    fixed = true;
    labelIndex = true;
    enableExpr = true;
    prefix = true;
    suffix = true;
}

const Column: React.FC<ColumnProps> = (props) => {
    return <Fragment></Fragment>;
};

export default Column;

export { ColumnProps, ColumnPropsKeys };
