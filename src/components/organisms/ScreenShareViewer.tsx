import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CallParticipant } from '../../types/call';
import { MicroBadge } from '../atoms/MicroBadge';

let VideoTrackView: any = null;
try {
  const LiveKit = require('@livekit/react-native');
  VideoTrackView = LiveKit.VideoTrack;
} catch (e) {}

interface ScreenShareViewerProps {
  sharer: CallParticipant;
  track?: any;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({
  sharer,
  track,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <MicroBadge
          label={`🖥️ ${sharer.name || sharer.identity}'s Screen`}
          variant="warning"
        />
      </View>

      {/* Screen Video Stream */}
      {track && VideoTrackView ? (
        <VideoTrackView
          trackRef={track}
          style={styles.screenTrack}
          objectFit="contain"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📱</Text>
          <Text style={styles.placeholderText}>
            {sharer.name || sharer.identity} is presenting their screen
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    margin: 4,
  },
  topBanner: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  screenTrack: {
    ...StyleSheet.absoluteFill,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

