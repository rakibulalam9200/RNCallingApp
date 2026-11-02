import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { CallParticipant } from '../../types/call';
import { ParticipantTile } from '../molecules/ParticipantTile';

interface VideoGridProps {
  participants: CallParticipant[];
  activeSpeakerIdentity?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  activeSpeakerIdentity,
}) => {
  const total = participants.length;

  if (total === 0) {
    return <View style={styles.emptyContainer} />;
  }

  // 1 Participant (Solo / waiting for others)
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

  // 2 Participants (1-on-1 Call: Split 50/50 vertically)
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

  // 3 or 4 Participants (2x2 Balanced Grid)
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

  // 5 to 10+ Participants:
  // "Spotlight + Thumbnail Rail" Architecture:
  // Active speaker takes the large center stage; other participants are on a horizontal bottom rail.
  // This drastically optimizes mobile GPU, decoding threads, and battery!
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

