import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText = 'See All',
  onActionPress,
  className = '',
}) => {
  return (
    <View className={`flex-row justify-between items-center px-4 mb-3.5 ${className}`}>
      <Text className="text-lg font-black text-slate-900 tracking-tight">{title}</Text>
      {onActionPress && (
        <TouchableOpacity onPress={onActionPress} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text className="text-orange-500 font-extrabold text-xs tracking-wide uppercase">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
