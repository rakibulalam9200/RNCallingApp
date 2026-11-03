import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MicroButton } from '../atoms/MicroButton';
import { LIVEKIT_CONFIG } from '../../config/livekitConfig';

interface LobbyTemplateProps {
  onJoinRoom: (
    roomName: string,
    userName: string,
    isAudioOnly: boolean,
    callType: 'group' | 'direct',
  ) => void;
  isLoading?: boolean;
}

export const LobbyTemplate: React.FC<LobbyTemplateProps> = ({
  onJoinRoom,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [roomName, setRoomName] = useState(LIVEKIT_CONFIG.DEFAULT_ROOM_NAME);
  const [userName, setUserName] = useState(LIVEKIT_CONFIG.DEFAULT_USER_NAME);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'group' | 'direct'>('group');

  const handleJoin = () => {
    if (!roomName.trim() || !userName.trim()) return;
    onJoinRoom(roomName.trim(), userName.trim(), isAudioOnly, activeTab);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Branding */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>📡</Text>
          <Text style={styles.appTitle}>RNCalling Meet</Text>
          <Text style={styles.appSubtitle}>
            10+ Group Calls • Screen Share • Free WebRTC SFU
          </Text>
        </View>

        {/* Tab Selector: Group Call vs 1-on-1 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'group' && styles.activeTab]}
            onPress={() => {
              setActiveTab('group');
              setRoomName('group-call-room');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'group' && styles.activeTabText,
              ]}
            >
              👥 Group Call (10+)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'direct' && styles.activeTab]}
            onPress={() => {
              setActiveTab('direct');
              setRoomName('direct-call-room');
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'direct' && styles.activeTabText,
              ]}
            >
              📞 1-on-1 Direct Call
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.label}>YOUR DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#64748B"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>
            {activeTab === 'group' ? 'ROOM NAME OR CODE' : 'DIRECT CALL ROOM'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              activeTab === 'group'
                ? 'e.g. standup-room-1'
                : 'e.g. john-calling-sarah'
            }
            placeholderTextColor="#64748B"
            value={roomName}
            onChangeText={setRoomName}
            autoCapitalize="none"
          />

          {/* Quick Pre-call Toggles */}
          <View style={styles.togglesRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, isAudioOnly && styles.toggleBtnActive]}
              onPress={() => setIsAudioOnly(!isAudioOnly)}
            >
              <Text style={styles.toggleText}>
                {isAudioOnly
                  ? '🔇 Joining as Audio Only'
                  : '📹 Video & Audio Enabled'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Join Call Button */}
          <TouchableOpacity
            style={[styles.joinBtn, isLoading && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={isLoading}
          >
            <Text style={styles.joinBtnText}>
              {isLoading
                ? 'Connecting to Room...'
                : activeTab === 'group'
                ? '🚀 Join Group Call'
                : '📞 Start 1-on-1 Call'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Highlights */}
        {/* <View style={styles.featuresCard}>
          <Text style={styles.featuresHeading}>
            🚀 Architecture Capabilities
          </Text>
          <Text style={styles.featureItem}>
            ✅ <Text style={styles.bold}>10+ Simultaneous Users:</Text> Single
            SFU upload stream prevents mobile lag & battery drain.
          </Text>
          <Text style={styles.featureItem}>
            ✅ <Text style={styles.bold}>Android Screen Share:</Text> Native
            Android MediaProjection broadcast.
          </Text>
          <Text style={styles.featureItem}>
            ✅ <Text style={styles.bold}>Cellular & Wi-Fi Ready:</Text> Built-in
            global TURN traversal.
          </Text>
          <Text style={styles.featureItem}>
            ✅ <Text style={styles.bold}>In-Call Chat:</Text> Real-time data
            channel messaging.
          </Text>
        </View> */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  togglesRow: {
    marginVertical: 16,
  },
  toggleBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  toggleBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  toggleText: {
    color: '#93C5FD',
    fontWeight: '600',
    fontSize: 13,
  },
  joinBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtnDisabled: {
    backgroundColor: '#475569',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  featuresCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featuresHeading: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 3,
    lineHeight: 18,
  },
  bold: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
});
