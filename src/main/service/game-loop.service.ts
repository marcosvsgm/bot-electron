import Config from '../database/models/config.model';
import { getTime, sleep, timeToMinutes } from '../util/time';
import configService from './config.service';
import gameActionService from './game-action.service';
import { ActionsConfig, ActionsStartConfig, Browser } from './game-loop.types';
import logService from './log.service';

export class GameLoop {
    static instance: GameLoop;
    public config: Config[];
    public actions: ActionsConfig[];
    public actionsStart: ActionsStartConfig[];
    public browsers: Browser[];

    public execute: boolean = true;

    windowName = 'Bombcrypto';

    constructor() {}

    static getInstance() {
        if (GameLoop.instance) return GameLoop.instance;

        GameLoop.instance = new GameLoop();
        return GameLoop.instance;
    }

    async start() {
        try {
            await this.initActions();
            await this.getConfig();
            await this.getBrowsers();
            await this.execActionsStart();
            await this.loop();
        } catch (e) {
            console.log(e);
            logService.registerLog('Ocorreu algum erro: {{error}}', { error: JSON.stringify(e.message) });
        }
    }

    private async execActionsStart() {
        for (let browser of this.browsers) {
            for (let action of this.actionsStart) {
                await action.action.start(browser);
            }
        }
    }

    private async loop() {
        while (this.execute) {
            for (let browser of this.browsers) {
                if ((await this.checkAccount(browser)) == false) return;

                const currentTime = getTime();

                for (let action of this.actions) {
                    if (!this.execute) return;

                    const lastExecute = timeToMinutes(currentTime - action.lastTime);
                    const checkTime = lastExecute > action.time;

                    if (checkTime) {
                        action.lastTime = currentTime;
                        await action.action.start(browser);
                    }
                }

                await sleep(1000);
            }
        }
    }

    private async checkAccount(browser: Browser) {
        if (!browser.account) {
            await logService.registerLog(
                'Para executar as ações, é necessário o que o BOT consiga pega o ID da metamask. BOT não esta conseguindo abrir a metamask e copiar o id. Reinicie o BOT',
            );
            return false;
        }
        return true;
    }

    private async initActions() {
        await logService.registerLog('Buscando ações da serem executadas');
        const actions = await gameActionService.getAll({
            order: {
                order: 'ASC',
            },
        });

        this.actions = [];
        this.actionsStart = [];

        for (let action of actions) {
            const { [action.className]: classAction } = await import(`./game-actions/${action.fileName}`);

            if (action.loop) {
                this.actions.push({
                    time: action.time,
                    lastTime: action.startTime ? getTime() : 0,
                    action: classAction.getInstance(),
                });
            } else {
                this.actionsStart.push({
                    action: classAction.getInstance(),
                });
            }
        }
    }

    private async getBrowsers() {
        await logService.registerLog('Encontrado {{qty}} janela(s) com nome de {{nameWindow}}', {
            nameWindow: this.windowName,
            qty: '2',
        });
        this.browsers = [{}];
    }
    public getConfigByName(name: string, valueDefault: string) {
        const config = this.config.find((c) => c.name == name);

        return config.value || valueDefault;
    }
    private async getConfig() {
        await logService.registerLog('Buscando configurações');
        this.config = await configService.getConfigSystem();
    }
}