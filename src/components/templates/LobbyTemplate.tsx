import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LIVEKIT_CONFIG,
  loadRuntimeConfig,
  saveRuntimeConfig,
} from '../../config/livekitConfig';

interface LobbyTemplateProps {
  onJoinRoom: (
    roomName: string,
    userName: string,
    isAudioOnly: boolean,
    callType: 'group' | 'direct',
  ) => void;
  onSimulateIncomingCall?: (callerName: string, roomName: string, isVideo: boolean) => void;
  isLoading?: boolean;
}

const QUICK_CONTACTS = [
  { id: 'sarah', name: 'Sarah Jenkins', status: 'Online • Product Design', room: 'direct-sarah' },
  { id: 'alex', name: 'Alex Rivera', status: 'Online • Mobile Eng', room: 'direct-alex' },
  { id: 'elena', name: 'Elena Rostova', status: 'Available • AI Lead', room: 'direct-elena' },
];

export const LobbyTemplate: React.FC<LobbyTemplateProps> = ({
  onJoinRoom,
  onSimulateIncomingCall,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [roomName, setRoomName] = useState(LIVEKIT_CONFIG.DEFAULT_ROOM_NAME);
  const [userName, setUserName] = useState(LIVEKIT_CONFIG.DEFAULT_USER_NAME);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'group' | 'direct'>('group');

  // Runtime Server Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [wsUrl, setWsUrl] = useState(LIVEKIT_CONFIG.DEFAULT_WS_URL);
  const [tokenServerUrl, setTokenServerUrl] = useState(
    LIVEKIT_CONFIG.TOKEN_SERVER_URL
  );
  const [staticToken, setStaticToken] = useState(
    LIVEKIT_CONFIG.STATIC_DEV_TOKEN
  );

  useEffect(() => {
    loadRuntimeConfig().then((cfg) => {
      setWsUrl(cfg.wsUrl);
      setTokenServerUrl(cfg.tokenServerUrl);
      setStaticToken(cfg.staticToken);
    });
  }, []);

  const handleSaveSettings = async () => {
    await saveRuntimeConfig({ wsUrl, tokenServerUrl, staticToken });
    setShowSettings(false);
  };

  const isLiveConfigured =
    (!wsUrl.includes('demo-calling-app') &&
      !tokenServerUrl.includes('demo-calling-token-server')) ||
    Boolean(staticToken.trim());

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
          <View style={styles.headerTopRow}>
            <View style={styles.modeBadge}>
              <View
                style={[
                  styles.modeDot,
                  { backgroundColor: isLiveConfigured ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text style={styles.modeText}>
                {isLiveConfigured ? 'Live SFU Connected' : 'UI Demo Mode'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.settingsBtnText}>⚙️ Server Setup</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.appIcon}>📡</Text>
          <Text style={styles.appTitle}>RNCalling Meet</Text>
          <Text style={styles.appSubtitle}>
            10+ Group Calls • 1-on-1 HD • Chat & Emoji • Screen Share
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

        {/* Quick 1-on-1 Contacts & Incoming Call Simulator */}
        {activeTab === 'direct' && (
          <View style={styles.contactsCard}>
            <View style={styles.contactsHeaderRow}>
              <Text style={styles.contactsTitle}>⚡ QUICK 1-ON-1 CONTACTS</Text>
              {onSimulateIncomingCall && (
                <TouchableOpacity
                  style={styles.simIncomingBtn}
                  onPress={() =>
                    onSimulateIncomingCall('Sarah Jenkins', 'direct-sarah', true)
                  }
                >
                  <Text style={styles.simIncomingText}>🔔 Test Incoming Ring</Text>
                </TouchableOpacity>
              )}
            </View>

            {QUICK_CONTACTS.map((contact) => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactStatus}>{contact.status}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.audioCallMiniBtn}
                    onPress={() =>
                      onJoinRoom(
                        contact.room,
                        userName.trim() || 'You',
                        true,
                        'direct'
                      )
                    }
                  >
                    <Text style={styles.callMiniIcon}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.videoCallMiniBtn}
                    onPress={() =>
                      onJoinRoom(
                        contact.room,
                        userName.trim() || 'You',
                        false,
                        'direct'
                      )
                    }
                  >
                    <Text style={styles.callMiniIcon}>📹</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Server Configuration Modal (Allows configuring LiveKit in Release APK) */}
        <Modal
          visible={showSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>⚙️ LiveKit SFU & Token Setup</Text>
              <Text style={styles.modalSubtitle}>
                Configure your LiveKit Cloud URL & Token Server (or paste a dev token) directly inside the Release APK.
              </Text>

              <Text style={styles.label}>LIVEKIT WEBSOCKET URL (WSS)</Text>
              <TextInput
                style={styles.input}
                placeholder="wss://your-project.livekit.cloud"
                placeholderTextColor="#64748B"
                value={wsUrl}
                onChangeText={setWsUrl}
                autoCapitalize="none"
              />

              <Text style={styles.label}>TOKEN SERVER URL (EXPRESS / FIREBASE)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-token-server.onrender.com"
                placeholderTextColor="#64748B"
                value={tokenServerUrl}
                onChangeText={setTokenServerUrl}
                autoCapitalize="none"
              />

              <Text style={styles.label}>
                STATIC JWT TOKEN (OPTIONAL OVERRIDE FOR QUICK TEST)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Paste JWT token from cloud.livekit.io..."
                placeholderTextColor="#64748B"
                value={staticToken}
                onChangeText={setStaticToken}
                autoCapitalize="none"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowSettings(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveSettings}
                >
                  <Text style={styles.modalSaveText}>Save Config</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  modeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  settingsBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  settingsBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  contactsCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactsTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  simIncomingBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  simIncomingText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  contactStatus: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  audioCallMiniBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  videoCallMiniBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  callMiniIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 17,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  modalCancelText: {
    color: '#E2E8F0',
    fontWeight: '600',
    fontSize: 13,
  },
  modalSaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
