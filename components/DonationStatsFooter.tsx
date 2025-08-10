import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';

export interface DonationStatItem {
  label: string;
  value: string | number;
  icon?: string; // Ionicons name
}

interface DonationStatsFooterProps {
  stats: DonationStatItem[];
  containerStyle?: StyleProp<ViewStyle>;
}

const DonationStatsFooter: React.FC<DonationStatsFooterProps> = ({ stats, containerStyle }) => {
  const { t } = useTranslation(['donations','common']);
  if (!stats || stats.length === 0) return null;

  const topThree = stats.slice(0, 3);

  return (
    <View style={styles.sectionPanel}>

    <View style={[styles.container, containerStyle]}
      accessibilityRole="summary"
      accessibilityLabel={t('donations:statsSummary', 'סיכום סטטיסטיקות למסך זה')}
    >
      <View style={styles.row}>
        {topThree.map((s, idx) => (
          <View key={`${s.label}-${idx}`} style={styles.statChip}>
            {s.icon ? (
              <Ionicons name={s.icon as any} size={16} color={colors.textSecondary} style={{ marginBottom: 4 }} />
            ) : null}
            <Text style={styles.statLabel}>{s.label}</Text>
            <Text style={styles.statValue}>{String(s.value)}</Text>
          </View>
        ))}
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.moneyFormBackground,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 6,
  },
  sectionPanel: {
    backgroundColor: colors.moneyFormBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.moneyFormBorder,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginVertical: 10,
    marginBottom: 40,

},
  statChip: {
    flex: 1,
    backgroundColor: colors.moneyInputBackground,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.moneyFormBorder,
  },
  statLabel: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DonationStatsFooter;


