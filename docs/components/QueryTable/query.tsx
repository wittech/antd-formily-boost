import {
    Table,
    SpaceDivider,
    useForm,
    useQuery,
    Link,
} from 'antd-formily-boost';
import { createSchemaField, observer, FormConsumer } from '@formily/react';
import { Button } from 'antd';
import {
    Input,
    Select,
    FormItem,
    Submit,
    Form,
    Space,
    FormGrid,
} from '@formily/antd';
import { Field, onFieldReact, onFieldInputValueChange } from '@formily/core';
import { Card, Spin } from 'antd';
import Model, { delay, User } from './model';

const SchemaField = createSchemaField({
    components: {
        Input,
        Select,
        FormItem,
        Space,
        Button,
        Submit,
        Table,
        SpaceDivider,
        FormGrid,
        Link,
    },
});

const model = new Model(1000);

const QueryList: React.FC<any> = observer((props) => {
    let fetchTrigger = () => {};
    const { form } = useForm({
        values: {
            //current设置为0，也会被自动调整
            pagination: { current: 0, pageSize: 10, total: 0 },
            list: [] as User[],
            filter: {},
        },
        effects: () => {
            onFieldReact('list.*.operatorion.del', (f) => {
                const field = f as Field;
                const id = field.query('..id').value();
                field.componentProps.onClick = async () => {
                    await delay(10);
                    //这里应该调用ajax，我们这里直接删除数据
                    model.del(id);
                    fetchTrigger();
                };
            });
            onFieldInputValueChange('pagination.*(current,pageSize)', () => {
                fetch();
            });
        },
    });
    const { fetch, loading } = useQuery(async (axios) => {
        await delay(10);
        //正常是用useQuery传入的axios参数拉代码
        //let data = axios({});
        //我们这里用自己的数据
        let result = model.findData(form.values.filter, form.values.pagination);
        form.values.list = result.data;
        form.values.pagination.total = result.count;
    });
    fetchTrigger = fetch;
    const querySchema = (
        <SchemaField>
            <SchemaField.Object
                //填写数据的name
                name="filter"
                x-decorator="FormGrid"
                x-decorator-props={{
                    minColumns: 3,
                    maxColumns: 3,
                    columnGap: 20,
                }}
            >
                <SchemaField.String
                    name="name"
                    title="名字"
                    x-decorator="FormItem"
                    x-component="Input"
                    x-component-props={{}}
                />
            </SchemaField.Object>
        </SchemaField>
    );
    const listSchema = (
        <SchemaField>
            <SchemaField.Array
                //填写数据的name
                name="list"
                x-component="Table"
                x-component-props={{
                    //传入分页信息
                    pagination: 'pagination',
                    paginationProps: {
                        showQuickJumper: true,
                        showSizeChanger: true,
                        showTotal: true,
                    },
                }}
            >
                <SchemaField.Void>
                    <SchemaField.Void
                        title="ID"
                        x-component="Table.Column"
                        x-component-props={{
                            labelIndex: 'id',
                        }}
                    />
                    <SchemaField.Void
                        title="名称"
                        x-component="Table.Column"
                        x-component-props={{
                            labelIndex: 'name',
                        }}
                    />
                    <SchemaField.Void
                        title="年龄"
                        x-component="Table.Column"
                        x-component-props={{
                            labelIndex: 'age',
                        }}
                    />
                    <SchemaField.Void title="操作" x-component="Table.Column">
                        <SchemaField.Void
                            name="operatorion"
                            title="操作"
                            x-component="SpaceDivider"
                        >
                            <SchemaField.Void
                                name="del"
                                title="删除"
                                x-component="Link"
                                x-component-props={{}}
                            />
                        </SchemaField.Void>
                    </SchemaField.Void>
                </SchemaField.Void>
            </SchemaField.Array>
        </SchemaField>
    );
    return (
        <Form form={form}>
            <Spin spinning={loading}>
                <Space
                    direction="vertical"
                    style={{ display: 'flex' }}
                    size={20}
                >
                    <Card>
                        <Space style={{ display: 'flex' }} direction="vertical">
                            {querySchema}
                            <Space
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Button
                                    type="primary"
                                    onClick={() => {
                                        fetch();
                                    }}
                                >
                                    查询
                                </Button>
                                <Button
                                    onClick={() => {
                                        data.filter = {};
                                        data.pagination.current = 1;
                                        fetch();
                                    }}
                                >
                                    重置
                                </Button>
                            </Space>
                        </Space>
                    </Card>
                    <Card
                        title="列表"
                        extra={
                            <Space>
                                <Button type="primary" onClick={() => {}}>
                                    添加
                                </Button>
                            </Space>
                        }
                    >
                        {listSchema}
                    </Card>
                </Space>
            </Spin>
        </Form>
    );
});

export default QueryList;
