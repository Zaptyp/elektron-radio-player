import schedule from "node-schedule";
import {killPlayer, playMusic, playOnDemand, playPlaylist} from "./MusicPlayer.js";
import {getApiData} from "./ApiConnector.js";
import {autoRemoveFiles, downloader, getTrackInfo} from "./MusicDownloader.js";

function taskNumber() {
    let n = 0
    for (let i in schedule.scheduledJobs) {
        n = n+1
    }
    return console.log('[Funkcja taskNumber] Liczba zadań:', n);
}

function scheduleMusicTask(time, id) {
    schedule.scheduleJob(time, function () {
        playPlaylist(id);
        console.log(id)
    });
}

function scheduleKillTask(time) {
    schedule.scheduleJob(time, killPlayer);
}

async function massSchedule() {
    await schedule.gracefulShutdown();
    schedule.scheduleJob('0 5 * * 1-5', autoRemoveFiles);
    const data = await getApiData();
    if (!data.isOn) {
        taskNumber();
        return console.error('[Funkcja massSchedule] Brakuje danych!!!')
    }
    const time = data.timeRules.rules;
    const day = data.timeRules.applyRule;
    const currentPlaylist = data.currentPlaylistId;

    const dayMapping = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 7
    };

    const mappedDays = {};

    for (const i in day) {
        if (day.hasOwnProperty(i)) {
            const mappedDay = dayMapping[i];
            mappedDays[mappedDay] = day[i];
        }
    }

    for (let l in mappedDays) {
        if (mappedDays[l] === 0) continue;
        for (let i in time[mappedDays[l]]) {
            // console.log(time[1][i])
            // console.log(data[1][i].start.split(':').reverse().join(' '));
            // console.log(data[1][i].end.split(':').reverse().join(' '));
            let id = currentPlaylist;
            // console.log(time[mappedDays[l]][i].playlist)
            if (time[mappedDays[l]][i].playlist !== undefined) {
                id = time[mappedDays[l]][i].playlist;
            }
            if (time[mappedDays[l]][i].OnDemand !== undefined) {
                console.log('ONDEMAND OMAJGAH!!!1!111!!1!1!!!');
                await downloader(time[mappedDays[l]][i].OnDemand);
                const trackInfo = await getTrackInfo(time[mappedDays[l]][i].OnDemand);
                // console.log(trackInfo)
                schedule.scheduleJob(`${time[mappedDays[l]][i].end.split(':').reverse().join(' ')} * * ${l}`, function () {
                    playOnDemand(trackInfo.name);
                    console.log('On Demand:', trackInfo.name, 'by', trackInfo.artists.join(' '));
                });
                scheduleKillTask(`${time[mappedDays[l]][i].start.split(':').reverse().join(' ')} * * ${l}`);
                continue;
            }
            scheduleMusicTask(`${time[mappedDays[l]][i].end.split(':').reverse().join(' ')} * * ${l}`, {id});
            scheduleKillTask(`${time[mappedDays[l]][i].start.split(':').reverse().join(' ')} * * ${l}`);
        }
    }
    // console.log(time, day);

    // scheduleMusicTask(`18 17 * * 1-5`, 'Twilight');
    // scheduleKillTask(`19 17 * * 1-5`);
    taskNumber();
}

export { scheduleMusicTask, scheduleKillTask, massSchedule };