import {logger} from "./Logger.js";
import {massSchedule} from "./TaskScheduler.js";
import {checkUpdate, scheduleUpdate} from "./ApiConnector.js";
import {default as www} from "../api/app.js";
import {DebugStarter} from "./DebugMode.js";
import {killVLCatStartup} from "./Other.js";

async function POST() {
    logger('POST', '------------------------------');
    logger('POST', '    elektron-radio-player');
    logger('POST', '        By PFilip :>');
    logger('POST', '       and Zaptyp ;w;');
    logger('POST', '------------------------------');
    await DebugStarter();
    logger('verbose', `Wykryto system: ${process.platform}`, 'POST');
    if (process.platform === "win32") {
        logger('verbose', 'System Windows nie jest obsługiwany', 'POST');
        logger('error', 'okna niedozwolone');
        logger('verbose', 'Wywalanie procesu z kodem 2', 'POST');
        return process.exit(2);
    }
    if (process.env.WWW || false) {
        logger('task', 'Aktywowanie lokalnego API', 'POST');
        www();
    }
    if (process.env.KILL_AT_STARTUP === 'true') {
        killVLCatStartup();
    }
    logger('task', 'Planowanie zadań…', 'POST');
    await massSchedule();
    logger('task', 'Aktywowanie automatycznych aktualizacji z API', 'POST');
    await checkUpdate();
    setInterval(() => {
        scheduleUpdate();
    }, 1000);
    logger('ready', 'Git');
}

export { POST };