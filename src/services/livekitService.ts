import { CallParticipant, ChatMessage, CallType } from '../types/call';
import { LIVEKIT_CONFIG } from '../config/livekitConfig';

// Safely import native dependencies
let LiveKitClient: any = null;
let InCallManager: any = null;

try {
  LiveKitClient = require('livekit-client');
} catch (e) {
  console.log('[LiveKit] Client SDK not yet linked, using simulated bridge.');
}

try {
  InCallManager = require('react-native-incall-manager').default || require('react-native-incall-manager');
} catch (e) {
  console.log('[InCallManager] Native module not yet linked.');
}

export class LiveKitService {
  private room: any = null;

  public async connect(
    wsUrl: string,
    token: string,
    callbacks: {
      onParticipantsChanged: (participants: CallParticipant[]) => void;
      onActiveSpeakerChanged: (speakerId?: string) => void;
      onScreenShareChanged: (sharer?: CallParticipant, track?: any) => void;
      onChatMessageReceived: (msg: ChatMessage) => void;
      onDisconnected: () => void;
    },
    callType: CallType = 'group'
  ) {
    if (InCallManager) {
      InCallManager.start({ media: 'video' });
      InCallManager.setSpeakerphoneOn(true);
    }

    if (!LiveKitClient || !LiveKitClient.Room) {
      console.warn('[LiveKitService] Running in UI simulation mode.');
      return this.simulateConnection(callbacks, callType);
    }

    try {
      this.room = new LiveKitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: LIVEKIT_CONFIG.VIDEO_PRESETS,
        publishDefaults: {
          simulcast: true,
          screenShareEncoding: LIVEKIT_CONFIG.SCREEN_SHARE_PRESETS,
        },
      });

      const { RoomEvent } = LiveKitClient;

      // Participant events
      const updateParticipants = () => {
        const list: CallParticipant[] = [];

        // Local participant
        if (this.room.localParticipant) {
          const lp = this.room.localParticipant;
          const localVideoPub =
            lp.getTrackPublication(LiveKitClient.Track.Source.Camera) ||
            lp.videoTrackPublications?.values()?.next()?.value;
          const localTrack = localVideoPub?.track || localVideoPub?.videoTrack;

          list.push({
            identity: lp.identity,
            name: lp.name || lp.identity,
            isLocal: true,
            isSpeaking: lp.isSpeaking,
            isMuted: !lp.isMicrophoneEnabled,
            isVideoEnabled: lp.isCameraEnabled,
            isScreenSharing: lp.isScreenShareEnabled,
            videoTrack: localTrack,
            screenShareTrack: lp.getTrackPublication(LiveKitClient.Track.Source.ScreenShare)?.track,
          });
        }

        // Remote participants
        if (this.room.remoteParticipants) {
          this.room.remoteParticipants.forEach((rp: any) => {
            const videoPub =
              rp.getTrackPublication(LiveKitClient.Track.Source.Camera) ||
              Array.from(rp.videoTrackPublications.values())[0] as any;
            const screenPub = rp.getTrackPublication(LiveKitClient.Track.Source.ScreenShare);

            list.push({
              identity: rp.identity,
              name: rp.name || rp.identity,
              isLocal: false,
              isSpeaking: rp.isSpeaking,
              isMuted: !rp.isMicrophoneEnabled,
              isVideoEnabled: rp.isCameraEnabled,
              isScreenSharing: rp.isScreenShareEnabled,
              videoTrack: videoPub?.track || videoPub?.videoTrack,
              screenShareTrack: screenPub?.track,
            });
          });
        }

        callbacks.onParticipantsChanged(list);

        // Check if anyone is sharing screen
        const screenSharer = list.find((p) => p.isScreenSharing);
        callbacks.onScreenShareChanged(
          screenSharer,
          screenSharer?.screenShareTrack
        );
      };

