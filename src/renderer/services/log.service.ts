import { ipcRenderer } from 'electron';
import Log from '../../main/database/models/log.model';
import { EVENT_LOG_LIST } from '../../main/service/events.types';
import { PaginationParams } from '../../main/service/log.types';
import { PaginationResponse } from '../../main/service/paginate.types';

const getPagination = async (params: PaginationParams): Promise<PaginationResponse<Log>> => {
    return ipcRenderer.sendSync(EVENT_LOG_LIST, params);
};

const getLastLogs = (): Promise<PaginationResponse<Log>> => {
    return ipcRenderer.sendSync(EVENT_LOG_LIST, { page: 1, orderId: 'ASC' } as PaginationParams);
};

export default { getPagination, getLastLogs };