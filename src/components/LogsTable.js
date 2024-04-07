import React, {useEffect, useState} from 'react';
import {Button, Form, Header, Input, Label, Pagination, Segment, Select, Table} from 'semantic-ui-react';
import {API, isAdmin, showError, showInfo, timestamp2string} from '../helpers';

import {ITEMS_PER_PAGE} from '../constants';
import {renderQuota} from '../helpers/render';

function renderTimestamp(timestamp) {
    return (
        <>
            {timestamp2string(timestamp)}
        </>
    );
}

const MODE_OPTIONS = [
    {key: 'all', text: '全部用户', value: 'all'},
    {key: 'self', text: '当前用户', value: 'self'}
];

const LOG_OPTIONS = [
    {key: '0', text: '全部', value: 0},
    {key: '1', text: '充值', value: 1},
    {key: '2', text: '消费', value: 2},
    {key: '3', text: '管理', value: 3},
    {key: '4', text: '系统', value: 4}
];

function renderType(type) {
    switch (type) {
        case 1:
            return <Label basic color='green'> 充值 </Label>;
        case 2:
            return <Label basic color='olive'> 消费 </Label>;
        case 3:
            return <Label basic color='orange'> 管理 </Label>;
        case 4:
            return <Label basic color='purple'> 系统 </Label>;
        default:
            return <Label basic color='black'> 未知 </Label>;
    }
}

