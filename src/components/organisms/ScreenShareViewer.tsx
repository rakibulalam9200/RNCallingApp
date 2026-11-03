import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CallParticipant } from '../../types/call';
import { MicroBadge } from '../atoms/MicroBadge';

let VideoTrackView: any = null;
let RTCViewComponent: any = null;

try {
  const LiveKit = require('@livekit/react-native');
  VideoTrackView = LiveKit.VideoTrack;
} catch (e) {}

try {
  const WebRTC = require('@livekit/react-native-webrtc');
  RTCViewComponent = WebRTC.RTCView;
} catch (e) {}

interface ScreenShareViewerProps {
  sharer: CallParticipant;
  track?: any;
}

export const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({
  sharer,
  track,
}) => {
  const trackRef = track?.publication ? track : sharer.screenShareTrackRef;
  const rawTrack = track?.publication ? track.publication.track : track || sharer.screenShareTrack;
  const streamURL =
    rawTrack?.mediaStream && typeof rawTrack.mediaStream.toURL === 'function'
      ? rawTrack.mediaStream.toURL()
      : null;

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
      {trackRef && VideoTrackView ? (
        <VideoTrackView
          trackRef={trackRef}
          style={styles.screenTrack}
          objectFit="contain"
        />
      ) : streamURL && RTCViewComponent ? (
        <RTCViewComponent
          streamURL={streamURL}
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

