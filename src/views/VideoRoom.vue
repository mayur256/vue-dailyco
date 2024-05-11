<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Daily, { type DailyEvent } from '@daily-co/daily-js';


const call = Daily.createCallObject();

// lifecycle hooks
onMounted(async () => {
    setupEventListeners();

    joinRoom();
});

// State variables
const participantCounts = ref(0);

/** Handler functions - starts */

const setupEventListeners = () => {
    const events = {
        'active-speaker-change': () => console.log("active-speaker-change"),
        error: () => console.log("error"),
        'joined-meeting': handleJoin,
        'left-meeting': () => console.log("left-meeting"),
        'participant-joined': handleParticipantJoinedOrUpdated,
        'participant-left': () => console.log("participant-left"),
        'participant-updated': handleParticipantJoinedOrUpdated,
    };

    Object.entries(events).forEach(([event, handler]) => {
        call.on(event as DailyEvent, handler);
    });
}

const joinRoom = async () => {
    try {
        await call.join({ url: "https://doctodoor.daily.co/NoilsKp1NmmWKooIvVKI" });
    } catch (e) {
        console.error(e)
    }
}

const handleJoin = (event: any) => {
    console.log("Joined room")
    // Always update the participant count regardless of the event action
    updateParticipantCount();
}

/**
 * This method is responsible for creating HTML elements for the video track, attaching and playing tracks, 
 * destroying tracks, updating participant count, and updating device states.
 */
const handleParticipantJoinedOrUpdated = (event: any) => {
    console.log("participant joined")
    const { participant } = event;
    const participantId = participant.session_id;
    const isLocal = participant.local;
    const tracks = participant.tracks;

    // Always update the participant count regardless of the event action
    updateParticipantCount();

    // Create a video container if one doesn't exist
    if (!document.getElementById(`video-container-${participantId}`)) {
        createVideoContainer(participantId);
    }

    // Create an audio element for non-local participants if one doesn't exist
    if (!document.getElementById(`audio-${participantId}`) && !isLocal) {
        createAudioElement(participantId);
    }

    Object.entries(tracks).forEach(([trackType, trackInfo]: any) => {
        // If a persistentTrack exists...
        if (trackInfo.persistentTrack) {
            // Check if this is the local participant's audio track.
            // If so, we will skip playing it, as it's already being played.
            // We'll start or update tracks in all other cases.
            if (!(isLocal && trackType === 'audio')) {
                startOrUpdateTrack(trackType, trackInfo, participantId);
            }
        } /* else {
            // If the track is not available, remove the media element
            this.destroyTracks([trackType], participantId);
        }

        // Update the video UI based on the track's state
        if (trackType === 'video') {
            this.updateVideoUi(trackInfo, participantId);
        }

        // Update the camera and microphone states for the local user based on the track's state
        if (isLocal) {
            this.updateUiForDevicesState(trackType, trackInfo);
        } */
    });
}

const createAudioElement = (participantId: string) => {
    // Create an audio element for the participant
    const audioEl = document.createElement('audio');
    audioEl.id = `audio-${participantId}`;
    document.body.appendChild(audioEl);
}

const createVideoContainer = (participantId: string) => {
    // Create a video container for the participant
    const videoContainer = document.createElement('div');
    videoContainer.id = `video-container-${participantId}`;
    videoContainer.className = 'video-container';
    document.getElementById('videos')?.appendChild(videoContainer);

    // Add an overlay to display the participant's session ID
    const sessionIdOverlay = document.createElement('div');
    sessionIdOverlay.className = 'session-id-overlay';
    sessionIdOverlay.textContent = participantId;
    videoContainer.appendChild(sessionIdOverlay);

    // Create a video element for the participant
    const videoEl = document.createElement('video');
    videoEl.className = 'border border-1 video-element';
    videoContainer.appendChild(videoEl);
}


const updateParticipantCount = () => {
    participantCounts.value = call.participantCounts().present + call.participantCounts().hidden;
}

const startOrUpdateTrack = (trackType: string, track: any, participantId: string) => {
    // Construct the selector string or ID based on the trackType.
    const selector =
      trackType === 'video'
        ? `#video-container-${participantId} video.video-element`
        : `audio-${participantId}`;

    // Retrieve the specific media element from the DOM.
    const trackEl: any =
      trackType === 'video'
        ? document.querySelector(selector)
        : document.getElementById(selector);

    // Error handling if the target media element does not exist.
    if (!trackEl) {
      console.error(
        `${trackType} element does not exist for participant: ${participantId}`
      );
      return;
    }

    // Check for the need to update the media source. This is determined by
    // checking whether the existing srcObject's tracks include the new
    // persistentTrack. If there are no existing tracks or the new track is not
    // among them, an update is necessary.
    const existingTracks = trackEl.srcObject?.getTracks();
    const needsUpdate = !existingTracks?.includes(track.persistentTrack);

    // Perform the media source update if needed by setting the srcObject of
    // the target element to a new MediaStream containing the provided
    // persistentTrack.
    if (needsUpdate) {
      trackEl.srcObject = new MediaStream([track.persistentTrack]);

      // Once the media metadata is loaded, attempts to play the track. Error
      // handling for play failures is included to catch and log issues such as
      // autoplay policies blocking playback.
      trackEl.onloadedmetadata = () => {
        trackEl
          .play()
          .catch((e: any) =>
            console.error(
              `Error playing ${trackType} for participant ${participantId}:`,
              e
            )
          );
      };
    }
  }


/** Handler functions - ends */
</script>

<template>
    <main>
        <div class="container px-4 mt-4">
            <p>Participants: <strong>{{ participantCounts }}</strong></p>
            <div class="row gx-4">
                <div class="col">
                    <div class="p-3 border bg-light">User Preview</div>
                    <div id="videos"></div>
                </div>
                <!-- <div class="col">
                    <div class="p-3 border bg-light">User 2</div>
                </div> -->
            </div>
        </div>
    </main>
</template>

<style>
    video.video-element {
        height: 400px;
        width: 450px;
    }
</style>