const LogsTable = () => {
    const [key, setKey] = useState('')
    const [balance, setBalance] = useState(0)
    const [usage, setUsage] = useState(0)
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searching, setSearching] = useState(false);
    const [logType, setLogType] = useState(0);
    const isAdminUser = isAdmin();
    let now = new Date();
    const [inputs, setInputs] = useState({
        username: '',
        token_name: '',
        model_name: '',
        start_timestamp: timestamp2string(0),
        end_timestamp: timestamp2string(now.getTime() / 1000 + 3600)
    });
    const {username, token_name, model_name, start_timestamp, end_timestamp} = inputs;

    const [stat, setStat] = useState({
        quota: 0,
        token: 0
    });

    const handleInputChange = (e, {name, value}) => {
        setInputs((inputs) => ({...inputs, [name]: value}));
    };

    const getLogSelfStat = async () => {
        // let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        // let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        // let res = await API.get(`/api/log/self/stat?type=${logType}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`);
        // const { success, message, data } = res.data;
        // if (success) {
        //   setStat(data);
        // } else {
        //   showError(message);
        // }
    };

    const getLogStat = async () => {
        // let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        // let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        // let res = await API.get(`/api/log/stat?type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`);
        // const { success, message, data } = res.data;
        // if (success) {
        //   setStat(data);
        // } else {
        //   showError(message);
        // }
    };

    const loadLogs = async (startIdx) => {
        // let url = '';
        // let localStartTimestamp = Date.parse(start_timestamp) / 1000;
        // let localEndTimestamp = Date.parse(end_timestamp) / 1000;
        // if (isAdminUser) {
        //   url = `/api/log/?p=${startIdx}&type=${logType}&username=${username}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
        // } else {
        //   url = `/api/log/self/?p=${startIdx}&type=${logType}&token_name=${token_name}&model_name=${model_name}&start_timestamp=${localStartTimestamp}&end_timestamp=${localEndTimestamp}`;
        // }
        // const res = await API.get(url);
        // const { success, message, data } = res.data;
        // if (success) {
        //   if (startIdx === 0) {
        //     setLogs(data);
        //   } else {
        //     let newLogs = [...logs];
        //     newLogs.splice(startIdx * ITEMS_PER_PAGE, data.length, ...data);
        //     setLogs(newLogs);
        //   }
        // } else {
        //   showError(message);
        // }
        // setLoading(false);
    };

    const onPaginationChange = (e, {activePage}) => {
        (async () => {
            if (activePage === Math.ceil(logs.length / ITEMS_PER_PAGE) + 1) {
                // In this case we have to load more data and then append them.
                await loadLogs(activePage - 1);
            }
            setActivePage(activePage);
        })();
    };

    const refresh = async () => {
        setLoading(true);
        setActivePage(1)
        await loadLogs(0);
        // if (isAdminUser) {
        //   getLogStat().then();
        // } else {
        //   getLogSelfStat().then();
        // }
    };

    // useEffect(() => {
    //   refresh().then();
    // }, [logType]);

    const searchLogs = async () => {
        if (key === '') {
            alert('请输入搜索关键字');
            return;
        }
        console.log(key);
        setSearching(true);
        const res = await API.get( process.env.REACT_APP_BASE_URL +  `/api/log/token?key=${key}`);
        const {success, message, data} = res.data;
        if (success) {
            setLogs(data);
            var quota = 0
            for (let i = 0; i < data.length; i++) {
                quota += data[i].quota
            }
            setStat({
                quota: quota,
            })
            setActivePage(1);
        } else {
            alert("查询失败，请输入正确的key");
        }
        setSearching(false);
    };

    const getBalance = async () => {
        if (key === '') {
            alert('请输入你的key');
        }
        try {
            const subscription = await API.get( process.env.REACT_APP_BASE_URL +  `/v1/dashboard/billing/subscription`, {headers: {Authorization: `Bearer ${key}`}});
            const subscriptionData = subscription.data;
            setBalance(subscriptionData.hard_limit_usd);
        } catch (e) {
            // alert("查询失败，请输入正确的key");
        }
        //设置开始日期为100天前，结束时间为现在 yyyy-mm-dd
        let now = new Date();
        let start = new Date(now.getTime() - 100 * 24 * 3600 * 1000);
        let start_date = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate();
        let end_date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
        const res = await API.get( process.env.REACT_APP_BASE_URL +  `/v1/dashboard/billing/usage?start_date=${start_date}&end_date=${end_date}`, {headers: {Authorization: `Bearer ${key}`}});
        const data = res.data;
        setUsage(data.total_usage/100)
    }

    const handleKeywordChange = async (e, {value}) => {
        setSearchKeyword(value.trim());
    };

    const sortLog = (key) => {
        if (logs.length === 0) return;
        setLoading(true);
        let sortedLogs = [...logs];
        if (typeof sortedLogs[0][key] === 'string') {
            sortedLogs.sort((a, b) => {
                return ('' + a[key]).localeCompare(b[key]);
            });
        } else {
            sortedLogs.sort((a, b) => {
                if (a[key] === b[key]) return 0;
                if (a[key] > b[key]) return -1;
                if (a[key] < b[key]) return 1;
            });
        }
        if (sortedLogs[0].id === logs[0].id) {
            sortedLogs.reverse();
        }
        setLogs(sortedLogs);
        setLoading(false);
    };

    return (
        <>
            <div style={{
                width: '100%',
            }}>
                <Input placeholder='请输入key' value={key} name='token' action={
                    <Button icon='search' onClick={
                        () => {
                            console.log(process.env.REACT_APP_SHOW_BALANCE);
                            console.log(typeof process.env.REACT_APP_SHOW_BALANCE);
                            console.log(process.env.REACT_APP_SHOW_BALANCE === 'true');
                            if (process.env.REACT_APP_SHOW_BALANCE == "true") {
                                getBalance();
                            }
                            if (process.env.REACT_APP_SHOW_DETAIL == 'true') {
                                searchLogs();
                            }
                        }
                    } loading={searching}/>
                } onChange={
                    (e, {value}) => setKey(value)
                }
                       style={{
                           width: '50%',
                       }}
                />
            </div>
            <Segment>
                <Header as='h3'>
                    {process.env.REACT_APP_SHOW_BALANCE == "true" && <span>订阅总额：{balance}$</span>}
                    <br/>
                    {process.env.REACT_APP_SHOW_DETAIL == "true" && <span>已用额度：{usage}$</span>}
                </Header>
                {process.env.REACT_APP_SHOW_DETAIL == "true" &&
                    <Table basic compact size='small'>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('created_time');
                                    }}
                                    width={2}
                                >
                                    时间
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('type');
                                    }}
                                    width={1}
                                >
                                    类型
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('model_name');
                                    }}
                                    width={2}
                                >
                                    模型
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('prompt_tokens');
                                    }}
                                    width={1}
                                >
                                    提示
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('completion_tokens');
                                    }}
                                    width={1}
                                >
                                    补全
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('quota');
                                    }}
                                    width={2}
                                >
                                    消耗额度
                                </Table.HeaderCell>
                                <Table.HeaderCell
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                        sortLog('content');
                                    }}
                                    width={isAdminUser ? 4 : 5}
                                >
                                    详情
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {logs
                                .slice(
                                    (activePage - 1) * ITEMS_PER_PAGE,
                                    activePage * ITEMS_PER_PAGE
                                )
                                .map((log, idx) => {
                                    if (log.deleted) return <></>;
                                    return (
                                        <Table.Row key={log.created_at}>
                                            <Table.Cell>{renderTimestamp(log.created_at)}</Table.Cell>
                                            <Table.Cell>{renderType(log.type)}</Table.Cell>
                                            <Table.Cell>{log.model_name ?
                                                <Label basic>{log.model_name}</Label> : ''}</Table.Cell>
                                            <Table.Cell>{log.prompt_tokens ? log.prompt_tokens : ''}</Table.Cell>
                                            <Table.Cell>{log.completion_tokens ? log.completion_tokens : ''}</Table.Cell>
                                            <Table.Cell>{log.quota ? renderQuota(log.quota, 6) : ''}</Table.Cell>
                                            <Table.Cell>{log.content}</Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                        </Table.Body>

                        <Table.Footer>
                            <Table.Row>
                                <Table.HeaderCell colSpan={'9'}>
                                    {/*<Select*/}
                                    {/*  placeholder='选择明细分类'*/}
                                    {/*  options={LOG_OPTIONS}*/}
                                    {/*  style={{ marginRight: '8px' }}*/}
                                    {/*  name='logType'*/}
                                    {/*  value={logType}*/}
                                    {/*  onChange={(e, { name, value }) => {*/}
                                    {/*    setLogType(value);*/}
                                    {/*  }}*/}
                                    {/*/>*/}
                                    {/*<Button size='small' onClick={refresh} loading={loading}>刷新</Button>*/}
                                    <Pagination
                                        floated='right'
                                        activePage={activePage}
                                        onPageChange={onPaginationChange}
                                        size='small'
                                        siblingRange={1}
                                        totalPages={
                                            Math.ceil(logs.length / ITEMS_PER_PAGE) +
                                            (logs.length % ITEMS_PER_PAGE === 0 ? 1 : 0)
                                        }
                                    />
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Footer>
                    </Table>
                }
            </Segment>
        </>
    );
};

export default LogsTable;
