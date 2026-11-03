import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { CallParticipant, CallType } from '../../types/call';
import { ParticipantTile } from '../molecules/ParticipantTile';

interface VideoGridProps {
  participants: CallParticipant[];
  activeSpeakerIdentity?: string;
  callType?: CallType;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  activeSpeakerIdentity,
  callType = 'group',
}) => {
  const [isSwapped, setIsSwapped] = useState(false);
  const total = participants.length;

  if (total === 0) {
    return <View style={styles.emptyContainer} />;
  }

  // ==========================================
  // 1-ON-1 DIRECT CALL INTERFACE
  // True full-screen remote video + floating local PiP (FaceTime / WhatsApp style)
  // ==========================================
  if (callType === 'direct') {
    if (total === 1) {
      // Waiting for the other person to join
      return (
        <View style={styles.container}>
          <ParticipantTile
            participant={participants[0]}
            style={styles.fullScreenTile}
            isSpotlight
            zOrder={0}
          />
          <View style={styles.waitingOverlay}>
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingIcon}>⏳</Text>
              <Text style={styles.waitingTitle}>Calling...</Text>
              <Text style={styles.waitingSubtitle}>
                Waiting for the other person to connect
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // 2 Participants in 1-on-1: Remote full-screen + Local floating PiP
    const remoteUser =
      participants.find((p) => !p.isLocal) || participants[1];
    const localUser =
      participants.find((p) => p.isLocal) || participants[0];

    const mainParticipant = isSwapped ? localUser : remoteUser;
    const pipParticipant = isSwapped ? remoteUser : localUser;

    return (
      <View style={styles.directContainer}>
        {/* Full Screen Main Video */}
        <ParticipantTile
          participant={mainParticipant}
          style={styles.directFullScreenTile}
          isSpotlight
          zOrder={0}
        />

        {/* Floating Picture-in-Picture (PiP) Tile */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.pipWrapper}
          onPress={() => setIsSwapped(!isSwapped)}
        >
          <ParticipantTile
            participant={pipParticipant}
            style={styles.pipTile}
            zOrder={1}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // ==========================================
  // GROUP CALL INTERFACE (10+ Users)
  // ==========================================

  // 1 Participant (Solo / waiting)
  if (total === 1) {
    return (
      <View style={styles.container}>
        <ParticipantTile
          participant={participants[0]}
          style={styles.fullScreenTile}
          isSpotlight
        />
      </View>
    );
  }

  // 2 Participants in Group Call: 50/50 vertical split
  if (total === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.twoParticipantCol}>
          <ParticipantTile
            participant={participants[0]}
            style={styles.halfScreenTile}
          />
          <ParticipantTile
            participant={participants[1]}
            style={styles.halfScreenTile}
          />
        </View>
      </View>
    );
  }

  // 3 or 4 Participants: 2x2 Balanced Grid
  if (total <= 4) {
    return (
      <View style={styles.container}>
        <View style={styles.grid2x2}>
          {participants.map((p) => (
            <ParticipantTile
              key={p.identity}
              participant={p}
              style={styles.tile2x2}
            />
          ))}
        </View>
      </View>
    );
  }

  // 5 to 10+ Participants: Spotlight + Thumbnail Rail
  const activeSpeaker =
    participants.find((p) => p.identity === activeSpeakerIdentity) ||
    participants.find((p) => p.isSpeaking) ||
    participants[0];

  const otherParticipants = participants.filter(
    (p) => p.identity !== activeSpeaker.identity
  );

  return (
    <View style={styles.container}>
      {/* Main Spotlight Participant */}
      <View style={styles.spotlightWrapper}>
        <ParticipantTile
          participant={activeSpeaker}
          style={styles.spotlightTile}
          isSpotlight
        />
      </View>

      {/* Horizontal Thumbnail Rail for Remaining Participants */}
      <View style={styles.railWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.railContent}
        >
          {otherParticipants.map((p) => (
            <ParticipantTile
              key={p.identity}
              participant={p}
              style={styles.railTile}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
  },
  directContainer: {
    flex: 1,
    position: 'relative',
  },
  directFullScreenTile: {
    ...StyleSheet.absoluteFill,
    borderRadius: 0,
    borderWidth: 0,
  },
  pipWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 110,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pipTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0,
  },
  waitingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  waitingBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  waitingIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  waitingTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  waitingSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  fullScreenTile: {
    flex: 1,
    margin: 4,
  },
  twoParticipantCol: {
    flex: 1,
    flexDirection: 'column',
  },
  halfScreenTile: {
    flex: 1,
    margin: 4,
  },
  grid2x2: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile2x2: {
    width: '48%',
    height: '48%',
    margin: '1%',
  },
  spotlightWrapper: {
    flex: 1,
    marginBottom: 8,
  },
  spotlightTile: {
    flex: 1,
  },
  railWrapper: {
    height: 120,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 14,
    paddingVertical: 6,
  },
  railContent: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  railTile: {
    width: 100,
    height: 106,
    marginHorizontal: 4,
  },
});
