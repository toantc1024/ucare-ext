import React, { useEffect, useState } from "react";
import "./popup.css";

const Popup = () => {
  const [user, setUser] = useState(null);

  const [minutes, setMinutes] = useState(30);
  const [timer, setTimer] = useState(null);
  useEffect(() => {
    chrome.storage.local.get(["user"], function (result) {
      // console.log("Value currently is " + JSON.stringify(result));
      setUser(result.user);
    });

    const getTimer = async () => {
      await chrome.alarms.clearAll();
      const data = await chrome.storage.sync.get("timer");
      console.log(data, data.timer);
      setMinutes(data.timer.periodInMinutes);
      setTimer(data.timer);
    };
    getTimer();

    chrome.alarms.onAlarm.addListener(() => {
      const newTimer = {
        periodInMinutes: minutes,
        timestamp: Date.now(),
      };
      setTimer(newTimer);
      chrome.storage.sync.set({ timer: newTimer });

      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "WhaleCare 🐳",
        message: "Time to drink!",
        buttons: [{ title: "Yes, on the way!" }],
        priority: 0,
      });
    });

    const drinkWater = () => {
      chrome.storage.local.set({ timeToDrink: true });
      chrome.tabs.create({ url: "options.html" });
    };

    chrome.notifications.onButtonClicked.addListener(() => {
      drinkWater();
    });
    chrome.notifications.onClicked.addListener(() => {
      drinkWater();
    });
  }, []);

  useEffect(() => {
    if (timer === null) return;
    const updateNotify = async () => {
      await chrome.alarms.clearAll();

      const { periodInMinutes, timestamp } = timer;
      const timeRemainingInMs =
        periodInMinutes * 60 * 1000 - Date.now() + timestamp;
      const timeRemainingInMinutes = timeRemainingInMs / 1000 / 60;
      console.log(timeRemainingInMinutes);

      chrome.alarms.create({
        periodInMinutes: timeRemainingInMinutes,
      });
    };
    updateNotify();
  }, [timer]);

  return (
    <div className="w-full h-[200px] flex justify-between items-center flex-col mt-0">
      {/* Header */}
      <div className="flex w-full overflow-none h-[100px] rounded-lg">
        <div className="w-40 h-40  absolute z-[-1] top-[-40px] left-[-40px] bg-gradient-to-r from-sky-400 to-sky-500 rounded-full blur-4 drop-shadow-lg"></div>
        <div
          className="w-[350px] h-[450px]  absolute z-[-2] top-[-100px] left-[-40px] bg-gradient-to-r from-emerald-400 to-sky-400
       rounded-lg blur-4"
        ></div>
      </div>
      <div className="w-full flex flex-row gap-2 justify-between items-center m-2 mt-0   bg-[rgba(255,255,255,.5)] p-2 blur-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white text-shadow-sm">
          WhaleCare
        </h1>
        <button
          onClick={() => {
            chrome.tabs.create({ url: "options.html" });
          }}
          className={
            user
              ? "h-10 w-10 hover:cursor-pointer hover:bg-gray-200 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 flex items-center justify-center text-white text-xl font-bold"
              : "w-20 text-white bg-primary-600 hover:bg-primary-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 flex justify-center items-center "
          }
        >
          {user ? "W" : "Login"}
        </button>
      </div>

      <div className="w-[250px] mb-8 rounded-lg  flex flex-col gap-2 justify-between items-center backdrop-blur-sm border-[rgba(255,255,255,.3)] border-[1px] p-4 b">
        <label htmlFor="timePicker" className="text-xl font-bold text-white">
          Time to notify
        </label>
        <select
          name="timePicker"
          value={minutes}
          onChange={(e) => {
            setMinutes(parseInt(e.target.value));
          }}
        >
          {[2, 5.5, 30, 45, 90].map((time) => {
            return <option value={time}>{`${time} minutes`}</option>;
          })}
        </select>

        <button
          onClick={async (e) => {
            console.log(minutes);
            const newTimer = {
              periodInMinutes: minutes,
              timestamp: Date.now(),
            };
            setTimer(newTimer);
            chrome.storage.sync.set({ timer: newTimer });

            // chrome.alarms.create({
            //   periodInMinutes: 0.5,
            // });
          }}
          className="w-40 text-white bg-primary-600 hover:bg-primary-700 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 flex justify-center items-center "
        >
          Set time
        </button>
      </div>
    </div>
  );
};

export default Popup;
