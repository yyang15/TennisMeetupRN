import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Provides a subtle press-in scale animation.
 * Wrap your component in Animated.View and apply animatedStyle.
 */
export function useAnimatedPress(toValue = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scale, toValue]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  }, [scale]);

  const animatedStyle = { transform: [{ scale }] };

  return { animatedStyle, handlePressIn, handlePressOut };
}