      this.room
        .on(RoomEvent.ParticipantConnected, updateParticipants)
        .on(RoomEvent.ParticipantDisconnected, updateParticipants)
        .on(RoomEvent.TrackSubscribed, updateParticipants)
        .on(RoomEvent.TrackUnsubscribed, updateParticipants)
        .on(RoomEvent.LocalTrackPublished, updateParticipants)
        .on(RoomEvent.LocalTrackUnpublished, updateParticipants)
        .on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
          updateParticipants();
          if (speakers && speakers.length > 0) {
            callbacks.onActiveSpeakerChanged(speakers[0].identity);
          } else {
            callbacks.onActiveSpeakerChanged(undefined);
          }
        })
        .on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any) => {
          try {
            const text = new TextDecoder().decode(payload);
            const data = JSON.parse(text);
            callbacks.onChatMessageReceived({
              id: `${Date.now()}_${Math.random()}`,
              sender: participant?.name || participant?.identity || 'Peer',
              message: data.text,
              timestamp: Date.now(),
              isLocal: false,
            });
          } catch (e) {
            console.error('Failed to parse data message', e);
          }
        })
        .on(RoomEvent.Disconnected, () => {
          if (InCallManager) InCallManager.stop();
          callbacks.onDisconnected();
        });

      await this.room.connect(wsUrl, token);

      // Enable local microphone and camera by default
      await this.room.localParticipant.setMicrophoneEnabled(true);
      await this.room.localParticipant.setCameraEnabled(true);

      updateParticipants();
    } catch (error) {
      console.error('[LiveKitService] Connect error:', error);
      throw error;
    }
  }

  public async setMicrophoneEnabled(enabled: boolean) {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    }
  }

  public async setCameraEnabled(enabled: boolean) {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setCameraEnabled(enabled);
    }
  }

  public async setScreenShareEnabled(enabled: boolean) {
    if (this.room?.localParticipant) {
      await this.room.localParticipant.setScreenShareEnabled(enabled);
    }
  }

  public async flipCamera() {
    if (this.room?.localParticipant) {
      const videoTrack = this.room.localParticipant.getTrackPublication(
        LiveKitClient?.Track?.Source?.Camera
      )?.videoTrack;
      if (videoTrack?.restart) {
        // Toggle facing mode
        await videoTrack.restart({
          facingMode: videoTrack.facingMode === 'user' ? 'environment' : 'user',
        });
      }
    }
  }

  public setSpeakerphoneOn(on: boolean) {
    if (InCallManager) {
      InCallManager.setSpeakerphoneOn(on);
    }
  }

  public async sendChatMessage(text: string) {
    if (this.room?.localParticipant) {
      const payload = JSON.stringify({ text });
      const encoded = new TextEncoder().encode(payload);
      await this.room.localParticipant.publishData(encoded, {
        reliable: true,
      });
    }
  }

  public disconnect() {
    if (InCallManager) InCallManager.stop();
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }

  // Simulated fallback for immediate UI testing before credentials are added
  private simulateConnection(callbacks: any, callType: CallType = 'group') {
    const mockList: CallParticipant[] =
      callType === 'direct'
        ? [
            {
              identity: 'local_user',
              name: 'You (Host)',
              isLocal: true,
              isSpeaking: false,
              isMuted: false,
              isVideoEnabled: true,
              isScreenSharing: false,
            },
            {
              identity: 'user_direct_peer',
              name: 'Sarah Jenkins (Direct)',
              isLocal: false,
              isSpeaking: true,
              isMuted: false,
              isVideoEnabled: false,
              isScreenSharing: false,
            },
          ]
        : [
            {
              identity: 'local_user',
              name: 'You (Host)',
              isLocal: true,
              isSpeaking: false,
              isMuted: false,
              isVideoEnabled: true,
              isScreenSharing: false,
            },
            {
              identity: 'user_alex',
              name: 'Alex (4G Mobile)',
              isLocal: false,
              isSpeaking: true,
              isMuted: false,
              isVideoEnabled: false,
              isScreenSharing: false,
            },
            {
              identity: 'user_sarah',
              name: 'Sarah (Wi-Fi)',
              isLocal: false,
              isSpeaking: false,
              isMuted: false,
              isVideoEnabled: false,
              isScreenSharing: false,
            },
          ];

    callbacks.onParticipantsChanged(mockList);
    callbacks.onActiveSpeakerChanged(
      callType === 'direct' ? 'user_direct_peer' : 'user_alex'
    );
  }
}

export const livekitService = new LiveKitService();

