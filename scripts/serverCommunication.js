import { startGame } from "./main.js";

const eventMaps = {
  events_relay: {
    uuid: "21d32172-2710-46c6-a61b-51e807eb301a",
    events_names: {
      broadcast: "broadcast",
    },
  },
};

export function initServerCommunication() {
    const eventMapUUID = eventMaps.events_relay.uuid;
    const eventName = eventMaps.events_relay.events_names.broadcast;
    SDK3DVerse.engineAPI.registerToEvent(
      eventMapUUID,
      eventName,
      onEventReceived
    );
}

export async function broadcastEvent(event_name) {
  const eventMapUUID = eventMaps.events_relay.uuid;
  const eventName = eventMaps.events_relay.events_names.broadcast;
  await SDK3DVerse.engineAPI.fireEvent(eventMapUUID, eventName, [], {
    event_name: event_name,
    emitterUUID: SDK3DVerse.getClientUUID(),
    isFromServer: 0,
  });
  console.log("Event broadcasted", event_name);
}

async function onEventReceived(event) {
  const { dataObject } = event;
  switch (dataObject.event_name) {
    case "startGame":
    startGame();
      break;
    default:
      console.warning(
        "Received an unknown event. " +
          dataObject.event_name +
          " was not processed."
      );
      break;
  }
}