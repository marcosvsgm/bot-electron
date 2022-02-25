import { ipcRenderer, IpcRendererEvent } from 'electron';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Log from '../../../../main/database/models/log.model';
import { TextMedium12, TextMedium14 } from '../../../layout/Fonts/medium';
import { Container, Iframe, Text, ToolBar } from './styles';

interface BombcryptoProps {}

const Bombcrypto: FC<BombcryptoProps> = ({}) => {
    const { t } = useTranslation();
    const { account } = useParams();
    const [lastLog, setLastLog] = useState('');

    useEffect(() => {
        console.log('akiii');
        const onLog: any = (e: IpcRendererEvent, log: Log) => {
            console.log('entrouuuuuuuuu aki');
            setLastLog(t(log.message, log.params));
        };
        ipcRenderer.on('log', onLog);
        return () => {
            ipcRenderer.removeListener('log', onLog);
        };
    }, []);

    const iframeBomb = useMemo(
        () => <Iframe src={'https://app.bombcrypto.io/webgl/index.html?a=' + new Date().getTime()}></Iframe>,
        [],
    );

    return (
        <Container>
            {iframeBomb}
            <ToolBar>
                <Text>
                    <TextMedium14>{t('Conta')}:</TextMedium14>
                    <TextMedium12> {account}</TextMedium12>
                </Text>
                <Text>
                    <TextMedium14>{t('Ultimo Log')}:</TextMedium14>
                    <TextMedium12> {lastLog}</TextMedium12>
                </Text>
            </ToolBar>
        </Container>
    );
};

export default Bombcrypto;