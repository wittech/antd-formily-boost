import { useField } from '@formily/react';
import { TablePaginationConfig } from 'antd';
import { useForm } from '@formily/react';
import React, { useEffect } from 'react';

export type PaginationType = string;

export type PaginationTypeInner = {
    current: number;
    pageSize: number;
    total?: number;
};

type PaginationPropsType = {
    defaultPageSize?: number;
    showQuickJumper?: boolean;
    showSizeChanger?: boolean;
    showTotal?: boolean;
    pageSizeOptions?: string[];
};

function getFieldNeighborAddress(address: string, fieldName: string) {
    let lastDotIndex = address.lastIndexOf('.');
    if (lastDotIndex > 0) {
        return address.substring(0, lastDotIndex) + '.' + fieldName;
    } else {
        return fieldName;
    }
}

function getPagination(
    totalSize: number,
    pagination?: PaginationType,
    paginationProps?: PaginationPropsType,
): TablePaginationConfig | false {
    if (!pagination) {
        return false;
    }
    const form = useForm();
    const field = useField();
    const address = field.address.toString();
    const paginationWrapper = {
        setCurrent: (current: number) => {
            const field = form.createField({
                name: getFieldNeighborAddress(address, pagination + '.current'),
            });
            if (field) {
                field.onInput(current);
            }
        },
        setPageSize: (pageSize: number) => {
            const field = form.createField({
                name: getFieldNeighborAddress(
                    address,
                    pagination + '.pageSize',
                ),
            });
            if (field) {
                field.onInput(pageSize);
            }
        },
        getCurrent: (): number => {
            const field = form.createField({
                name: getFieldNeighborAddress(address, pagination + '.current'),
            });
            if (field.value == undefined) {
                return 1;
            } else {
                return field.value;
            }
        },
        getPageSize: (): number => {
            const field = form.createField({
                name: getFieldNeighborAddress(
                    address,
                    pagination + '.pageSize',
                ),
            });
            if (field.value == undefined) {
                return paginationProps?.defaultPageSize || 10;
            } else {
                return field.value;
            }
        },
        getTotal: (): number | undefined => {
            const field = form.createField({
                name: getFieldNeighborAddress(address, pagination + '.total'),
            });
            return field?.value;
        },
    };
    // 重新当前页
    const oldCurrent = paginationWrapper.getCurrent();
    const paginationResult: PaginationTypeInner = {
        current: oldCurrent,
        pageSize: paginationWrapper.getPageSize(),
        total: paginationWrapper.getTotal(),
    };
    if (paginationResult.current < 1) {
        paginationResult.current = 1;
    }
    if (paginationResult.total == undefined) {
        paginationResult.total = totalSize;
    }
    let maxPage = Math.ceil(paginationResult.total / paginationResult.pageSize);
    if (maxPage < 1) {
        maxPage = 1;
    }

    useEffect(() => {
        if (oldCurrent < 1) {
            paginationWrapper.setCurrent(1);
        }
        if (oldCurrent > maxPage) {
            paginationWrapper.setCurrent(maxPage);
        }
    }, [oldCurrent, maxPage]);

    let result: TablePaginationConfig = {
        current: paginationResult.current,
        onChange: (current: number) => {
            paginationWrapper.setCurrent(current);
        },
        pageSize: paginationResult.pageSize,
        onShowSizeChange: (current: number, pageSize: number) => {
            paginationWrapper.setCurrent(current);
            paginationWrapper.setPageSize(pageSize);
        },
        total: paginationResult.total,
        showQuickJumper: paginationProps?.showQuickJumper,
        showSizeChanger: paginationProps?.showSizeChanger,
        pageSizeOptions: paginationProps?.pageSizeOptions,
        showTotal: paginationProps?.showTotal
            ? (total, range) => `共${total}条`
            : undefined,
    };
    return result;
}

export default getPagination;

const PaginationPropsTypeForDoc: React.FC<PaginationPropsType> = (props) => {
    return <span />;
};

const PaginationTypeForDoc: React.FC<PaginationType> = (props) => {
    return <span />;
};

export { PaginationPropsType, PaginationTypeForDoc, PaginationPropsTypeForDoc };
