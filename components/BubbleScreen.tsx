import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter, { Engine, World, Bodies, Body, Query } from 'matter-js';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_COLOR = 'rgba(0, 122, 255, 0.45)';
const MIN_SIZE = 20;
const MAX_SIZE = 100;
const NUM_BUBBLES = 50;

// Matter.js setup
const engine = Engine.create({ enableSleeping: false });
const world = engine.world;
world.gravity.y = -0.5; // Negative gravity for floating up

// Renderer for bubble using plain Views (works on web and native without Skia)
const BubbleRenderer = ({ position, size, opacity }: any) => {
  const left = position[0] - size / 2;
  const top = position[1] - size / 2;
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: BUBBLE_COLOR,
        opacity,
      }}
    />
  );
};

// Physics system: Update Matter.js, add sway
const Physics = (entities: any, { time }: any) => {
  Engine.update(engine, time.delta);
  Object.keys(entities).forEach((key) => {
    const entity = entities[key];
    if (entity.body) {
      entity.position = [entity.body.position.x, entity.body.position.y];
      // Gentle sway force
      Body.applyForce(entity.body, entity.body.position, {
        x: Math.sin(Date.now() / 1000 + entity.phase) * 0.0005,
        y: 0,
      });
      // Remove if off-screen
      if (entity.position[1] < -MAX_SIZE) {
        World.remove(world, entity.body);
        delete entities[key];
      }
    }
  });
  return entities;
};

// Touch system: Handle taps
const Touch = (entities: any, { touches }: any) => {
  touches
    .filter((t: any) => t.type === 'press')
    .forEach((t: any) => {
      const bodies = Object.values(entities)
        .map((e: any) => e.body)
        .filter(Boolean) as Body[];
      const hits = Query.point(bodies, {
        x: t.event.pageX,
        y: t.event.pageY,
      });
      const nearest = hits[0];
      if (nearest) {
        const key = Object.keys(entities).find((k) => (entities as any)[k].body === nearest);
        if (key) {
          World.remove(world, nearest);
          delete (entities as any)[key];
        }
      }
    });
  return entities;
};

const BubbleScreen: React.FC = () => {
  const [entities, setEntities] = useState<any>({});
  const gameEngine = useRef<GameEngine | null>(null);

  // Init bubbles
  useEffect(() => {
    const newEntities: any = {};
    for (let i = 0; i < NUM_BUBBLES; i++) {
      const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;
      const opacity = 0.3 + (size / MAX_SIZE) * 0.5; // Larger = more opaque (foreground)
      const body = Bodies.circle(
        Math.random() * SCREEN_WIDTH,
        SCREEN_HEIGHT + Math.random() * SCREEN_HEIGHT, // Start below
        size / 2,
        { restitution: 0.8, frictionAir: 0.01 }
      );
      World.add(world, body);
      newEntities[i] = {
        body,
        position: [0, 0],
        size,
        opacity,
        phase: Math.random() * Math.PI * 2, // Random sway phase
        renderer: BubbleRenderer,
      };
    }
    setEntities(newEntities);
  }, []);

  // Pan gesture placeholder
  const onPan = () => {};

  // Web: GameEngine + simple View bubbles (no gesture handler)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <GameEngine style={styles.gameContainer} entities={entities} systems={[Physics, Touch]} running>
          <View style={styles.canvas}>
            {Object.values(entities).map((entity: any, index: number) => (
              entity.renderer ? <entity.renderer key={index} {...entity} /> : null
            ))}
          </View>
        </GameEngine>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={onPan}>
        <GameEngine
          style={styles.gameContainer}
          entities={entities}
          systems={[Physics, Touch]}
          running
        >
          <View style={styles.canvas}>
            {Object.values(entities).map((entity: any, index: number) => (
              entity.renderer ? <entity.renderer key={index} {...entity} /> : null
            ))}
          </View>
        </GameEngine>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gameContainer: { flex: 1 },
  canvas: { flex: 1 },
});

export default BubbleScreen;


