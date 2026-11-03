import {
  CallParticipant,
  ChatMessage,
  CallType,
  SignalingPacket,
} from '../types/call';
import { LIVEKIT_CONFIG } from '../config/livekitConfig';

// Safely import native dependencies
let LiveKitClient: any = null;
let LiveKitRN: any = null;
let InCallManager: any = null;

try {
  LiveKitClient = require('livekit-client');
} catch (e) {
  console.log('[LiveKit] Client SDK not yet linked, using simulated bridge.');
}

try {
  LiveKitRN = require('@livekit/react-native');
} catch (e) {
  console.log('[LiveKitRN] Native module not yet linked.');
}

try {
  InCallManager =
    require('react-native-incall-manager').default ||
    require('react-native-incall-manager');
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
      onScreenShareChanged: (sharer?: CallParticipant, trackRef?: any) => void;
      onChatMessageReceived: (msg: ChatMessage) => void;
      onPacketReceived?: (packet: SignalingPacket) => void;
      onDisconnected: () => void;
    },
    callType: CallType = 'group',
    audioOnly: boolean = false
  ) {
    // 1. Start native LiveKit AudioSession & InCallManager for hardware echo cancellation & routing
    try {
      if (LiveKitRN?.AudioSession) {
        await LiveKitRN.AudioSession.configureAudio({
          android: {
            preferredOutputList: audioOnly
              ? ['bluetooth', 'headset', 'earpiece', 'speaker']
              : ['bluetooth', 'headset', 'speaker', 'earpiece'],
            audioTypeOptions: LiveKitRN.AndroidAudioTypePresets.communication,
          },
          ios: {
            defaultOutput: audioOnly ? 'earpiece' : 'speaker',
          },
        });
        await LiveKitRN.AudioSession.startAudioSession();
      } else if (InCallManager) {
        InCallManager.start({ media: audioOnly ? 'audio' : 'video' });
        InCallManager.setSpeakerphoneOn(!audioOnly);
      }
    } catch (audioErr) {
      console.warn('[AudioSession] Audio initialization warning:', audioErr);
    }

    if (
      !LiveKitClient ||
      !LiveKitClient.Room ||
      token === 'sandbox_token' ||
      !token ||
      wsUrl.includes('demo-calling-app')
    ) {
      console.warn(
        '[LiveKitService] Running in UI simulation mode (live server credentials not configured).'
      );
      return this.simulateConnection(callbacks, callType, audioOnly);
    }

    try {
      const videoPresets =
        callType === 'direct'
          ? LIVEKIT_CONFIG.DIRECT_CALL_VIDEO_PRESETS
          : LIVEKIT_CONFIG.VIDEO_PRESETS;

      this.room = new LiveKitClient.Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: videoPresets,
          facingMode: 'user',
        },
        publishDefaults: {
          simulcast: true,
          videoSimulcastLayers: [
            LiveKitClient.VideoPresets?.h180,
            LiveKitClient.VideoPresets?.h360,
          ].filter(Boolean),
          screenShareEncoding: LIVEKIT_CONFIG.SCREEN_SHARE_PRESETS,
        },
      });

      const { RoomEvent, Track } = LiveKitClient;

      // Participant & Track events
      const updateParticipants = () => {
        if (!this.room) return;
        const list: CallParticipant[] = [];

        // Local participant
        if (this.room.localParticipant) {
          const lp = this.room.localParticipant;
          const localVideoPub =
            lp.getTrackPublication(Track.Source.Camera) ||
            lp.videoTrackPublications?.values()?.next()?.value;
          const localScreenPub = lp.getTrackPublication(
            Track.Source.ScreenShare
          );
          const localTrack = localVideoPub?.track || localVideoPub?.videoTrack;

          list.push({
            identity: lp.identity || 'local_user',
            name: lp.name || lp.identity || 'You',
            isLocal: true,
            isSpeaking: Boolean(lp.isSpeaking),
            isMuted: !lp.isMicrophoneEnabled,
            isVideoEnabled: Boolean(lp.isCameraEnabled),
            isScreenSharing: Boolean(lp.isScreenShareEnabled),
            videoTrack: localTrack,
            screenShareTrack: localScreenPub?.track,
            videoTrackRef: localVideoPub
              ? {
                  participant: lp,
                  publication: localVideoPub,
                  source: Track.Source.Camera,
                }
              : undefined,
            screenShareTrackRef: localScreenPub
              ? {
                  participant: lp,
                  publication: localScreenPub,
                  source: Track.Source.ScreenShare,
                }
              : undefined,
          });
        }

        // Remote participants
        if (this.room.remoteParticipants) {
          this.room.remoteParticipants.forEach((rp: any) => {
            const videoPub =
              rp.getTrackPublication(Track.Source.Camera) ||
              (Array.from(rp.videoTrackPublications?.values() || [])[0] as any);
            const screenPub = rp.getTrackPublication(Track.Source.ScreenShare);

            list.push({
              identity: rp.identity,
              name: rp.name || rp.identity,
              isLocal: false,
              isSpeaking: Boolean(rp.isSpeaking),
              isMuted: !rp.isMicrophoneEnabled,
              isVideoEnabled: Boolean(rp.isCameraEnabled),
              isScreenSharing: Boolean(rp.isScreenShareEnabled),
              videoTrack: videoPub?.track || videoPub?.videoTrack,
              screenShareTrack: screenPub?.track,
              videoTrackRef: videoPub
                ? {
                    participant: rp,
                    publication: videoPub,
                    source: Track.Source.Camera,
                  }
                : undefined,
              screenShareTrackRef: screenPub
                ? {
                    participant: rp,
                    publication: screenPub,
                    source: Track.Source.ScreenShare,
                  }
                : undefined,
            });
          });
        }

        callbacks.onParticipantsChanged(list);

        // Check if anyone is sharing screen
        const screenSharer = list.find((p) => p.isScreenSharing);
        callbacks.onScreenShareChanged(
          screenSharer,
          screenSharer?.screenShareTrackRef || screenSharer?.screenShareTrack
        );
      };

      this.room
        .on(RoomEvent.ParticipantConnected, updateParticipants)
        .on(RoomEvent.ParticipantDisconnected, updateParticipants)
        .on(RoomEvent.TrackSubscribed, updateParticipants)
        .on(RoomEvent.TrackUnsubscribed, updateParticipants)
        .on(RoomEvent.TrackMuted, updateParticipants)
        .on(RoomEvent.TrackUnmuted, updateParticipants)
        .on(RoomEvent.LocalTrackPublished, updateParticipants)
        .on(RoomEvent.LocalTrackUnpublished, updateParticipants)
        .on(RoomEvent.ParticipantMetadataChanged, updateParticipants)
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
            const senderName =
              data.sender ||
              participant?.name ||
              participant?.identity ||
              'Peer';

            if (data.type && callbacks.onPacketReceived) {
              callbacks.onPacketReceived({
                ...data,
                sender: senderName,
              });
              return;
            }

            if (data.text) {
              callbacks.onChatMessageReceived({
                id: data.id || `${Date.now()}_${Math.random()}`,
                sender: senderName,
                message: data.text,
                timestamp: data.timestamp || Date.now(),
                isLocal: false,
              });
            }
          } catch (e) {
            console.error('Failed to parse data message', e);
          }
        })
        .on(RoomEvent.Disconnected, () => {
          this.stopAudioSession();
          callbacks.onDisconnected();
        });

      await this.room.connect(wsUrl, token);

      // Enable local microphone and camera according to pre-call choice
      await this.room.localParticipant.setMicrophoneEnabled(true);
      await this.room.localParticipant.setCameraEnabled(!audioOnly);

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
      const videoPub = this.room.localParticipant.getTrackPublication(
        LiveKitClient?.Track?.Source?.Camera
      );
      const videoTrack = videoPub?.videoTrack || videoPub?.track;
      if (videoTrack?.restartTrack) {
        const currentFacing = videoTrack.options?.facingMode || 'user';
        await videoTrack.restartTrack({
          facingMode: currentFacing === 'user' ? 'environment' : 'user',
        });
      } else if (videoTrack?.restart) {
        await videoTrack.restart({
          facingMode: videoTrack.facingMode === 'user' ? 'environment' : 'user',
        });
      }
    }
  }

  public async setSpeakerphoneOn(on: boolean) {
    try {
      if (LiveKitRN?.AudioSession) {
        await LiveKitRN.AudioSession.selectAudioOutput(
          on ? 'speaker' : 'earpiece'
        );
      }
      if (InCallManager) {
        InCallManager.setSpeakerphoneOn(on);
      }
    } catch (e) {
      console.warn('[Audio] Failed to switch speaker output', e);
    }
  }

  public async sendPacket(packet: SignalingPacket) {
    if (this.room?.localParticipant) {
      const payload = JSON.stringify(packet);
      const encoded = new TextEncoder().encode(payload);
      await this.room.localParticipant.publishData(encoded, {
        reliable: true,
      });
    }
  }

  public async sendChatMessage(text: string, id?: string, sender?: string) {
    await this.sendPacket({
      type: 'CHAT',
      id: id || `${Date.now()}_${Math.random()}`,
      sender: sender || 'Peer',
      text,
      timestamp: Date.now(),
    });
  }

  private stopAudioSession() {
    try {
      if (LiveKitRN?.AudioSession) {
        LiveKitRN.AudioSession.stopAudioSession();
      }
      if (InCallManager) {
        InCallManager.stop();
      }
    } catch {}
  }

  public disconnect() {
    this.stopAudioSession();
    if (this.room) {
      this.room.disconnect();
      this.room = null;
    }
  }

  // Simulated fallback for immediate UI testing before credentials are added
  private simulateConnection(
    callbacks: any,
    callType: CallType = 'group',
    audioOnly: boolean = false
  ) {
    const mockList: CallParticipant[] =
      callType === 'direct'
        ? [
            {
              identity: 'local_user',
              name: 'You (Host)',
              isLocal: true,
              isSpeaking: false,
              isMuted: false,
              isVideoEnabled: !audioOnly,
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
              isVideoEnabled: !audioOnly,
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


