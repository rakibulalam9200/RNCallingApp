import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { CallParticipant } from '../../types/call';
import { MicroAvatar } from '../atoms/MicroAvatar';
import { MicroTag } from '../atoms/MicroTag';
import { MicroBadge } from '../atoms/MicroBadge';

// Try loading native VideoTrack component safely
let VideoTrackView: any = null;
try {
  const LiveKit = require('@livekit/react-native');
  VideoTrackView = LiveKit.VideoTrack;
} catch (e) {
  // Graceful fallback during development/mocking
}

interface ParticipantTileProps {
  participant: CallParticipant;
  style?: ViewStyle;
  isSpotlight?: boolean;
}

export const ParticipantTile: React.FC<ParticipantTileProps> = ({
  participant,
  style,
  isSpotlight = false,
}) => {
  const hasVideo = participant.isVideoEnabled && participant.videoTrack;

  return (
    <View
      style={[
        styles.tileContainer,
        participant.isSpeaking && styles.speakingBorder,
        style,
      ]}
    >
      {/* Video Stream or Avatar Fallback */}
      {hasVideo && VideoTrackView ? (
        <VideoTrackView
          trackRef={participant.videoTrack}
          style={styles.videoTrack}
          mirror={participant.isLocal}
          objectFit="cover"
        />
      ) : (
        <View style={styles.avatarContainer}>
          <MicroAvatar
            name={participant.name || participant.identity}
            size={isSpotlight ? 72 : 44}
            isSpeaking={participant.isSpeaking}
          />
        </View>
      )}

      {/* Screen Sharing Indicator */}
      {participant.isScreenSharing && (
        <View style={styles.screenShareBadge}>
          <MicroBadge label="🖥️ Sharing Screen" variant="warning" />
        </View>
      )}

      {/* Speaking Indicator Badge for Spotlight */}
      {participant.isSpeaking && (
        <View style={styles.speakingBadge}>
          <MicroBadge label="🎙️ Speaking" variant="success" />
        </View>
      )}

      {/* Bottom Name & Mic Tag */}
      <View style={styles.bottomBar}>
        <MicroTag
          name={participant.name || participant.identity}
          isMuted={participant.isMuted}
          isLocal={participant.isLocal}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tileContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  speakingBorder: {
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  videoTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  speakingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  screenShareBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
});

