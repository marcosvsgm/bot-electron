import React, { FC, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Spinner, Table } from 'reactstrap';
import { PaginationParams } from '../../../../main/service/map.types';
import { AccountService, LogService, MapService } from '../../../services';
import { LOG_LIST } from '../../../utils/react-query';
import { TableFilter } from '../../molecules';
import Pagination from '../Pagination';
import { ContainerPagination, ContainerSpinner, TextTotal } from './styles';

interface LogListProps {}

const LogList: FC<LogListProps> = ({}) => {
    const refTable = useRef(null);
    const [params, setParams] = useState<PaginationParams>({
        page: 1,
        created: null,
        account: null,
    } as PaginationParams);

    const { data, isLoading } = useQuery([LOG_LIST, params], () => LogService.getPagination(params));

    const {
        i18n: { language },
        t,
    } = useTranslation();

    const handleChangePage = (page: number) => {
        setParams((old) => ({
            ...old,
            page,
        }));
        refTable.current.scrollIntoView({ behavior: 'smooth' });
    };

    const handleChangeFilter = useCallback((name: string, value: string | number) => {
        setParams((old) => ({
            ...old,
            [name]: value,
            page: 1,
        }));
    }, []);

    return (
        <>
            <div ref={refTable} />
            <Table borderless dark hover responsive striped>
                <thead>
                    <tr>
                        <th>{t('Conta')}</th>
                        <th>{t('Log')}</th>
                        <th>{t('Data')}</th>
                    </tr>
                    <tr>
                        <td>
                            <TableFilter
                                title="Busca pelo id da metamask ou nome da conta"
                                value={params.account}
                                name="account"
                                onChange={handleChangeFilter}
                            />
                        </td>
                        <td></td>
                        <td>
                            <TableFilter
                                type="date"
                                value={params.account}
                                name="created"
                                onChange={handleChangeFilter}
                            />
                        </td>
                    </tr>
                </thead>

                <tbody>
                    {!isLoading &&
                        data.items.map((item) => (
                            <tr key={item.id.toString()}>
                                <td>{item.account && AccountService.getName(item.account)}</td>
                                <td>{t(item.message, item.params)}</td>
                                <td>
                                    {item.created.toLocaleDateString(language, {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    })}
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>

            {isLoading && (
                <ContainerSpinner>
                    <Spinner />
                </ContainerSpinner>
            )}
            {data && (
                <ContainerPagination>
                    <Pagination totalPages={data.totalPages} onChangePage={handleChangePage} page={data.page} />
                </ContainerPagination>
            )}
        </>
    );
};

export default LogList;