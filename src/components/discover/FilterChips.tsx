import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../Chip';
import { spacing } from '../../theme';
import { FilterOption, filterOptions } from '../../data/mockSessions';

interface FilterChipsProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filterOptions.map((filter) => (
        <Chip
          key={filter}
          label={filter}
          active={activeFilter === filter}
          onPress={() => onFilterChange(filter)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
});
