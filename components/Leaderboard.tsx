"use client";

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Simple SVG-like components using React Native Views for icons
const BackArrowIcon = () => (
  <View style={iconStyles.backArrow}>
    <View style={iconStyles.arrowLine} />
    <View style={iconStyles.arrowHead} />
  </View>
);

const QuestionMarkIcon = () => (
  <View style={iconStyles.questionCircle}>
    <Text style={iconStyles.questionText}>?</Text>
  </View>
);

const LeaderboardHeader = () => {
  const [activeTab, setActiveTab] = React.useState('Honour');

  const tabs = ['Honour', 'Charm', 'Room Compact'];

  return (
    <View style={styles.container}>
      {/* Top Row: Back Arrow, Tabs, Question Mark */}
      <View style={styles.topRow}>
        {/* Left: Back Arrow Icon */}
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Go back')}>
          <BackArrowIcon />
        </TouchableOpacity>

        {/* Middle: Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right: Question Mark Icon */}
        <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Show help')}>
          <QuestionMarkIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A0A2E', // Deep purple night background
    paddingTop: 50, // Status bar spacing
    paddingBottom: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: 3,
    marginHorizontal: 8,
    height: 38,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1A0A2E',
    fontWeight: '700',
  },
});

// Icon Styles
const iconStyles = StyleSheet.create({
  backArrow: {
    width: 20,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLine: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    top: 8,
    left: 2,
  },
  arrowHead: {
    width: 10,
    height: 10,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    left: 1,
    top: 4,
    borderRadius: 1.5,
  },
  questionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default LeaderboardHeader;
