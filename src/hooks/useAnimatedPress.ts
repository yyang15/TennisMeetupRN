import { useCallback, useRef, useEffect, useMemo } from 'react';
import { Animated } from 'react-native';

/**
 * Provides a subtle press-in scale animation.
 * Wrap your component in Animated.View and apply animatedStyle.
 */
export function useAnimatedPress(toValue = 0.97) {
  const scale = useRef(new Animated.Value(1)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const handlePressIn = useCallback(() => {
    activeAnimation.current?.stop();
    const anim = Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    });
    activeAnimation.current = anim;
    anim.start(() => {
      activeAnimation.current = null;
    });
  }, [scale, toValue]);

  const handlePressOut = useCallback(() => {
    activeAnimation.current?.stop();
    const anim = Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    });
    activeAnimation.current = anim;
    anim.start(() => {
      activeAnimation.current = null;
    });
  }, [scale]);

  useEffect(() => {
    return () => {
      activeAnimation.current?.stop();
    };
  }, []);

  const animatedStyle = useMemo(() => ({ transform: [{ scale }] }), [scale]);

  return { animatedStyle, handlePressIn, handlePressOut };
}
